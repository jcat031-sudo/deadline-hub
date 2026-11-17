# Deadline Hub

Jackson's personal life dashboard &mdash; classes, deadlines, finance headlines, gym
tracking and "scroll time" rewards, built as an installable PWA for the iPhone home
screen.

All personal data (schedule overrides, deadlines, workout logs, scroll-time log)
lives only in this phone's `localStorage`. Nothing is sent to a server except
fetching the pre-built `news.json` file and the one-time registration of this app
with Apple's/Google's push services isn't used at all &mdash; there's no backend.

## Stack

- Vite + React + TypeScript
- `vite-plugin-pwa` for the manifest, service worker and offline caching
- No UI framework/component library &mdash; plain CSS with light/dark theme variables
- No chart library &mdash; a small hand-rolled SVG line chart (see
  [src/components/LineChart.tsx](src/components/LineChart.tsx))

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploying

Pushing to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml),
which builds the site and publishes it to GitHub Pages. See the setup walkthrough
the assistant gave you for the one-time GitHub Pages configuration step.

If you rename the GitHub repository away from `deadline-hub`, update `REPO_NAME` at
the top of [vite.config.ts](vite.config.ts) to match &mdash; the base path and PWA
`start_url`/`scope` depend on it.

## Finance news

[.github/workflows/news-fetch.yml](.github/workflows/news-fetch.yml) runs every 30
minutes, executes [scripts/fetch-news.mjs](scripts/fetch-news.mjs) (pulls a handful
of CNBC/MarketWatch RSS feeds, dedupes, sorts by recency), and commits the result to
[public/news.json](public/news.json) if it changed. That commit lands on `main` and
triggers a redeploy automatically. Run `npm run fetch-news` locally to test it.

## Scroll Time / Shortcuts

See [SHORTCUTS_SETUP.md](SHORTCUTS_SETUP.md) for exact steps to build the iOS
Shortcuts and Personal Automations this app talks to.
