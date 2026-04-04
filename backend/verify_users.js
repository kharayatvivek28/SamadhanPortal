import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "./models/User.js";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

const verifyInternalUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.updateMany(
      { role: { $in: ["admin", "employee"] } },
      { $set: { isVerified: true } }
    );
    console.log(`Updated ${result.modifiedCount} users to be verified.`);
    process.exit(0);
  } catch (error) {
    console.error("Error setting verification:", error);
    process.exit(1);
  }
};

verifyInternalUsers();
