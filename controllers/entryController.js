import Entry from "../models/Entry.js";
import nodemailer from "nodemailer";

export const addEntry = async (req, res) => {
  try {
    const entry = new Entry(req.body);
    await entry.save();
    console.log("✅ Booking saved to DB");

    sendEmail(req.body).catch((err) => console.log("⚠ Email Failed:", err));

    res.status(200).json({ message: "Booking Submitted Successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const testEmail = async (req, res) => {
  try {
    await sendEmail({
      name: "Test User",
      email: process.env.EMAIL_USER,
      phoneNumber: "0000000000",
      eventType: "Testing Email",
      date: "-",
      duration: "-",
    });
    res.send("✅ EMAIL SENT SUCCESSFULLY");
  } catch (e) {
    res.send("❌ EMAIL FAILED: " + e.message);
  }
};

async function sendEmail(data) {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailToYou = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "New Sand Art Booking!",
    text: `New booking received:
Name: ${data.name}
Phone: ${data.phoneNumber}
Event: ${data.eventType}
Date: ${data.date}
Duration: ${data.duration}`
  };

  const mailToUser = {
    from: process.env.EMAIL_USER,
    to: data.email,
    subject: "Your Sand Art Booking Confirmed ✅",
    text: `Hi ${data.name}, thank you! We received your booking. We will contact you soon.`
  };

  await transporter.sendMail(mailToYou);
  if (data.email) await transporter.sendMail(mailToUser);

  console.log("📩 Emails sent successfully");
}
