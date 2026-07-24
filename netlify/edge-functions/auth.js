/* Optional site-wide login for the OS on Netlify (HTTP Basic Auth).
   Inert by default. Set OS_USERNAME and OS_PASSWORD in the Netlify site's
   environment variables to require a login for the whole site — including the
   statically-served dashboard, which regular functions can't guard.
   Recommended, since the OS holds client & invoice data. */
export default async (request) => {
  const USER = Netlify.env.get("OS_USERNAME");
  const PASS = Netlify.env.get("OS_PASSWORD");
  if (!USER || !PASS) return; // not configured → let everything through

  const header = request.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    let decoded = "";
    try { decoded = atob(encoded); } catch (_e) { decoded = ""; }
    const idx = decoded.indexOf(":");
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    if (user === USER && pass === PASS) return; // authorized → continue
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Nomi Media OS", charset="UTF-8"' },
  });
};

export const config = { path: "/*" };
