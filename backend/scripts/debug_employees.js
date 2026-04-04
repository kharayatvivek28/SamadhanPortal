import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const debugEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');

    const employees = await User.find({ role: 'employee' }).select('+password');

    console.log(`Total employees: ${employees.length}\n`);
    console.log('='.repeat(80));

    for (const emp of employees) {
      const passwordMatch = emp.password 
        ? await bcrypt.compare('123456789', emp.password) 
        : false;

      console.log(`Email: ${emp.email}`);
      console.log(`  authProvider: ${emp.authProvider}`);
      console.log(`  isVerified: ${emp.isVerified}`);
      console.log(`  isFirstLogin: ${emp.isFirstLogin}`);
      console.log(`  hasPassword: ${!!emp.password}`);
      console.log(`  passwordLength: ${emp.password?.length || 0}`);
      console.log(`  password matches '123456789': ${passwordMatch}`);
      console.log(`  createdAt: ${emp.createdAt}`);
      console.log('-'.repeat(80));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugEmployees();
