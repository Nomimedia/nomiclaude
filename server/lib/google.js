/* =============================================================================
   Google integration — Calendar (meetings) + Drive (files).
   Auth: a Google Cloud SERVICE ACCOUNT (no per-user OAuth flow needed).

   Setup (see server/README.md for the full walkthrough):
     1. Create a service account in Google Cloud, enable Calendar + Drive APIs.
     2. Download its JSON key and put it in GOOGLE_SERVICE_ACCOUNT_JSON
        (raw JSON on one line, or base64 of the JSON).
     3. SHARE your Google Calendar with the service account's email
        (Settings > share with specific people > Viewer).
     4. SHARE the Drive folders/files you want to show with the same email.
   ============================================================================= */
"use strict";

const { google } = require("googleapis");

/** Build a GoogleAuth from the service-account JSON in env, or null if unset. */
function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  let creds;
  try {
    creds = JSON.parse(raw);
  } catch (e) {
    // Allow the key to be provided base64-encoded (handy for some hosts).
    try {
      creds = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    } catch (e2) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON (or base64-encoded JSON)."
      );
    }
  }
  // Env vars often escape newlines in the private key — restore them.
  if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, "\n");

  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });
}

function isConfigured() {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
}

/* ---------------------------------------------------------------------------
   MEETINGS — from Google Calendar
--------------------------------------------------------------------------- */
async function getMeetings({ maxResults = 25, pastDays = 30, futureDays = 90 } = {}) {
  const auth = getAuth();
  if (!auth) return null;

  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const now = new Date();
  const timeMin = new Date(now.getTime() - pastDays * 864e5).toISOString();
  const timeMax = new Date(now.getTime() + futureDays * 864e5).toISOString();

  const res = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults,
  });

  const items = res.data.items || [];
  return items.map((ev) => {
    const start = (ev.start && (ev.start.dateTime || ev.start.date)) || null;
    const end = (ev.end && (ev.end.dateTime || ev.end.date)) || null;
    const isDone = start ? new Date(start) < now : false;

    // Prefer an attachment whose title mentions "notes" (e.g. Gemini notes).
    let notesUrl = "";
    (ev.attachments || []).forEach((a) => {
      if (/note/i.test(a.title || "")) notesUrl = a.fileUrl;
    });
    if (!notesUrl && ev.attachments && ev.attachments[0]) {
      notesUrl = ev.attachments[0].fileUrl;
    }

    const meetUrl =
      ev.hangoutLink ||
      (ev.conferenceData &&
        ev.conferenceData.entryPoints &&
        ev.conferenceData.entryPoints[0] &&
        ev.conferenceData.entryPoints[0].uri) ||
      "";

    const attendees = (ev.attendees || [])
      .map((a) => a.displayName || a.email)
      .filter(Boolean)
      .join(", ");

    return {
      title: ev.summary || "(no title)",
      date: start,
      end,
      status: isDone ? "done" : "upcoming",
      attendees,
      meetUrl,
      notesUrl,
      summary: ev.description
        ? String(ev.description).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
        : "",
    };
  });
}

/* ---------------------------------------------------------------------------
   FILES — from Google Drive
--------------------------------------------------------------------------- */
const TYPE_MAP = {
  "application/vnd.google-apps.spreadsheet": "Sheet",
  "application/vnd.google-apps.document": "Doc",
  "application/vnd.google-apps.presentation": "Slides",
  "application/vnd.google-apps.form": "Form",
  "application/vnd.google-apps.folder": "Folder",
  "application/pdf": "PDF",
  "video/mp4": "Video",
  "image/png": "Image",
  "image/jpeg": "Image",
};
function friendlyType(mime) {
  return TYPE_MAP[mime] || (mime ? mime.split("/").pop().toUpperCase() : "File");
}

async function getDriveFiles({ pageSize = 25, folderId } = {}) {
  const auth = getAuth();
  if (!auth) return null;

  const drive = google.drive({ version: "v3", auth });
  let q = "trashed = false";
  if (folderId) q += ` and '${folderId}' in parents`;

  const res = await drive.files.list({
    q,
    orderBy: "modifiedTime desc",
    pageSize,
    fields: "files(id,name,mimeType,modifiedTime,webViewLink)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return (res.data.files || []).map((f) => ({
    title: f.name,
    type: friendlyType(f.mimeType),
    modified: f.modifiedTime,
    url: f.webViewLink,
  }));
}

module.exports = { isConfigured, getMeetings, getDriveFiles };
