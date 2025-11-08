import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";

// --- Add a booking ---
export const addEntry = async (req, res) => {
  try {
    const data = req.body;

    // Ensure addons is an array
    let addonsArray = [];
    try { addonsArray = typeof data.addons === "string" ? JSON.parse(data.addons) : data.addons || []; } catch {}

    const entry = new Entry({
      ...data,
      addons: addonsArray,
    });

    await entry.save();
    console.log("✅ Booking saved to DB");

    // Send confirmation email
    if (data.email) {
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
          from: `"Sand Art Team" <${process.env.EMAIL_USER}>`,
          to: data.email,
          subject: "🎨 Sand Art Booking Confirmation",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>Hi ${data.name}, your booking is confirmed!</h2>
              <h3>Booking Details:</h3>
              <ul>
                <li><strong>Event Type:</strong> ${data.eventType}</li>
                <li><strong>Date:</strong> ${data.date}</li>
                <li><strong>Audience Size:</strong> ${data.audienceSize}</li>
                <li><strong>Duration:</strong> ${data.duration}</li>
                <li><strong>Add-ons:</strong> ${addonsArray.length ? addonsArray.join(", ") : "None"}</li>
              </ul>
              <p>We will contact you shortly to finalize the details.</p>
              <p style="color: #555; font-style: italic;">— Sand Art Team</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Confirmation email sent to", data.email);
      } catch (err) {
        console.warn("⚠ Email failed:", err.message);
      }
    }

    res.json({ status: "success", message: "Booking submitted!" });
  } catch (err) {
    console.error("❌ Booking submission error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// --- Get all bookings ---
export const getAllEntries = async (req, res) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 }); // newest first
    res.json({ status: "success", data: entries });
  } catch (err) {
    console.error("❌ Fetch entries error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
