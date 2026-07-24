# Nomi Media OS — Live Backend Setup

This backend makes the OS pull **live** data from **Notion**, **Google Drive**
and **Google Calendar**, instead of the baked-in snapshot. It also serves the
dashboard itself.

You point your domain at this server and open it — meetings, files and Notion
pages stay up to date automatically (refreshed every few minutes).

> The dashboard still works with **zero** setup — if a service isn't
> configured, that section simply falls back to the curated data in
> `server/config/content.js`. Set up only the integrations you want.

---

## 0. What you need

- A place to run a Node.js app (any of: **Render**, **Railway**, a VPS, or a
  Hostinger plan that supports Node.js). Node 18+.
- Your Notion and/or Google credentials (steps below).

---

## 1. Run it locally first (optional but recommended)

```bash
npm install
cp server/.env.example server/.env   # then fill in server/.env (step 2 & 3)
npm start
```

Open <http://localhost:3000>. Check <http://localhost:3000/api/health> to see
which integrations are detected.

---

## 2. Connect Notion

1. Go to <https://www.notion.so/my-integrations> → **New integration** →
   choose **Internal**. Copy the **Internal Integration Secret**.
2. Put it in `server/.env` as `NOTION_TOKEN=...`
3. In Notion, open each page or database you want the OS to read →
   **•••** (top right) → **Connections** → select your integration.
   (Do this on your top-level Nomi workspace pages so it can see everything
   under them.)
4. *(Optional)* To power the **Clients** module live from a Notion database,
   copy that database's ID (the 32-character code in its URL) into
   `NOTION_CLIENTS_DB_ID`. The mapper reads common property names
   (Status, Package, Platforms, Contact, Notes). Leave blank to keep the
   curated client list.

What you get live: the **Recent in Notion** feed (most recently edited pages),
and optionally the Clients list.

---

## 3. Connect Google (Calendar + Drive)

We use a **service account** — a robot Google account — so there's no login
popup to maintain.

1. Go to <https://console.cloud.google.com/> → create (or pick) a project.
2. **APIs & Services → Library** → enable **Google Calendar API** and
   **Google Drive API**.
3. **APIs & Services → Credentials → Create credentials → Service account.**
   Give it a name, create it.
4. Open the service account → **Keys → Add key → Create new key → JSON.**
   A `.json` file downloads. Open it — you'll see an `"client_email"` like
   `nomi-os@yourproject.iam.gserviceaccount.com`. **Copy that email.**
5. Put the **entire JSON** into `server/.env` on one line:
   `GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}`
   *(Tip: if pasting the JSON is awkward on your host, base64-encode the file
   and paste that instead — the server accepts either.)*
6. Set `GOOGLE_CALENDAR_ID` to the calendar you want (usually your Google
   email, e.g. `admin@nomimediamy.com`).
7. **Share your data with the service-account email** (the `client_email`
   from step 4):
   - **Calendar:** Google Calendar → your calendar's **Settings → Share with
     specific people → Add** the service-account email → *See all event
     details*.
   - **Drive:** right-click the folder(s)/file(s) you want listed (or
     "My Drive") → **Share** → add the service-account email → **Viewer**.
   - *(Optional)* To show only one Drive folder, put its folder ID (from the
     folder URL) in `GOOGLE_DRIVE_FOLDER_ID`.

What you get live: the **Meetings** module (Google Calendar) and the
**Files** module (Google Drive), including auto meeting-notes links.

---

## 4. Deploy with your domain

Pick one host. In all cases: set the same environment variables from your
`server/.env` in the host's dashboard (never upload the `.env` file itself),
and set the start command to `npm start`.

### Render (easiest, has a free tier)
1. Push this repo to GitHub (already done).
2. Render → **New → Web Service** → connect the repo.
3. Build command `npm install`, start command `npm start`.
4. Add your env vars under **Environment**.
5. Deploy → you get a URL. Then **Settings → Custom Domain** → add your domain
   and follow the DNS instructions (add the CNAME/A record at your registrar).

### Railway
Same idea: **New Project → Deploy from repo**, add env vars, then add a custom
domain under the service's **Settings → Networking**.

### VPS (full control)
```bash
git clone <repo> && cd nomiclaude
npm install
# create server/.env with your vars
npm install -g pm2
pm2 start server/server.js --name nomi-os
```
Put Nginx (or Caddy) in front, point your domain's DNS at the server, and add
HTTPS (Let's Encrypt / Caddy does it automatically).

### Hostinger
Only works on a Hostinger plan with **Node.js** support (VPS or the Node.js
hosting tier — not the plain static/PHP shared plan). Use the Node.js app
setup in hPanel, set the entry file to `server/server.js`, add the env vars,
and install dependencies.

---

## 5. How refresh works

- Live data is cached for `CACHE_TTL_SECONDS` (default 300s = 5 min) so the
  APIs aren't hit on every page load.
- The **↻ button** in the top bar re-fetches on demand.
- The badge in the top bar shows the current state: **Live** (green) with a
  "updated Xm ago" time, or **Curated data** when nothing is connected.

## Endpoints (for reference)

| Endpoint        | Returns                                              |
|-----------------|-----------------------------------------------------|
| `/api/data`     | Everything the dashboard loads (aggregate)          |
| `/api/meetings` | Live Google Calendar meetings                       |
| `/api/drive`    | Live Google Drive files                             |
| `/api/notion`   | Recent Notion pages (`?q=` to search)               |
| `/api/health`   | Which integrations are configured                   |

## Security notes

- **Never commit `server/.env`** or the service-account JSON — `.gitignore`
  already blocks them. Set secrets in your host's env-var settings.
- The OS is an internal tool. If you host it on a public domain, consider
  putting it behind a login (HTTP basic auth at the proxy, Cloudflare Access,
  or similar). Ask and this can be added.
