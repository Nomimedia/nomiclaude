/**
 * Google Apps Script — receives lead submissions from the landing page
 * (step2.html) and appends them as a row in a "Leads" sheet.
 *
 * SETUP:
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 *    (e.g. "Nomi Media Leads").
 * 2. In the sheet, go to Extensions > Apps Script.
 * 3. Delete any starter code and paste in this entire file.
 * 4. Click Deploy > New deployment.
 *    - Type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Click Deploy, authorize the permissions when prompted.
 * 6. Copy the resulting Web App URL.
 * 7. Paste that URL into GOOGLE_SHEETS_WEBHOOK_URL in
 *    assets/js/config.js on the website.
 *
 * The spreadsheet lives in your Google Drive, so every submission is
 * stored there automatically.
 */

const SHEET_NAME = "Leads";
const HEADERS = [
  "Timestamp",
  "Name",
  "WhatsApp",
  "Email",
  "Industry",
  "Instagram",
  "Facebook",
  "TikTok",
  "Website",
  "Monthly Budget",
  "Main Goal",
  "Source",
];

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet_();

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.whatsapp || "",
      data.email || "",
      data.industry || "",
      data.instagram || "",
      data.facebook || "",
      data.tiktok || "",
      data.website || "",
      data.budget || "",
      data.goal || "",
      data.source || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
