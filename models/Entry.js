import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema(
  {
    eventType: String,
    date: String,
    venue: String,
    audienceSize: String,
    duration: String,
    addons: Array,
    notes: String,
    name: String,
    phoneNumber: String,
    email: String,
  },
  { timestamps: true }
);

export default mongoose.model("Entry", EntrySchema);
