/* =============================================================================
   NOMI MEDIA OS — APP LOGIC
   Renders every module from window.NOMI_DATA (see data/nomi-data.js)
   ============================================================================= */
(function () {
  "use strict";
  var D = window.NOMI_DATA || {};

  /* ---------- tiny helpers ---------- */
  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function extIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
  }
  function linksHtml(links) {
    if (!links || !links.length) return "";
    return '<div class="links">' + links.map(function (l) {
      return '<a class="link-btn" target="_blank" rel="noopener" href="' + esc(l.url) + '">' + extIcon() + esc(l.label) + "</a>";
    }).join("") + "</div>";
  }
  function pills(arr) {
    if (!arr || !arr.length) return "";
    return '<div class="tags">' + arr.map(function (p) { return '<span class="pill">' + esc(p) + "</span>"; }).join("") + "</div>";
  }

  /* ---------- DASHBOARD ---------- */
  function renderDashboard() {
    var clients = D.clients || [], meetings = D.meetings || [];
    var active = clients.filter(function (c) { return c.status === "active"; }).length;
    var upcoming = meetings.filter(function (m) { return m.status === "upcoming"; }).length;
    var stats = [
      { ico: "users", num: clients.length, lbl: "Total clients (" + active + " active)" },
      { ico: "calendar", num: meetings.length, lbl: upcoming + " upcoming meetings" },
      { ico: "bolt", num: (D.skills || []).length, lbl: "Skills in library" },
      { ico: "robot", num: (D.agents || []).length, lbl: "Automated agents" }
    ];
    el("stat-grid").innerHTML = stats.map(function (s) {
      return '<div class="stat"><div class="ico">' + ICON[s.ico] + "</div><div class=\"num\">" +
        esc(s.num) + '</div><div class="lbl">' + esc(s.lbl) + "</div></div>";
    }).join("");

    // clients snapshot
    el("dash-clients").innerHTML = clients.slice(0, 4).map(clientCard).join("") ||
      '<div class="empty">No clients yet — add them in data/nomi-data.js</div>';

    // next meeting
    var sorted = meetings.slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    var next = sorted.filter(function (m) { return m.status === "upcoming"; })[0] || sorted[sorted.length - 1];
    el("dash-meeting").innerHTML = next ? meetingCard(next) :
      '<div class="empty">No meetings scheduled</div>';

    // integrations
    el("dash-integrations").innerHTML = (D.integrations || []).map(function (i) {
      return '<div class="card"><div class="card-head"><h3>' + esc(i.name) + '</h3><span class="badge ' +
        esc(i.status) + '">' + esc(i.status) + "</span></div><p>" + esc(i.desc) + "</p></div>";
    }).join("");
  }

  /* ---------- CLIENTS ---------- */
  function clientCard(c) {
    return '<div class="card" data-search="' + esc((c.name + " " + (c.package || "") + " " + (c.notes || "")).toLowerCase()) + '">' +
      '<div class="card-head"><h3>' + esc(c.name) + '</h3><span class="badge ' + esc(c.status) + '">' + esc(c.status) + "</span></div>" +
      '<div class="meta">' + esc(c.package || "—") + (c.contact ? " · " + esc(c.contact) : "") + "</div>" +
      (c.notes ? "<p>" + esc(c.notes) + "</p>" : "") +
      pills(c.platforms) +
      linksHtml(c.links) +
      "</div>";
  }
  function renderClients() {
    el("clients-grid").innerHTML = (D.clients || []).map(clientCard).join("") ||
      '<div class="empty">No clients yet</div>';
  }

  /* ---------- SKILLS & AGENTS ---------- */
  function renderSkills() {
    var sc = el("skills-count"); if (sc) sc.textContent = (D.skills || []).length + " skills";
    el("skills-grid").innerHTML = (D.skills || []).map(function (s) {
      return '<div class="card" data-search="' + esc((s.name + " " + s.category + " " + s.desc).toLowerCase()) + '">' +
        '<div class="card-head"><h3>' + esc(s.name) + '</h3><span class="badge highlight">' + esc(s.category) + "</span></div>" +
        "<p>" + esc(s.desc) + "</p></div>";
    }).join("");

    el("agents-grid").innerHTML = (D.agents || []).map(function (a) {
      return '<div class="card" data-search="' + esc((a.name + " " + a.desc).toLowerCase()) + '">' +
        '<div class="card-head"><h3>' + esc(a.name) + '</h3><span class="badge active">' + esc(a.status) + "</span></div>" +
        "<p>" + esc(a.desc) + "</p></div>";
    }).join("");
  }

  /* ---------- PORTFOLIO + PACKAGES ---------- */
  function renderPortfolio() {
    el("portfolio-grid").innerHTML = (D.portfolio || []).map(function (p) {
      return '<div class="card" data-search="' + esc((p.title + " " + p.client + " " + p.desc).toLowerCase()) + '">' +
        '<div class="card-head"><h3>' + esc(p.title) + '</h3><span class="badge highlight">' + esc(p.type) + "</span></div>" +
        '<div class="meta">' + esc(p.client) + "</div><p>" + esc(p.desc) + "</p></div>";
    }).join("");

    el("packages-grid").innerHTML = (D.packages || []).map(function (p) {
      return '<div class="pkg' + (p.highlight ? " highlight" : "") + '">' +
        '<div class="card-head"><h3>' + esc(p.name) + "</h3>" + (p.highlight ? '<span class="badge highlight">Popular</span>' : "") + "</div>" +
        '<div class="price">' + esc(p.price) + " <span>" + esc(p.unit) + "</span></div>" +
        '<div class="note">' + esc(p.note) + "</div>" +
        '<ul class="feat">' + (p.features || []).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>";
    }).join("");
  }

  /* ---------- MEETINGS ---------- */
  var TZ = (D.company && /(\bAsia\/[A-Za-z_]+)/.exec(D.company.timezone || ""));
  TZ = TZ ? TZ[1] : "Asia/Kuala_Lumpur";
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return { day: "?", mon: "", time: iso };
    var opt = { timeZone: TZ };
    return {
      day: d.toLocaleString("en-US", Object.assign({ day: "numeric" }, opt)),
      mon: d.toLocaleString("en-US", Object.assign({ month: "short" }, opt)),
      time: d.toLocaleString("en-US", Object.assign(
        { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true }, opt)) +
        " · " + d.toLocaleString("en-US", Object.assign({ year: "numeric" }, opt))
    };
  }
  function meetingCard(m) {
    var f = fmtDate(m.date);
    var links = [];
    if (m.meetUrl) links.push({ label: "Join / Meet", url: m.meetUrl });
    if (m.notesUrl) links.push({ label: "Notes", url: m.notesUrl });
    return '<div class="meeting"><div class="date-chip"><div class="d">' + esc(f.day) + '</div><div class="m">' + esc(f.mon) + "</div></div>" +
      '<div class="body"><div class="card-head"><h3>' + esc(m.title) + '</h3><span class="badge ' + (m.status === "upcoming" ? "onboarding" : "past") + '">' + esc(m.status) + "</span></div>" +
      '<div class="time">' + esc(f.time) + (m.attendees ? " · " + esc(m.attendees) : "") + "</div>" +
      (m.summary ? "<p>" + esc(m.summary) + "</p>" : "") +
      linksHtml(links) + "</div></div>";
  }
  function renderMeetings() {
    var ms = (D.meetings || []).slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    var up = ms.filter(function (m) { return m.status === "upcoming"; });
    var done = ms.filter(function (m) { return m.status !== "upcoming"; });
    el("meetings-upcoming").innerHTML = up.map(meetingCard).join("") ||
      '<div class="empty">No upcoming meetings. Sync from Google Calendar to populate.</div>';
    el("meetings-past").innerHTML = done.map(meetingCard).join("") ||
      '<div class="empty">No past meetings recorded.</div>';
  }

  /* ---------- COMPANY ---------- */
  function renderCompany() {
    var c = D.company || {};
    el("company-about").innerHTML =
      '<div class="card"><h3>About ' + esc(c.name) + '</h3><div class="meta">' + esc(c.tagline) + "</div><p>" + esc(c.about) + "</p>" +
      pills(c.platforms) + "</div>";

    el("company-details").innerHTML =
      '<div class="card">' +
      kv("Legal name", c.legalName) +
      kv("Email", c.email) +
      kv("Website", c.website) +
      kv("Location", c.location) +
      kv("Timezone", c.timezone) +
      "</div>";

    el("company-services").innerHTML = (c.services || []).map(function (s) {
      return '<div class="card" style="padding:14px 16px"><h3 style="font-size:14px">' + esc(s) + "</h3></div>";
    }).join("");
  }
  function kv(k, v) {
    if (!v) return "";
    return '<div class="kv"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + "</span></div>";
  }

  /* ---------- Search (filters cards in the active view) ---------- */
  function wireSearch() {
    var box = el("global-search");
    box.addEventListener("input", function () {
      var q = box.value.trim().toLowerCase();
      var view = document.querySelector(".view.active");
      if (!view) return;
      view.querySelectorAll("[data-search]").forEach(function (card) {
        var hit = !q || card.getAttribute("data-search").indexOf(q) !== -1;
        card.style.display = hit ? "" : "none";
      });
    });
  }

  /* ---------- Navigation ---------- */
  var TITLES = {
    dashboard: ["Dashboard", "Everything at a glance"],
    clients: ["Clients", "All your clients in one place"],
    skills: ["Skills & Agents", "Your reusable playbooks and automations"],
    portfolio: ["Portfolio & Packages", "Showcase work and service offers"],
    meetings: ["Meetings", "Synced from Google Calendar"],
    company: ["Company", "Nomi Media profile & details"]
  };
  function go(view) {
    document.querySelectorAll(".nav-item").forEach(function (n) {
      n.classList.toggle("active", n.dataset.view === view);
    });
    document.querySelectorAll(".view").forEach(function (v) {
      v.classList.toggle("active", v.id === "view-" + view);
    });
    var t = TITLES[view] || ["", ""];
    el("page-title").textContent = t[0];
    el("page-sub").textContent = t[1];
    el("global-search").value = "";
    closeSidebar();
    if (window.matchMedia("(max-width: 900px)").matches) window.scrollTo(0, 0);
  }

  function openSidebar() { el("sidebar").classList.add("open"); el("backdrop").classList.add("show"); }
  function closeSidebar() { el("sidebar").classList.remove("open"); el("backdrop").classList.remove("show"); }

  /* ---------- Boot ---------- */
  function boot() {
    renderDashboard();
    renderClients();
    renderSkills();
    renderPortfolio();
    renderMeetings();
    renderCompany();
    wireSearch();

    document.querySelectorAll(".nav-item").forEach(function (n) {
      n.addEventListener("click", function () { go(n.dataset.view); });
    });
    el("menu-btn").addEventListener("click", openSidebar);
    el("backdrop").addEventListener("click", closeSidebar);
    el("year").textContent = new Date().getFullYear();
    go("dashboard");
  }

  /* ---------- Icons ---------- */
  var ICON = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    robot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M2 14h2M20 14h2"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
  };
  window.__NOMI_ICON = ICON; // exposed for inline nav icons in HTML

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
