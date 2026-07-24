/* =============================================================================
   NOMI MEDIA OS — Express server (for Render / Railway / VPS / Hostinger-Node).
   Serves the OS dashboard (the /os folder) AND the /api/* endpoints.

   On Netlify this file is NOT used — Netlify serves /os statically and runs
   the API from netlify/functions/* instead. Both share server/lib/aggregate.js
   so the behavior is identical.
   ============================================================================= */
"use strict";

require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const notion = require("./lib/notion");
const gapi = require("./lib/google");
const api = require("./lib/aggregate");

const app = express();
app.use(cors());

/* ---------------------------------------------------------------------------
   OPTIONAL login protection (HTTP Basic Auth).
   Inert by default. Set OS_USERNAME and OS_PASSWORD in the environment to
   require a login for the whole OS (dashboard + API).
   (On Netlify, use the edge function in netlify/edge-functions/auth.js instead
   — it protects the statically-served dashboard too.)
--------------------------------------------------------------------------- */
const AUTH_USER = process.env.OS_USERNAME;
const AUTH_PASS = process.env.OS_PASSWORD;
if (AUTH_USER && AUTH_PASS) {
  app.use(function (req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, encoded] = header.split(" ");
    if (scheme === "Basic" && encoded) {
      const [user, pass] = Buffer.from(encoded, "base64").toString("utf8").split(":");
      if (user === AUTH_USER && pass === AUTH_PASS) return next();
    }
    res.set("WWW-Authenticate", 'Basic realm="Nomi Media OS", charset="UTF-8"');
    return res.status(401).send("Authentication required.");
  });
  console.log("  Login:   protected (OS_USERNAME / OS_PASSWORD set)");
}

const OS_DIR = path.join(__dirname, "..", "os");

/* ---------------------------------------------------------------------------
   API endpoints (thin wrappers over the shared aggregate module)
--------------------------------------------------------------------------- */
app.get("/api/data", async (_req, res) => res.json(await api.getData()));
app.get("/api/meetings", async (_req, res) => res.json(await api.getMeetings()));
app.get("/api/drive", async (_req, res) => res.json(await api.getDrive()));
app.get("/api/notion", async (req, res) => res.json(await api.getNotion(req.query.q)));
app.get("/api/health", (_req, res) => res.json(api.health()));

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
