const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://1ms23cs094_db_user:AEQZush8GtcXuvfH@cluster0.ug766o7.mongodb.net/farmmate';

async function resetPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find your account
    const user = await User.findOne({ email: 'kushal@gmail.com' });
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('📧 Found account:', user.email);
    console.log('👤 Username:', user.username);

    // Reset password to "test123"
    const newPassword = 'test123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log('');
    console.log('🔑 NEW LOGIN CREDENTIALS:');
    console.log('   Email: kushal@gmail.com');
    console.log('   Password: test123');
    console.log('');
    console.log('👉 Now login with these credentials in your app!');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
