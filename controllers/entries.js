// controllers/entries.js
import Entry from "../models/Entry.js";
import { supabase } from "../utils/supabase.js"; // Supabase client
import nodemailer from "nodemailer";

// Helper: upload file to Supabase
const uploadFileToSupabase = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const { error } = await supabase.storage
    .from("tintd") // bucket name
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });
  if (error) throw error;

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/tintd/${fileName}`;
};

export const addEntry = async (req, res) => {
  try {
    console.log("📌 req.body:", req.body);
    console.log("📌 req.files:", req.files);

    // 1️⃣ Upload images to Supabase
    const files = req.files || [];
    const imageUrls = await Promise.all(files.map(f => uploadFileToSupabase(f)));

    // 2️⃣ Parse add-ons array
    let addonsArray = [];
    try { addonsArray = JSON.parse(req.body.addons || "[]"); } catch {}

    // 3️⃣ Create MongoDB entry
    const entry = new Entry({
      ...req.body,
      addons: addonsArray,
      images: imageUrls,
    });
    await entry.save();

    // 4️⃣ Send confirmation email (optional)
    if (req.body.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Gmail App Password
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: req.body.email,
          subject: "🎨 Sand Art Booking Confirmation",
          html: `<div style="font-family:Arial,sans-serif;">
            <h2>Hi ${req.body.name}, your booking is confirmed!</h2>
            <p>Event Type: ${req.body.eventType}</p>
            <p>Date: ${req.body.date}</p>
            <p>Audience: ${req.body.audienceSize}</p>
            <p>Duration: ${req.body.duration}</p>
          </div>`,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent to", req.body.email);
      } catch (err) {
        console.warn("⚠ Email failed:", err.message);
      }
    }

    // 5️⃣ Send response
    res.json({ status: "success", message: "Booking submitted!", data: entry });
  } catch (err) {
    console.error("❌ Booking submission error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
