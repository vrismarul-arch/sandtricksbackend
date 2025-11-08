import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema({
  eventType: { type: String },
  date: { type: String },
  venue: { type: String },
  audienceSize: { type: String },
  duration: { type: String },
  addons: [{ type: String }],
  name: { type: String },
  phoneNumber: { type: String },
  email: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model("Entry", EntrySchema);
