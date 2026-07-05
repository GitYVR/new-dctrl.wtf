/**
 * dctrl. — Access Request → Google Sheet
 *
 * Receives form POSTs from the site and appends one row per submission.
 * Columns are created automatically from the field names that arrive,
 * so you don't have to keep this in sync with the form.
 *
 * ── SETUP ──────────────────────────────────────────────────────────
 * 1. Create a Google Sheet (sheets.new). This is where rows land.
 * 2. Extensions ▸ Apps Script. Delete the placeholder, paste this file.
 * 3. Click Deploy ▸ New deployment ▸ type "Web app".
 *      - Execute as:        Me
 *      - Who has access:    Anyone
 *    Deploy, authorize when prompted, and copy the Web app URL
 *    (it ends in /exec).
 * 4. Paste that URL into SHEET_ENDPOINT at the top of components.jsx.
 * 5. Submit the form once — a header row + your data row appear.
 *
 * To change the sheet/tab, edit SHEET_NAME below.
 */

var SHEET_NAME = "Submissions";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // avoid two submissions colliding on the header row
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    var params = (e && e.parameter) ? e.parameter : {};

    // Ensure a header row exists.
    var headers = [];
    if (sheet.getLastRow() > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    if (headers.length === 0) {
      headers = ["received_at"];
      sheet.appendRow(headers);
    }

    // Add any new field names as columns.
    Object.keys(params).forEach(function (key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        sheet.getRange(1, headers.length).setValue(key);
      }
    });

    // Build the row in header order.
    var row = headers.map(function (h) {
      if (h === "received_at") return new Date();
      return params[h] !== undefined ? params[h] : "";
    });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Lets you sanity-check the deployment in a browser (GET the /exec URL).
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: "dctrl access-request endpoint live" }))
    .setMimeType(ContentService.MimeType.JSON);
}
