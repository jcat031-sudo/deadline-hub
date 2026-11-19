// Fetches a handful of general market-news RSS feeds, dedupes, and writes
// public/news.json. No API keys needed. Run by .github/workflows/news-fetch.yml
// every 30 minutes, and safe to run locally with `npm run fetch-news`.

import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "public", "news.json");
const MAX_ITEMS = 30;
// No single source may take up more than this many of the final slots, so one
// high-volume feed can't crowd the others out after the recency sort.
const MAX_PER_SOURCE = 10;

// Four independent publishers (not just CNBC sub-sections) so the final list
// is actually a mix, not duplicates of the same newsroom's stories.
const FEEDS = [
  { source: "CNBC", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
  { source: "MarketWatch", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories" },
  { source: "Investing.com", url: "https://www.investing.com/rss/news_25.rss" },
  { source: "Benzinga", url: "https://www.benzinga.com/feed" },
];

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(str) {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => NAMED_ENTITIES[name])
    .trim();
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function parsePubDate(raw) {
  if (!raw) return new Date().toISOString();
  // Investing.com-style "YYYY-MM-DD HH:MM:SS" with no timezone -> assume UTC.
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) {
    return new Date(raw.replace(" ", "T") + "Z").toISOString();
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

async function fetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DeadlineHubBot/1.0)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${feed.source}: HTTP ${res.status}`);
  const xml = await res.text();
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return itemBlocks.map((block) => ({
    title: extractTag(block, "title"),
    link: extractTag(block, "link").trim(),
    source: feed.source,
    publishedAt: parsePubDate(extractTag(block, "pubDate")),
  }));
}

async function main() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const allItems = [];
  let failures = 0;
  results.forEach((r, i) => {
    const feed = FEEDS[i];
    if (r.status === "fulfilled") {
      console.log(`${feed.source}: fetched ${r.value.length} item(s)`);
      allItems.push(...r.value);
    } else {
      failures++;
      // ::error:: annotations surface directly in the GitHub Actions run summary,
      // not just buried in the log text.
      console.log(`::error title=Feed failed: ${feed.source}::${feed.url} — ${r.reason}`);
    }
  });

  if (failures === FEEDS.length) {
    console.log("::error::All feeds failed, leaving existing news.json untouched.");
    process.exit(1);
  }

  const seen = new Set();
  const deduped = [];
  for (const item of allItems) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key) || !item.link) continue;
    seen.add(key);
    deduped.push(item);
  }

  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Cap per source so one high-volume feed can't crowd out the others.
  const perSourceCount = {};
  const final = [];
  for (const item of deduped) {
    const count = perSourceCount[item.source] ?? 0;
    if (count >= MAX_PER_SOURCE) continue;
    perSourceCount[item.source] = count + 1;
    final.push(item);
    if (final.length >= MAX_ITEMS) break;
  }

  console.log("Final mix: " + Object.entries(perSourceCount).map(([s, n]) => `${s}=${n}`).join(", "));
  if (failures > 0) {
    console.log(`::warning::${failures} of ${FEEDS.length} feed(s) failed this run; see the error annotations above.`);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    items: final,
  };

  await writeFile(OUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${output.items.length} items to ${OUT_PATH}`);
}

// Keep the previous file if something unexpected throws.
main().catch(async (err) => {
  console.error("fetch-news failed:", err);
  try {
    await readFile(OUT_PATH);
    console.error("Leaving existing news.json in place.");
  } catch {
    // no existing file either; nothing more we can do
  }
  process.exit(1);
});
