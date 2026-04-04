import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const testPasswordHash = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Find one of the employees we just reset
    const user = await User.findOne({ email: 'rajeshkumar@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    console.log(`\n--- Simulating login for: ${user.email} ---`);
    console.log(`User object:`, {
       _id: user._id,
       role: user.role,
       authProvider: user.authProvider,
       isVerified: user.isVerified,
       isFirstLogin: user.isFirstLogin,
       profileCompleted: user.profileCompleted
    });

    if (user.authProvider !== 'local') {
      console.log(`[FAILED] This account uses ${user.authProvider} sign-in. Please use that method.`);
    } else {
      console.log(`[PASS] AuthProvider is local.`);
    }

    const isMatch = await user.matchPassword('123456789');
    if (!isMatch) {
      console.log(`[FAILED] Invalid email or password (bcrypt mismatch)`);
    } else {
      console.log(`[PASS] Password matched.`);
    }

    console.log(`[INFO] isVerified: ${user.isVerified}`);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
};

testPasswordHash();
