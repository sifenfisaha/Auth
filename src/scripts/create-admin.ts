import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model";

dotenv.config();

const DB_URI = process.env.MONGO_URI;

(async () => {
  await mongoose.connect(DB_URI!);
  const email = "admintest@example.com";
  const password = "admin123";
  const name = "admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }
  const user = new User({ email, name, password });
  user.role = "admin";
  await user.save();
  console.log("Admin user created");
  process.exit(0);
})();

// npx ts-node-dev src/scripts/create-admin.ts
