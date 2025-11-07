import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * Controller: Add a new booking entry and send confirmation email
 */
export const addEntry = async (req, res) => {
  try {
    // --- Handle uploaded files ---
    const files = req.files || [];
    const imagePaths = files.map(file => file.filename);

    // --- Save entry to MongoDB ---
    const entry = new Entry({
      ...req.body,
      addons: JSON.parse(req.body.addons || "[]"),
      images: imagePaths,
    });
    await entry.save();

    // --- Configure NodeMailer ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // --- Build modern HTML email template ---
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email || process.env.EMAIL_USER, // send to client if provided
      subject: "🎨 Sand Art Booking Confirmation",
      html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2c7da1; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Sand Art Booking Confirmed</h1>
        </div>
        
        <div style="padding: 20px; color: #333;">
          <p>Hi <strong>${req.body.name}</strong>,</p>
          <p>Thank you for booking your sand art event. Here are your event details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Event Type:</td>
              <td style="padding: 8px;">${req.body.eventType}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Date:</td>
              <td style="padding: 8px;">${req.body.date}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Venue:</td>
              <td style="padding: 8px;">${req.body.venue || "—"}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Audience Size:</td>
              <td style="padding: 8px;">${req.body.audienceSize}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Duration:</td>
              <td style="padding: 8px;">${req.body.duration}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Add-ons:</td>
              <td style="padding: 8px;">${(JSON.parse(req.body.addons || "[]")).join(", ") || "None"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Notes:</td>
              <td style="padding: 8px;">${req.body.notes || "None"}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Uploaded Images:</td>
              <td style="padding: 8px;">${imagePaths.length} file(s) uploaded</td>
            </tr>
          </table>

          <p>We will contact you shortly to finalize your booking.</p>
          <p style="margin-top: 40px;">Thanks,<br/><strong>Sand Art Team</strong></p>
        </div>

        <div style="background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #777;">
          &copy; ${new Date().getFullYear()} Sand Art. All rights reserved.
        </div>
      </div>
      `
    };

    // --- Send email ---
    await transporter.sendMail(mailOptions);

    // --- Response to client ---
    res.json({
      status: "success",
      message: "Booking submitted successfully! Confirmation email sent.",
    });

  } catch (err) {
    console.error("Booking submission error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
