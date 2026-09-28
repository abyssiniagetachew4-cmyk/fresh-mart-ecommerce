const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        'ADMIN_EMAIL and ADMIN_PASSWORD must be set in your local .env file.'
      );
    }

    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const user = new User({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    await user.save();

    console.log('✅ Admin account created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log('🔑 Password: [hidden]');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();