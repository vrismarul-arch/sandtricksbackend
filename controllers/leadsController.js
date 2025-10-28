// leads.js (Backend Controller)

// Dynamically import node-fetch
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const moment = require("moment");
const { sheets, SPREADSHEET_ID } = require("../utils/googleSheet"); 

// Sheet info (Please ensure these match your actual sheet)
const SHEET_ID = "1geCJIGRqTCwYva81vOkrecrpj6nHEtZeQdB93r8k54A";
const GID = "149469210";
const SHEET_NAME = "Sheet2";

// Map fields to column letters (Used for PATCH/Update)
const FIELD_COLUMN_MAP = {
  Status: "K",
  "ON SITE VIEW": "I",
  TotalPrice: "J", // Column J
  SVJShare: "L",   // Column L
  VrismShare: "M",  // Column M
};

// 🌟 UPDATED: Map messy sheet keys to standardized keys 
const KEY_MAPPING = {
    "Total Price": "TotalPrice",
    "Svj Share": "SVJShare",
    "Vrism Share ": "VrismShare", // IMPORTANT: Note the space
    // 🌟 NEW REVENUE MAPPINGS:
    "Total Revenue": "TotalRevenue",
    "Svj Revenue": "SvjRevenue",
    "Vrism Revenue": "VrismRevenue",
};

// Helper function to extract cell value, prioritizing 'v' (value)
const getCellValue = (cell) => {
  if (!cell) return "";
  // If the cell has a numeric value, use it directly (v)
  if (cell.v !== undefined && typeof cell.v === 'number') return cell.v; 
  // Otherwise, use the formatted value (f) or string value (v)
  return cell.f || cell.v || "";
};

// ------------------------------------------------------------------
/**
 * GET /api/leads
 * Fetches all leads and ensures all numeric fields are properly mapped and numeric.
 */
exports.getFilteredLeads = async (req, res) => {
  const { startDate, endDate, onSite, product } = req.query;

  try {
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`
    );
    const text = await response.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));

    const headers = json.table.cols.map(c => c.label).filter(Boolean);
    const rows = json.table.rows.map(r => r.c.map(getCellValue)); 

    let data = rows.map((row, idx) => {
      const obj = {};
      
      // 1. Map and standardize all keys while reading the data
      headers.forEach((h, i) => {
        const standardizedKey = KEY_MAPPING[h] || h; 
        obj[standardizedKey] = row[i] || "";
      });
      obj.key = idx; 

      // 2. Standardize all numeric values (Shares and Revenue) from the sheet data
      
      const totalPrice = parseFloat(obj.TotalPrice) || 0;
      const status = (obj.Status || "").toUpperCase();

      let SVJShare = parseFloat(obj.SVJShare) || 0;
      let VrismShare = parseFloat(obj.VrismShare) || 0;
      
      // Revenue fields standardization
      let TotalRevenue = parseFloat(obj.TotalRevenue) || 0;
      let SvjRevenue = parseFloat(obj.SvjRevenue) || 0;
      let VrismRevenue = parseFloat(obj.VrismRevenue) || 0;
      
      // Safeguard: Recalculate shares only if status is Completed but shares are missing
      if (status === "COMPLETED" && totalPrice > 0 && (SVJShare === 0 && VrismShare === 0)) {
          SVJShare = +(totalPrice * 0.7).toFixed(2);
          VrismShare = +(totalPrice * 0.3).toFixed(2);
      }
      
      // 3. Final standardized object values (ensuring they are numeric)
      obj.TotalPrice = totalPrice; 
      obj.SVJShare = SVJShare;
      obj.VrismShare = VrismShare;
      obj.TotalRevenue = TotalRevenue;
      obj.SvjRevenue = SvjRevenue;
      obj.VrismRevenue = VrismRevenue;

      return obj;
    });

    // Optional filters (kept for completeness)
    if (startDate && endDate) {
      const start = moment(startDate);
      const end = moment(endDate);
      data = data.filter(d => moment(d.submittedAt).isBetween(start, end, undefined, "[]"));
    }
    if (onSite) data = data.filter(d => (d["ON SITE VIEW"] || "").toUpperCase() === onSite.toUpperCase());
    if (product) data = data.filter(d => (d.Product || "").toLowerCase().includes(product.toLowerCase()));

    res.json(data);
  } catch (err) {
    console.error("❌ Fetch leads error:", err);
    res.status(500).json({ error: "Failed to fetch leads from Google Sheet" });
  }
};

// ------------------------------------------------------------------
/**
 * PATCH /api/leads/:key
 * This function remains correct for updating Price and Status.
 */
exports.updateLeadField = async (req, res) => {
  const { key } = req.params;
  const update = req.body; 

  try {
    const rowNumber = parseInt(key, 10) + 2; 
    const field = Object.keys(update)[0];
    const newValue = update[field];

    if (!FIELD_COLUMN_MAP[field]) return res.status(400).json({ error: `Field ${field} is not editable` });

    const columnLetter = FIELD_COLUMN_MAP[field];

    // 1. Update the main field
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${columnLetter}${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[newValue]] },
    });

    // 2. Fetch current TotalPrice and Status for re-calculation
    const [totalPriceRes, statusRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!J${rowNumber}` }),
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!K${rowNumber}` }),
    ]);

    // Get the most up-to-date values, preferring the newly updated value
    let totalPrice = parseFloat(totalPriceRes.data.values?.[0]?.[0] || 0);
    let status = statusRes.data.values?.[0]?.[0] || "";

    if (field === "TotalPrice") totalPrice = parseFloat(newValue) || 0;
    if (field === "Status") status = newValue;

    // 3. Re-calculate Shares (L & M)
    const SVJShare = status.toUpperCase() === "COMPLETED" ? +(totalPrice * 0.7).toFixed(2) : 0;
    const VrismShare = status.toUpperCase() === "COMPLETED" ? +(totalPrice * 0.3).toFixed(2) : 0;

    // 4. Update shares in the sheet (Important for persistence on refresh)
    await Promise.all([
      sheets.spreadsheets.values.update({ 
        spreadsheetId: SPREADSHEET_ID, 
        range: `${SHEET_NAME}!L${rowNumber}`, 
        valueInputOption: "USER_ENTERED", 
        requestBody: { values: [[SVJShare]] } 
      }),
      sheets.spreadsheets.values.update({ 
        spreadsheetId: SPREADSHEET_ID, 
        range: `${SHEET_NAME}!M${rowNumber}`, 
        valueInputOption: "USER_ENTERED", 
        requestBody: { values: [[VrismShare]] } 
      }),
    ]);

    // 5. Respond with the recalculated shares for immediate UI update
    res.json({ success: true, key, update, SVJShare, VrismShare });
  } catch (err) {
    console.error("❌ Sheet update error:", err);
    res.status(500).json({ error: "Failed to update Google Sheet" });
  }
};