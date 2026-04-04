import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const resetAllEmployeePasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Find ALL employees regardless of isFirstLogin status
    const allEmployees = await User.find({ role: 'employee' });

    if (allEmployees.length === 0) {
      console.log('No employee accounts found. Exiting.');
      process.exit(0);
    }

    console.log(`Found ${allEmployees.length} total employee accounts.`);

    let updatedCount = 0;
    for (const employee of allEmployees) {
      employee.password = '123456789';
      employee.isFirstLogin = true;  // Force first-login flow for everyone
      await employee.save();
      console.log(`Reset password & isFirstLogin for: ${employee.email}`);
      updatedCount++;
    }

    console.log(`Successfully reset default password for ${updatedCount} employees.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating employee passwords:', error);
    process.exit(1);
  }
};

resetAllEmployeePasswords();
