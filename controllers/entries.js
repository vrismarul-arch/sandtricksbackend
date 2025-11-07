import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const addEntry = async (req, res) => {
  try {
    // --- Uploaded files ---
    const files = req.files || [];
    const imagePaths = files.map(f => f.filename);

    // --- Save to DB ---
    const entry = new Entry({
      ...req.body,
      addons: JSON.parse(req.body.addons || "[]"),
      images: imagePaths
    });
    await entry.save();

    // --- Send confirmation email ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.body.email || process.env.EMAIL_USER,
      subject: "🎨 Sand Art Booking Confirmation",
      html: `<p>Hi ${req.body.name}, your booking is confirmed!</p>`
    });

    res.json({ status: "success", message: "Booking saved and email sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
