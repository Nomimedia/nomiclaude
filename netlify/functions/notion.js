// Netlify Function: GET /api/notion?q=... — recent / searched Notion pages.
const api = require("../../server/lib/aggregate");

exports.handler = async (event) => {
  const q = (event.queryStringParameters && event.queryStringParameters.q) || "";
  return {
    statusCode: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
    body: JSON.stringify(await api.getNotion(q)),
  };
};
