import dotenv from "dotenv";
dotenv.config(); // must be first

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS allow frontend
app.use(cors({
  origin: ["http://localhost:5173", "https://enquiry-from.netlify.app"],
  methods: ["GET", "POST"]
}));

// ✅ Check environment variables
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ Loaded" : "❌ Missing");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");

// ✅ DB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ DB Error:", error);
  }
};
connectDB();

// ✅ Model
const entrySchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  service: String,
  message: String,
});
const Entry = mongoose.model("Entry", entrySchema);

// ✅ Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ POST Route
app.post("/api/entries/add", async (req, res) => {
  try {
    const newEntry = new Entry(req.body);
    await newEntry.save();
    console.log("✅ Booking saved to DB");

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email, // user email
      subject: "Your Booking is Confirmed ✅",
      text: `Hello ${req.body.name}, your booking is received successfully!`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Confirmation email sent");

    res.status(200).json({ message: "Entry Saved & Email Sent ✅" });
  } catch (error) {
    console.log("❌ Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
