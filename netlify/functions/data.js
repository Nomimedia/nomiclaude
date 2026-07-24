// Netlify Function: GET /api/data — the aggregate payload the dashboard loads.
const api = require("../../server/lib/aggregate");

exports.handler = async () => {
  const body = await api.getData();
  return {
    statusCode: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
    body: JSON.stringify(body),
  };
};
