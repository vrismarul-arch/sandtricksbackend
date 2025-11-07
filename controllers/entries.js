import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";

export const addEntry = async (req, res) => {
  try {
    const files = req.files || [];
    const imagePaths = files.map(f => f.filename);

    let addonsArray = [];
    try { addonsArray = JSON.parse(req.body.addons || "[]"); } catch {}

    const entry = new Entry({
      ...req.body,
      addons: addonsArray,
      images: imagePaths,
    });
    await entry.save();

    if (req.body.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: req.body.email,
          subject: "🎨 Sand Art Booking Confirmation",
          html: `<p>Hi ${req.body.name}, your booking is confirmed!</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent to", req.body.email);
      } catch (err) {
        console.warn("⚠ Email failed:", err.message);
      }
    }

    res.json({ status: "success", message: "Booking submitted!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
