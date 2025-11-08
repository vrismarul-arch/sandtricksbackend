import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  date: { type: String, required: true },
  venue: { type: String },
  audienceSize: { type: String, required: true },
  duration: { type: String, required: true },
  addons: { type: [String], default: [] },
  images: { type: [String], default: [] },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model("Entry", entrySchema);
