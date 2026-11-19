import { useCallback, useEffect, useState } from "react";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string; // ISO
}

interface NewsFile {
  generatedAt: string;
  items: NewsItem[];
}

const CACHE_KEY = "deadline-hub:news-cache:v1";

function timeAgo(iso: string, now: Date): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export default function Finance() {
  const [news, setNews] = useState<NewsFile | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkedNote, setCheckedNote] = useState("");
  const [, forceTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setCheckedNote("");
    try {
      // No cache-busting query param: the service worker's runtime cache (used
      // as the offline fallback) keys by URL, and a different query string on
      // every refresh would mean that fallback could never match. `cache:
      // "no-store"` already guarantees this specific request skips the HTTP
      // cache, and the service worker's NetworkFirst rule (see vite.config.ts)
      // guarantees it always tries the network first regardless.
      const res = await fetch(`${import.meta.env.BASE_URL}news.json`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data: NewsFile = await res.json();
      // The fetch succeeding doesn't mean there's anything NEW — the feed is
      // only regenerated when the GitHub Action runs, which isn't tied to
      // this tap. Say so explicitly instead of leaving it ambiguous.
      setNews((prev) => {
        if (prev && prev.generatedAt === data.generatedAt) {
          setCheckedNote("Checked — no new headlines since last refresh.");
        }
        return data;
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      setError(news ? "Couldn't refresh — showing saved headlines." : "No connection and no saved headlines yet.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div className="news-refresh">
        <span>
          {loading
            ? "Refreshing…"
            : news
              ? `Updated ${timeAgo(news.generatedAt, new Date())}`
              : "No data yet"}
        </span>
        <button
          className="btn btn-secondary"
          style={{ minHeight: 36, padding: "6px 14px", gap: 8 }}
          onClick={load}
          disabled={loading}
        >
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {error && <p className="inline-error">{error}</p>}
      {!error && checkedNote && <p className="card__sub" style={{ marginBottom: 10 }}>{checkedNote}</p>}
      {!error && !checkedNote && (
        <p className="card__sub" style={{ marginBottom: 10 }}>
          Headlines are regenerated in the background every so often, not on tap — refresh just checks for whatever's
          newest right now.
        </p>
      )}

      {!news && !loading && !error && <p className="empty-state">No news yet.</p>}

      {news?.items.map((item, i) => (
        <a key={i} className="link-card" href={item.link} target="_blank" rel="noreferrer">
          <div className="link-card__source">
            <span>{item.source}</span>
            <span>{timeAgo(item.publishedAt, new Date())}</span>
          </div>
          <p className="link-card__title">{item.title}</p>
        </a>
      ))}
    </div>
  );
}
