import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";

export const addEntry = async (req, res) => {
  try {
    const files = req.files || [];
    const imagePaths = files.map(file => file.filename);

    // Parse addons safely
    let addonsArray = [];
    try { addonsArray = JSON.parse(req.body.addons || "[]"); } catch {}

    // Save entry in MongoDB
    const entry = new Entry({
      ...req.body,
      addons: addonsArray,
      images: imagePaths,
    });
    await entry.save();

    // Send confirmation email if email exists
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
          html: `<div style="font-family:Arial,sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:8px;">
            <div style="background:#2c7da1; color:white; padding:20px; text-align:center;">
              <h1>Sand Art Booking Confirmed</h1>
            </div>
            <div style="padding:20px;">
              <p>Hi <strong>${req.body.name}</strong>,</p>
              <p>Thank you for booking your sand art event. Event details:</p>
              <table style="width:100%; border-collapse:collapse;">
                <tr><td><strong>Event Type:</strong></td><td>${req.body.eventType}</td></tr>
                <tr><td><strong>Date:</strong></td><td>${req.body.date}</td></tr>
                <tr><td><strong>Venue:</strong></td><td>${req.body.venue || "—"}</td></tr>
                <tr><td><strong>Audience Size:</strong></td><td>${req.body.audienceSize}</td></tr>
                <tr><td><strong>Duration:</strong></td><td>${req.body.duration}</td></tr>
                <tr><td><strong>Add-ons:</strong></td><td>${addonsArray.join(", ") || "None"}</td></tr>
                <tr><td><strong>Notes:</strong></td><td>${req.body.notes || "None"}</td></tr>
                <tr><td><strong>Uploaded Images:</strong></td><td>${imagePaths.length} file(s)</td></tr>
              </table>
              <p>We will contact you shortly to finalize your booking.</p>
              <p>Thanks,<br/><strong>Sand Art Team</strong></p>
            </div>
          </div>`
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Confirmation email sent to", req.body.email);

      } catch (err) {
        console.warn("⚠ Failed to send email:", err.message);
      }
    }

    res.json({ status: "success", message: "Booking submitted successfully!" });

  } catch (err) {
    console.error("Booking submission error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
