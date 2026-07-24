// Netlify Function: GET /api/drive — live Google Drive files.
const api = require("../../server/lib/aggregate");

exports.handler = async () => ({
  statusCode: 200,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(await api.getDrive()),
});
