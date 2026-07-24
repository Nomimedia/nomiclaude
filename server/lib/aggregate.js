/* =============================================================================
   Shared data-aggregation logic.
   Used by BOTH the Express server (server/server.js) and the Netlify
   serverless functions (netlify/functions/*), so the API behaves identically
   no matter where it's deployed.
   ============================================================================= */
"use strict";

const notion = require("./notion");
const gapi = require("./google");
const content = require("../config/content");
const { cached } = require("./cache");

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

async function getMeetings() {
  const live = await safe("meetings", () => cached("meetings", TTL, () => gapi.getMeetings()));
  return { meetings: live && live.length ? live : content.meetings, live: !!live };
}

async function getDrive() {
  const files = await safe("drive", () =>
    cached("drive", TTL, () => gapi.getDriveFiles({ folderId: process.env.GOOGLE_DRIVE_FOLDER_ID }))
  );
  return { files: files || [], live: !!files };
}

async function getNotion(q) {
  q = (q || "").toString();
  const recent = await safe("notion", () =>
    cached("notion:" + q, TTL, () => notion.getRecent({ query: q }))
  );
  return { notion: recent || [], live: !!recent };
}

/** The aggregate payload the dashboard loads on every page view. */
async function getData() {
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
      live: { calendar: !!meetings, drive: !!files, notion: !!notionRecent },
      configured: { notion: notion.isConfigured(), google: gapi.isConfigured() },
    },
  });

  if (notionClients && notionClients.length) out.clients = notionClients;
  return out;
}

function health() {
  return {
    ok: true,
    notionConfigured: notion.isConfigured(),
    googleConfigured: gapi.isConfigured(),
    time: new Date().toISOString(),
  };
}

module.exports = { getData, getMeetings, getDrive, getNotion, health };
