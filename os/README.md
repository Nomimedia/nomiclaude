# Nomi Media OS

An internal command center for Nomi Media — see all clients at a glance, keep
your skills files, agents, portfolio and company details in one place, and
monitor meetings. Built as a static, no-backend site so it deploys alongside
the existing Nomi Media landing page on Hostinger.

## What's inside

```
os/
  index.html            The OS dashboard (open this)
  assets/os.css         Styling (matches the Nomi black/pink brand)
  assets/os.js          App logic — renders every module from the data file
  data/nomi-data.js     <-- SINGLE SOURCE OF TRUTH. Edit this to update the OS.
```

## Modules

- **Dashboard** — stat tiles (clients, meetings, skills, agents), client
  snapshot, next meeting, connected integrations.
- **Clients** — every client with status, package, platforms, notes and links
  (invoices, meeting notes, etc.).
- **Skills & Agents** — your reusable playbooks/skills and automated agents,
  searchable.
- **Portfolio** — work/case studies plus your service packages & pricing.
- **Meetings** — upcoming and past meetings with Google Meet + notes links.
- **Company** — Nomi Media profile, contact details and services.

The search box at the top filters cards **within the current view**.

## How to update

Everything the OS shows comes from **`data/nomi-data.js`**. Open it, edit the
values (add a client, add a meeting, change a package price…), save, and
re-upload the file. No build tools, no server, no database.

Each section has comments explaining the fields. Status values:
- Clients: `active` · `onboarding` · `lead` · `past`
- Meetings: `upcoming` · `done`
- Integrations: `connected` · `available`

## Deploy

Upload the whole `os/` folder into `public_html` next to the existing site,
then visit `https://yourdomain.com/os/`. It reuses the shared logo in
`../assets/images/logo.png`, so keep the `os/` folder inside the same project.

The page is marked `noindex` so it stays out of search engines — it's for your
team, not the public.

## Two ways to run it

**1. Live (recommended) — with the backend.**
Run the Node backend in `../server` and it pulls **live** data from Notion,
Google Drive and Google Calendar, and serves this dashboard. Meetings, files
and Notion pages stay up to date automatically. Full step-by-step setup +
deployment (Render / Railway / VPS / Hostinger-Node) is in
[`../server/README.md`](../server/README.md). The top-bar badge shows **Live**
when connected, with an "updated Xm ago" time and a ↻ refresh button, plus two
extra modules powered by the APIs: **Meetings** (Calendar) and **Files & Notion**
(Drive + Notion).

**2. Static — no backend.**
Just upload this `os/` folder to Hostinger. The dashboard reads the baked-in
snapshot in `data/nomi-data.js` (seeded 2026-07-24 from your live Notion, Drive
and Calendar). The badge shows "Offline · showing saved data". Edit that file to
update content.

The frontend automatically detects which mode it's in — if the backend/API
isn't reachable, it falls back to the saved snapshot, so the page never breaks.
