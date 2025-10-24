// Update your account to be a verified provider
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://1ms23cs094_db_user:AEQZush8GtcXuvfH@cluster0.ug766o7.mongodb.net/farmmate';

async function updateUserAccount() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update kushal@gmail.com to be a verified provider
    const result = await User.updateOne(
      { email: 'kushal@gmail.com' },
      { 
        $set: { 
          isVerifiedProvider: true,
          isVerifiedFarmer: true,
          averageRating: 5.0
        } 
      }
    );

    console.log('✅ Updated kushal@gmail.com:');
    console.log('   - Now a Verified Provider ⭐');
    console.log('   - Now a Verified Farmer ⭐');
    console.log('   - Can create service listings AND job requests');
    console.log('   - Rating: 5.0');
    
    // Get updated user
    const user = await User.findOne({ email: 'kushal@gmail.com' }, 'email username displayName isVerifiedProvider averageRating phone');
    console.log('\n📊 Your Account:');
    console.log(JSON.stringify(user, null, 2));

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserAccount();
