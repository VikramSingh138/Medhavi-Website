import mongoose from "mongoose";

const userTrackingSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userAgent: String,
  language: String,
  platform: String,
  cookieEnabled: Boolean,
  doNotTrack: String,
  screenWidth: Number,
  screenHeight: Number,
  screenColorDepth: Number,
  windowWidth: Number,
  windowHeight: Number,
  timezone: String,
  canvasFingerprint: String,
  sessionStart: Date,
  webGL: Boolean,
  touchSupport: Boolean,
  localStorage: Boolean,
  sessionStorage: Boolean,
  connectionType: String,
  ipAddress: String, // Will be captured on backend
  visitCount: { type: Number, default: 1 },
  lastVisit: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Create index on sessionId for faster queries
userTrackingSchema.index({ sessionId: 1 });
userTrackingSchema.index({ createdAt: -1 });

export default mongoose.model("UserTracking", userTrackingSchema);