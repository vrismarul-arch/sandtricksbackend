import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  eventType: String,
  date: String,
  venue: String,
  audienceSize: String,
  duration: String,
  addons: [String],
  images: [String],
  name: String,
  phoneNumber: String,
  email: String,
  notes: String,
}, { timestamps: true });

export default mongoose.model("Entry", entrySchema);
