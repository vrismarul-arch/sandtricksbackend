import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";
import { uploadToSupabase } from "../utils/supabase.js";

export const addEntry = async (req, res) => {
  try {
    console.log("📌 req.body:", req.body);
    console.log("📌 req.files:", req.files);

    const files = req.files || [];
    const imagePaths = [];

    // Upload files to Supabase
    for (let file of files) {
      const url = await uploadToSupabase(file);
      imagePaths.push(url);
    }

    let addonsArray = [];
    try { addonsArray = JSON.parse(req.body.addons || "[]"); } catch {}

    const entry = new Entry({
      ...req.body,
      addons: addonsArray,
      images: imagePaths,
    });
    await entry.save();

    // Send email if email provided
    if (req.body.email) {
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
    }

    res.json({ status: "success", message: "Booking submitted!", images: imagePaths });
  } catch (err) {
    console.error("❌ Booking submission error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
