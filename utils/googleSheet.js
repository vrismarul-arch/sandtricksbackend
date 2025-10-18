const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const CREDENTIALS_PATH = path.join(__dirname, "../config/credentials.json");
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Replace with your actual Google Sheet ID
const SPREADSHEET_ID = "1geCJIGRqTCwYva81vOkrecrpj6nHEtZeQdB93r8k54A";

module.exports = { sheets, SPREADSHEET_ID };
