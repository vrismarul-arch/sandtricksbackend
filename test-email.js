import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTest() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "arulupsc@gmail.com",
      subject: "Test Email",
      text: "This is a test email from Node.js",
    });
    console.log("✅ Test email sent");
  } catch (err) {
    console.error("❌ Test email failed:", err.message);
  }
}

sendTest();
