// Netlify Function: GET /api/health — which integrations are configured.
const api = require("../../server/lib/aggregate");

exports.handler = async () => ({
  statusCode: 200,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(api.health()),
});
