const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const ServiceListing = require('../src/models/ServiceListing');
const JobRequest = require('../src/models/JobRequest');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://1ms23cs094_db_user:AEQZush8GtcXuvfH@cluster0.ug766o7.mongodb.net/farmmate';

async function seedSimple() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hash password PROPERLY
    const hashedPassword = await bcrypt.hash('test123', 10);
    console.log('✅ Password hashed');

    // Delete existing test users
    await User.deleteMany({ email: { $in: ['provider1@test.com', 'provider2@test.com', 'farmer1@test.com'] }});
    console.log('✅ Cleared old test users');

    // Create 3 simple test users
    const provider1 = await User.create({
      username: 'provider1',
      email: 'provider1@test.com',
      password: hashedPassword,
      displayName: 'Test Provider 1',
      phone: '9111111111',
      location: 'Bailhongal, Belgaum, Karnataka',
      isVerifiedProvider: true,
      averageRating: 4.5
    });

    const provider2 = await User.create({
      username: 'provider2',
      email: 'provider2@test.com',
      password: hashedPassword,
      displayName: 'Test Provider 2',
      phone: '9222222222',
      location: 'Ramanagara, Bangalore, Karnataka',
      isVerifiedProvider: true,
      averageRating: 4.8
    });

    const farmer1 = await User.create({
      username: 'farmer1',
      email: 'farmer1@test.com',
      password: hashedPassword,
      displayName: 'Test Farmer 1',
      phone: '9333333333',
      location: 'Kolar, Kolar, Karnataka',
      isVerifiedFarmer: true
    });

    console.log('✅ Created 3 test users');
    console.log('   📧 Email: provider1@test.com / Password: test123');
    console.log('   📧 Email: provider2@test.com / Password: test123');
    console.log('   📧 Email: farmer1@test.com / Password: test123');

    // Clear existing marketplace data
    await ServiceListing.deleteMany({});
    await JobRequest.deleteMany({});
    console.log('✅ Cleared marketplace data');

    // Create 2 sample services
    const service1 = await ServiceListing.create({
      provider: {
        userId: provider1._id,
        name: provider1.displayName,
        isVerified: true,
        rating: 4.5
      },
      serviceType: "Tractor",
      title: "Tractor Rental with Operator",
      description: "50 HP tractor available for plowing, harrowing, and rotavator work. Experienced operator included.",
      location: { district: "Belgaum", taluk: "Bailhongal", village: "Sanganakatti" },
      phoneNumber: "9111111111",
      rate: { amount: 1200, unit: "per day" },
      isAvailable: true,
      images: []
    });

    const service2 = await ServiceListing.create({
      provider: {
        userId: provider2._id,
        name: provider2.displayName,
        isVerified: true,
        rating: 4.8
      },
      serviceType: "Harvester",
      title: "Paddy Harvester Service",
      description: "Modern combine harvester for paddy and wheat. Fast and efficient harvesting.",
      location: { district: "Bangalore Rural", taluk: "Ramanagara", village: "Channapatna" },
      phoneNumber: "9222222222",
      rate: { amount: 2500, unit: "per acre" },
      isAvailable: true,
      images: []
    });

    console.log('✅ Created 2 sample services');

    // Create 1 sample job request
    const job1 = await JobRequest.create({
      farmer: {
        userId: farmer1._id,
        name: farmer1.displayName,
        isVerified: true
      },
      serviceNeeded: "Tractor",
      title: "Need Tractor for Land Preparation",
      description: "Looking for tractor with rotavator for 5 acres of land. Need to prepare for rabi season.",
      location: { district: "Kolar", taluk: "Kolar", village: "Bangarpet" },
      phoneNumber: "9333333333",
      dateNeeded: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      budgetMin: 5000,
      budgetMax: 7000,
      isActive: true
    });

    console.log('✅ Created 1 sample job request');
    console.log('');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Services: ${await ServiceListing.countDocuments()}`);
    console.log(`   Jobs: ${await JobRequest.countDocuments()}`);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   provider1@test.com / test123');
    console.log('   provider2@test.com / test123');
    console.log('   farmer1@test.com / test123');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedSimple();
