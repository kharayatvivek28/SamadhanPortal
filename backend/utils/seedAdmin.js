import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: '123456789',
        role: 'admin',
      });
      console.log('Default admin account created (admin@gmail.com)');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

export default seedAdmin;
