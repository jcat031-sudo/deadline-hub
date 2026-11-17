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
  const [, forceTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}news.json?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data: NewsFile = await res.json();
      setNews(data);
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
          {news ? `Updated ${timeAgo(news.generatedAt, new Date())}` : loading ? "Loading…" : "No data yet"}
        </span>
        <button className="btn btn-secondary" style={{ minHeight: 36, padding: "6px 14px" }} onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <p className="inline-error">{error}</p>}

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
