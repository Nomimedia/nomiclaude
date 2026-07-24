/* =============================================================================
   NOMI MEDIA OS — CENTRAL DATA FILE
   -----------------------------------------------------------------------------
   This single file powers the entire OS dashboard. To update anything shown in
   the OS (clients, meetings, portfolio, team, etc.), edit the values below and
   re-upload this file. No build tools required.

   Seeded from live Notion / Google Drive / Google Calendar data on 2026-07-24.
   ============================================================================= */

window.NOMI_DATA = {

  /* ---------------------------------------------------------------------------
     COMPANY — your agency profile, shown across the OS
  --------------------------------------------------------------------------- */
  company: {
    name: "Nomi Media",
    legalName: "NOMI Media (NMM)",
    tagline: "New media & social media marketing agency",
    email: "admin@nomimediamy.com",
    website: "nomimediamy.com",
    timezone: "Asia/Kuala_Lumpur (GMT+8)",
    location: "Malaysia",
    about:
      "Nomi Media delivers comprehensive social media marketing solutions that drive growth, engagement, and conversions for our clients. We target brands that want to grow through new media and social media marketing across Xiaohongshu (XHS), TikTok, Instagram, Threads and X.",
    platforms: ["Xiaohongshu (XHS)", "TikTok", "Instagram", "Threads", "X (Twitter)"],
    services: [
      "Social media marketing strategy",
      "Content strategy & 24-day content planner",
      "Short-video production & editing",
      "Shotlist planning",
      "Social media account management",
      "Monthly reporting & consultation",
      "Talent / creator content (UGC & ads)"
    ]
  },

  /* ---------------------------------------------------------------------------
     SERVICE PACKAGES — from your Notion PACKAGE OFFER page
  --------------------------------------------------------------------------- */
  packages: [
    {
      name: "Trial (1+2)",
      price: "RM9,000",
      unit: "/package",
      note: "For accounts with followers below 1,000 · 2 months + 1 month prep",
      highlight: false,
      features: [
        "Marketing strategy (XHS / TikTok / Instagram)",
        "5 content video edits",
        "24-day content strategy & planner",
        "Shotlist plan",
        "Monthly report",
        "1x monthly consultation",
        "FREE Threads management (3 months)"
      ]
    },
    {
      name: "Basic",
      price: "RM3,500",
      unit: "/month",
      note: "Perfect for individuals and small projects · 6 months servicing",
      highlight: false,
      features: [
        "Marketing strategy (XHS / TikTok / Instagram)",
        "24-day content strategy & planner",
        "Shotlist plan",
        "10 video edits",
        "Monthly report",
        "1x monthly consultation"
      ]
    },
    {
      name: "Growth",
      price: "RM5,500",
      unit: "/month",
      note: "Ideal for growing businesses · 6 months servicing",
      highlight: true,
      features: [
        "Monthly marketing strategy & plan",
        "15 content videos",
        "Shotlist plan",
        "1x social media management (IG / TikTok / XHS / Threads / X)",
        "1x monthly consultation"
      ]
    },
    {
      name: "Premium",
      price: "RM9,899",
      unit: "/month",
      note: "For large organizations with complex needs · 6 months servicing",
      highlight: false,
      features: [
        "Full-stack package",
        "Monthly marketing strategy & plan",
        "20 content videos",
        "All 5 platforms managed (IG / TikTok / XHS / Threads / X)",
        "1x monthly consultation"
      ]
    },
    {
      name: "Creator Package",
      price: "RM2,899",
      unit: "one-off",
      note: "Was RM3,080 · No management provided",
      highlight: false,
      features: [
        "1x talent creator — 2 hours shooting",
        "4x content ads + educative content",
        "4x video scripts",
        "Video shooting",
        "4x photo covers",
        "Caption writing + copywriting"
      ]
    }
  ],

  /* ---------------------------------------------------------------------------
     CLIENTS — one card each. status: "active" | "onboarding" | "lead" | "past"
  --------------------------------------------------------------------------- */
  clients: [
    {
      name: "JCI",
      status: "active",
      package: "Growth",
      contact: "",
      platforms: ["Instagram", "TikTok"],
      notes: "Latest invoice INV2026-NMM-00019. Active servicing.",
      links: [
        { label: "Invoice", url: "https://docs.google.com/spreadsheets/d/1GpJ0t_q7n6wq0UfNXUY4CvPhnD039Iwn0jpe0btifyU/edit" }
      ]
    },
    {
      name: "Pastry Lab",
      status: "active",
      package: "Basic",
      contact: "",
      platforms: ["Instagram", "Xiaohongshu (XHS)"],
      notes: "Invoice INV2026-NMM-00018. F&B / pastry brand.",
      links: [
        { label: "Invoice", url: "https://docs.google.com/spreadsheets/d/1YaPHbyvj2WfGbTk0k1o1oqqBtwcXPEGESE8xisy_rZs/edit" }
      ]
    },
    {
      name: "Ostrich Films",
      status: "onboarding",
      package: "In discussion",
      contact: "",
      platforms: ["Instagram", "TikTok"],
      notes: "Discovery meeting held 2 Jul 2026 (notes captured by Gemini). Production house.",
      links: [
        { label: "Meeting notes", url: "https://docs.google.com/document/d/1Wr_jesl8EMDl6OiEbL74j77nJMXsGDnFZYwR4tbPWes/edit" }
      ]
    },
    {
      name: "Sophia (Talent)",
      status: "active",
      package: "Creator / Personal branding",
      contact: "",
      platforms: ["Instagram", "TikTok"],
      notes: "Personal branding talent. Priority scheduling per onboarding meeting.",
      links: []
    }
  ],

  /* ---------------------------------------------------------------------------
     SKILLS — reusable playbooks / capabilities your team runs
  --------------------------------------------------------------------------- */
  skills: [
    { name: "Brand Presence Audit", category: "Audit", desc: "Full diagnostic of a brand's entire online footprint — website, search, every social platform, reviews, directories — delivered as an HTML report." },
    { name: "Brand Audit (Social)", category: "Audit", desc: "Data-driven social audit for client accounts with niche research, content pillar performance and a 30-day content direction plan." },
    { name: "Content Planner", category: "Content", desc: "Multi-platform content research across X, Instagram, YouTube & TikTok, aggregated into actionable content plans and playbooks." },
    { name: "Instagram Research", category: "Research", desc: "Find high-performing Instagram posts/reels from tracked accounts, identify outliers, extract hook formulas." },
    { name: "TikTok Ads Strategy", category: "Ads", desc: "Design TikTok advertising strategies for client campaigns." },
    { name: "Video Content Analyzer", category: "Content", desc: "Analyze short-form videos (Reels/TikTok/Shorts) with AI to extract hooks, structure and replicable patterns." },
    { name: "Threads Client Content", category: "Content", desc: "Guided onboarding + Threads post generation, HTML preview, and export straight to the client's Notion." },
    { name: "Client Proposal Deck", category: "Sales", desc: "Build a client-ready proposal deck (9 sections) from a reusable dark-card template and export to .pptx." },
    { name: "Creator Workshop", category: "Content", desc: "End-to-end creator workshop: persona → 4-week content calendar → 3 ready-to-film scripts, written into a branded Notion profile." },
    { name: "30-Day Content Plan", category: "Content", desc: "Signature productized offer — a full 30-day content calendar with ready-to-shoot captions and scripts, delivered in 3 working days." }
  ],

  /* ---------------------------------------------------------------------------
     AGENTS — automated / AI agents your team operates
  --------------------------------------------------------------------------- */
  agents: [
    { name: "Queenie Content Bank Agent", status: "active", desc: "Turns one topic or idea into funnel-mapped (TOFU/MOFU/BOFU) short-video angles and ready-to-film scripts, in Mandarin/Malaysian mixed language." },
    { name: "Threads Auto-Daily", status: "active", desc: "Auto-generates 20 Threads posts daily at 8am for @queenieyan.13 and saves them straight to Notion — no approval needed." },
    { name: "AI Specialist Router", status: "active", desc: "Matches a task to the best of 70 specialist agents and delivers expert-level output." }
  ],

  /* ---------------------------------------------------------------------------
     MEETINGS — synced from Google Calendar (NOMI Media My)
     status: "upcoming" | "done"
  --------------------------------------------------------------------------- */
  meetings: [
    {
      title: "Meeting With Ostrich Films",
      date: "2026-07-02T11:00:00+08:00",
      status: "done",
      attendees: "Nomi Media × Ostrich Films",
      meetUrl: "https://meet.google.com/cxj-zxhw-anu",
      notesUrl: "https://docs.google.com/document/d/1Wr_jesl8EMDl6OiEbL74j77nJMXsGDnFZYwR4tbPWes/edit",
      summary: "Discovery / intro meeting. Notes captured by Gemini."
    }
  ],

  /* ---------------------------------------------------------------------------
     PORTFOLIO — showcase of work & case studies
  --------------------------------------------------------------------------- */
  portfolio: [
    { title: "30-Day Content Plan System", client: "Productized offer", type: "Content system", desc: "Landing page + application funnel selling a done-for-you 30-day content plan, delivered in 3 working days." },
    { title: "Pastry Lab — Social Media", client: "Pastry Lab", type: "Social management", desc: "Ongoing content & social media management for an F&B / pastry brand across IG and XHS." },
    { title: "JCI — Growth Package", client: "JCI", type: "Growth marketing", desc: "Full growth-package servicing: strategy, 15 videos/mo, and multi-platform management." },
    { title: "Personal Branding — Sophia", client: "Sophia", type: "Creator / talent", desc: "Personal branding build-out and content production for a talent creator." }
  ],

  /* ---------------------------------------------------------------------------
     INTEGRATIONS — connected tools (status is informational)
  --------------------------------------------------------------------------- */
  integrations: [
    { name: "Notion", status: "connected", desc: "Client workspaces, content calendars, meeting notes, content banks." },
    { name: "Google Drive", status: "connected", desc: "Invoices, content planner templates, onboarding forms, assets." },
    { name: "Google Calendar", status: "connected", desc: "Client & team meetings (NOMI Media My)." },
    { name: "Gmail", status: "connected", desc: "Client email & outreach." },
    { name: "ClickUp", status: "available", desc: "Project & task management." },
    { name: "Canva", status: "available", desc: "Design & brand templates." },
    { name: "Apify", status: "available", desc: "Social scraping & research (IG / TikTok / XHS)." }
  ]
};
