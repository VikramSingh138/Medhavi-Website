import mongoose from "mongoose";

const userCountSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
});

export default mongoose.model("UserCount", userCountSchema);
