/* =============================================================================
   NOMI MEDIA OS — server
   - Serves the OS dashboard (the /os folder) as a static site.
   - Exposes /api/* endpoints that pull LIVE data from Notion, Google Drive
     and Google Calendar (falling back to curated content when a source is
     not configured or errors).
   ============================================================================= */
"use strict";

require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const { cached } = require("./lib/cache");
const notion = require("./lib/notion");
const gapi = require("./lib/google");
const content = require("./config/content");

const app = express();
app.use(cors());

const OS_DIR = path.join(__dirname, "..", "os");
const TTL = parseInt(process.env.CACHE_TTL_SECONDS || "300", 10); // 5 min default

/** Run an async fn, returning null (never throwing) so one bad source can't
 *  take down the whole page. Logs the error for debugging. */
async function safe(label, fn) {
  try {
    return await fn();
  } catch (err) {
    console.error(`[api] ${label} failed:`, err.message);
    return null;
  }
}

/* ---------------------------------------------------------------------------
   Granular endpoints
--------------------------------------------------------------------------- */
app.get("/api/meetings", async (_req, res) => {
  const live = await safe("meetings", () => cached("meetings", TTL, () => gapi.getMeetings()));
  res.json({ meetings: live && live.length ? live : content.meetings, live: !!live });
});

app.get("/api/drive", async (_req, res) => {
  const files = await safe("drive", () =>
    cached("drive", TTL, () => gapi.getDriveFiles({ folderId: process.env.GOOGLE_DRIVE_FOLDER_ID }))
  );
  res.json({ files: files || [], live: !!files });
});

app.get("/api/notion", async (req, res) => {
  const q = (req.query.q || "").toString();
  const recent = await safe("notion", () =>
    cached("notion:" + q, TTL, () => notion.getRecent({ query: q }))
  );
  res.json({ notion: recent || [], live: !!recent });
});

/* ---------------------------------------------------------------------------
   Aggregate endpoint — what the dashboard actually loads
--------------------------------------------------------------------------- */
app.get("/api/data", async (_req, res) => {
  const [meetings, files, notionRecent, notionClients] = await Promise.all([
    safe("meetings", () => cached("meetings", TTL, () => gapi.getMeetings())),
    safe("drive", () => cached("drive", TTL, () => gapi.getDriveFiles({ folderId: process.env.GOOGLE_DRIVE_FOLDER_ID }))),
    safe("notion", () => cached("notion:", TTL, () => notion.getRecent({}))),
    safe("notionClients", () => cached("notionClients", TTL, () => notion.getClientsFromDb())),
  ]);

  const out = Object.assign({}, content, {
    meetings: meetings && meetings.length ? meetings : content.meetings,
    files: files || [],
    notionRecent: notionRecent || [],
    meta: {
      updatedAt: new Date().toISOString(),
      live: {
        calendar: !!meetings,
        drive: !!files,
        notion: !!notionRecent,
      },
      configured: {
        notion: notion.isConfigured(),
        google: gapi.isConfigured(),
      },
    },
  });

  // If a Notion clients DB is wired up and returns rows, use it live.
  if (notionClients && notionClients.length) out.clients = notionClients;

  res.json(out);
});

/* ---------------------------------------------------------------------------
   Health / status
--------------------------------------------------------------------------- */
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    notionConfigured: notion.isConfigured(),
    googleConfigured: gapi.isConfigured(),
    time: new Date().toISOString(),
  });
});

/* ---------------------------------------------------------------------------
   Static dashboard (served at / so the domain root shows the OS)
--------------------------------------------------------------------------- */
app.use("/", express.static(OS_DIR));
app.get("/", (_req, res) => res.sendFile(path.join(OS_DIR, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Nomi Media OS running on http://localhost:${PORT}`);
  console.log(`  Notion:  ${notion.isConfigured() ? "configured ✓" : "not configured (using curated data)"}`);
  console.log(`  Google:  ${gapi.isConfigured() ? "configured ✓" : "not configured (using curated data)"}\n`);
});
