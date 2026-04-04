import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const queryRecentUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');

    const recentEmployees = await User.find({ role: 'employee' }).sort({ createdAt: -1 }).limit(5);
    
    console.log('--- RECENT 5 EMPLOYEES ---');
    recentEmployees.forEach(emp => {
      console.log(`Email: ${emp.email}`);
      console.log(`Password Hash length: ${emp.password ? emp.password.length : 'MISSING/NULL'}`);
      console.log(`IsFirstLogin: ${emp.isFirstLogin}`);
      console.log('---------------------------');
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

queryRecentUsers();
