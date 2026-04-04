import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "./models/User.js";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ role: 'admin' }).select("-password");
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUsers();
