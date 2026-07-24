// Netlify Function: GET /api/meetings — live Google Calendar meetings.
const api = require("../../server/lib/aggregate");

exports.handler = async () => ({
  statusCode: 200,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(await api.getMeetings()),
});
