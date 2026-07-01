/**
 * Shared helpers for the multi-step application form.
 * Data is kept in sessionStorage under "leadData" while the user moves
 * between step1.html -> step2.html -> step3.html -> thank-you.html.
 */
const STORAGE_KEY = "leadData";

function getLeadData() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveLeadData(partial) {
  const current = getLeadData();
  const merged = Object.assign(current, partial);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

function clearLeadData() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Redirects back to step1 if required earlier-step fields are missing. */
function requireStep1(data) {
  if (!data.name || !data.whatsapp || !data.email || !data.industry) {
    window.location.href = "step1.html";
    return false;
  }
  return true;
}

function requireStep2(data) {
  if (!data.budget || !data.goal) {
    window.location.href = "step2.html";
    return false;
  }
  return true;
}

function showFieldError(fieldEl, message) {
  const wrapper = fieldEl.closest(".field");
  if (!wrapper) return;
  wrapper.classList.add("has-error");
  fieldEl.classList.add("error");
  const msg = wrapper.querySelector(".error-msg");
  if (msg && message) msg.textContent = message;
}

function clearFieldError(fieldEl) {
  const wrapper = fieldEl.closest(".field");
  if (!wrapper) return;
  wrapper.classList.remove("has-error");
  fieldEl.classList.remove("error");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^[0-9+\s-]{7,20}$/.test(value);
}

function isValidUrl(value) {
  if (!value) return true;
  return /^https?:\/\/.+/i.test(value) || /^(www\.)?[a-z0-9-]+\.[a-z]{2,}/i.test(value);
}

/** Best-effort submission to the Google Apps Script webhook. Never blocks navigation. */
function submitLeadToSheet(data) {
  const url = window.CONFIG && window.CONFIG.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url || url.includes("REPLACE_WITH")) {
    console.warn("Google Sheets webhook URL is not configured yet — skipping lead submission.");
    return Promise.resolve();
  }
  return fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data),
  }).catch((err) => {
    console.error("Lead submission failed:", err);
  });
}
