/* =============================================================================
   Notion integration.
   Auth: an internal integration token (starts with "ntn_" / "secret_").

   Setup (see server/README.md):
     1. Create an internal integration at notion.so/my-integrations,
        copy the token into NOTION_TOKEN.
     2. In Notion, open each page/database you want the OS to read and
        "Connect" the integration (••• menu > Connections).
     3. (Optional) Put a clients database ID in NOTION_CLIENTS_DB_ID to drive
        the Clients module live from Notion instead of the curated list.
   ============================================================================= */
"use strict";

const { Client } = require("@notionhq/client");

function getClient() {
  if (!process.env.NOTION_TOKEN) return null;
  // Pin a stable API version so databases.query keeps working as Notion evolves.
  return new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2022-06-28" });
}

function isConfigured() {
  return !!process.env.NOTION_TOKEN;
}

/** Extract a plain-text title from a Notion page/DB object. */
function titleOf(obj) {
  // Search results (pages): title lives in properties as a "title" type.
  const props = obj.properties || {};
  for (const key in props) {
    const p = props[key];
    if (p && p.type === "title" && Array.isArray(p.title)) {
      return p.title.map((t) => t.plain_text).join("") || "Untitled";
    }
  }
  // Databases: top-level title array.
  if (Array.isArray(obj.title)) {
    return obj.title.map((t) => t.plain_text).join("") || "Untitled";
  }
  return "Untitled";
}

function plainProp(page, names) {
  const props = page.properties || {};
  for (const want of names) {
    for (const key in props) {
      if (key.toLowerCase() !== want.toLowerCase()) continue;
      const p = props[key];
      if (!p) continue;
      if (p.type === "select" && p.select) return p.select.name;
      if (p.type === "status" && p.status) return p.status.name;
      if (p.type === "multi_select") return p.multi_select.map((o) => o.name);
      if (p.type === "rich_text") return p.rich_text.map((t) => t.plain_text).join("");
      if (p.type === "email") return p.email;
      if (p.type === "phone_number") return p.phone_number;
      if (p.type === "url") return p.url;
    }
  }
  return null;
}

/* ---------------------------------------------------------------------------
   RECENT — most recently edited pages/databases in the workspace.
   Powers the "Notion" quick-access surface (content, meeting notes, etc.).
--------------------------------------------------------------------------- */
async function getRecent({ query = "", pageSize = 12 } = {}) {
  const notion = getClient();
  if (!notion) return null;

  const res = await notion.search({
    query,
    page_size: pageSize,
    sort: { direction: "descending", timestamp: "last_edited_time" },
  });

  return (res.results || []).map((r) => ({
    title: titleOf(r),
    type: r.object === "database" ? "Database" : "Page",
    url: r.url,
    timestamp: r.last_edited_time,
  }));
}

/* ---------------------------------------------------------------------------
   CLIENTS — optional: drive the Clients module from a Notion database.
   Only used when NOTION_CLIENTS_DB_ID is set AND the DB is shared with the
   integration; otherwise the curated list is used.
--------------------------------------------------------------------------- */
async function getClientsFromDb() {
  const notion = getClient();
  const dbId = process.env.NOTION_CLIENTS_DB_ID;
  if (!notion || !dbId) return null;

  const res = await notion.databases.query({ database_id: dbId, page_size: 100 });

  return (res.results || []).map((page) => {
    const platforms = plainProp(page, ["Platforms", "Platform", "Channels"]);
    return {
      name: titleOf(page),
      status: (plainProp(page, ["Status"]) || "active").toString().toLowerCase(),
      package: plainProp(page, ["Package", "Plan", "Tier"]) || "",
      contact: plainProp(page, ["Contact", "Email", "PIC"]) || "",
      platforms: Array.isArray(platforms) ? platforms : platforms ? [platforms] : [],
      notes: plainProp(page, ["Notes", "Note", "Description"]) || "",
      links: page.url ? [{ label: "Open in Notion", url: page.url }] : [],
    };
  });
}

module.exports = { isConfigured, getRecent, getClientsFromDb };
