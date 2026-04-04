import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const simulateE2E = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');

    const email = `testuser_${Date.now()}@samadhan.com`;
    console.log(`Creating employee: ${email}`);

    // Simulate backend controller 'createEmployee'
    const newEmployee = await User.create({
      name: 'E2E Test User',
      email: email,
      password: '123456789', // backend fallback logic simulated
      role: 'employee',
      isVerified: true,
      department: null,
    });

    console.log('Employee created successfully:', newEmployee._id);
    console.log(`Stored Hash: ${newEmployee.password}`);

    // Simulate AuthController 'login'
    console.log('\nSimulating login...');
    const user = await User.findOne({ email });
    const isMatch = await user.matchPassword('123456789');

    if (isMatch) {
      console.log('[PASS] Password matches correctly.');
    } else {
      console.log('[FAIL] Password mismatch!');
    }

    // Clean up
    await User.findByIdAndDelete(newEmployee._id);
    console.log('\nTest complete and cleaned up.');
    process.exit(0);

  } catch (err) {
    console.error('E2E error:', err);
    process.exit(1);
  }
};

simulateE2E();
