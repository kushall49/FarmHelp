const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ServiceListing = require('../src/models/ServiceListing');
const JobRequest = require('../src/models/JobRequest');
const User = require('../src/models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://1ms23cs094_db_user:AEQZush8GtcXuvfH@cluster0.ug766o7.mongodb.net/farmmate';

// Generate secure test password hash (use env variable ONLY - no fallback)
const generateTestPasswordHash = async () => {
  const testPassword = process.env.TEST_USER_PASSWORD;
  if (!testPassword) {
    throw new Error('TEST_USER_PASSWORD environment variable is required for seeding');
  }
  return await bcrypt.hash(testPassword, 10);
};

async function seedMarketplace() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');
    console.log('✓ Database:', mongoose.connection.name);
    
    // Generate password hash once for all test users
    const passwordHash = await generateTestPasswordHash();
    console.log('✓ Generated secure test password hash');
    
    // Get or create test users
    let user1 = await User.findOne({ email: 'ravi@test.com' });
    if (!user1) {
      user1 = await User.create({
        username: 'ravi_kumar',
        email: 'ravi@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuv', // Hashed password
        displayName: 'Ravi Kumar',
        phone: '9876543210',
        location: 'Hunsur, KR Nagar, Mysuru',
        isVerifiedProvider: true,
        averageRating: 4.5
      });
    }

    let user2 = await User.findOne({ email: 'suresh@test.com' });
    if (!user2) {
      user2 = await User.create({
        username: 'suresh_gowda',
        email: 'suresh@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuv',
        displayName: 'Suresh Gowda',
        phone: '9988776655',
        location: 'Yedatore, Belur, Hassan',
        isVerifiedProvider: false,
        averageRating: 4.0
      });
    }

    let user3 = await User.findOne({ email: 'manjunath@test.com' });
    if (!user3) {
      user3 = await User.create({
        username: 'manjunath',
        email: 'manjunath@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuv',
        displayName: 'Manjunath H R',
        phone: '9123456789',
        location: 'Bellur, Maddur, Mandya',
        isVerifiedProvider: true,
        averageRating: 4.8
      });
    }

    let user4 = await User.findOne({ email: 'prakash@test.com' });
    if (!user4) {
      user4 = await User.create({
        username: 'prakash_reddy',
        email: 'prakash@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuv',
        displayName: 'Prakash Reddy',
        phone: '9876512345',
        location: 'Gorur, Gubbi, Tumakuru',
        isVerifiedFarmer: true
      });
    }

    let user5 = await User.findOne({ email: 'lakshmi@test.com' });
    if (!user5) {
      user5 = await User.create({
        username: 'lakshmi_devi',
        email: 'lakshmi@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuv',
        displayName: 'Lakshmi Devi',
        phone: '9988123456',
        location: 'Binny, Malavalli, Mandya',
        isVerifiedFarmer: false
      });
    }

    console.log('✓ Users ready');

    // Clear existing marketplace data
    await ServiceListing.deleteMany({});
    await JobRequest.deleteMany({});
    console.log('✓ Cleared existing marketplace data');

    // Sample Services
    const services = [
      {
        provider: {
          userId: user1._id,
          name: user1.displayName || user1.username,
          avatar: user1.avatar,
          isVerified: user1.isVerifiedProvider || false,
          rating: user1.averageRating || 0
        },
        serviceType: "Tractor",
        title: "John Deere 5050D Tractor for Rent",
        description: "50 HP tractor with rotavator attachment. Experienced operator available. Well-maintained machine, suitable for all farming activities.",
        location: { district: "Mysuru", taluk: "KR Nagar", village: "Hunsur" },
        phoneNumber: "9876543210",
        rate: { amount: 1200, unit: "per day" },
        images: [],
        isAvailable: true,
        views: 45,
        callsReceived: 12
      },
      {
        provider: {
          userId: user2._id,
          name: user2.displayName || user2.username,
          avatar: user2.avatar,
          isVerified: user2.isVerifiedProvider || false,
          rating: user2.averageRating || 0
        },
        serviceType: "Harvester",
        title: "Combine Harvester Service",
        description: "Modern combine harvester for paddy and wheat. Quick and efficient service. Can harvest 10 acres per day.",
        location: { district: "Hassan", taluk: "Belur", village: "Yedatore" },
        phoneNumber: "9988776655",
        rate: { amount: 2500, unit: "per acre" },
        images: [],
        isAvailable: true,
        views: 32,
        callsReceived: 8
      },
      {
        provider: {
          userId: user3._id,
          name: user3.displayName || user3.username,
          avatar: user3.avatar,
          isVerified: user3.isVerifiedProvider || false,
          rating: user3.averageRating || 0
        },
        serviceType: "Farm Labor",
        title: "Experienced Farm Workers Available",
        description: "Team of 5 experienced workers for all farming activities including planting, weeding, and harvesting. Reliable and hardworking.",
        location: { district: "Mandya", taluk: "Maddur", village: "Bellur" },
        phoneNumber: "9123456789",
        rate: { amount: 500, unit: "per day" },
        images: [],
        isAvailable: true,
        views: 23,
        callsReceived: 5
      },
      {
        provider: {
          userId: user1._id,
          name: user1.displayName || user1.username,
          avatar: user1.avatar,
          isVerified: user1.isVerifiedProvider || false,
          rating: user1.averageRating || 0
        },
        serviceType: "Ploughing",
        title: "Deep Ploughing Service",
        description: "Professional ploughing service with modern equipment. Suitable for all soil types. Fast and efficient work.",
        location: { district: "Mysuru", taluk: "KR Nagar", village: "Saragur" },
        phoneNumber: "9876543210",
        rate: { amount: 800, unit: "per acre" },
        images: [],
        isAvailable: true,
        views: 18,
        callsReceived: 4
      },
      {
        provider: {
          userId: user2._id,
          name: user2.displayName || user2.username,
          avatar: user2.avatar,
          isVerified: user2.isVerifiedProvider || false,
          rating: user2.averageRating || 0
        },
        serviceType: "Pesticide Spraying",
        title: "Pesticide & Fertilizer Spraying",
        description: "Professional spraying service with calibrated sprayer. Covers 20 acres per day. Safe and effective application.",
        location: { district: "Hassan", taluk: "Arsikere", village: "Kallur" },
        phoneNumber: "9988776655",
        rate: { amount: 300, unit: "per acre" },
        images: [],
        isAvailable: true,
        views: 27,
        callsReceived: 6
      },
      {
        provider: {
          userId: user3._id,
          name: user3.displayName || user3.username,
          avatar: user3.avatar,
          isVerified: user3.isVerifiedProvider || false,
          rating: user3.averageRating || 0
        },
        serviceType: "Transport",
        title: "Farm Produce Transport Service",
        description: "6-ton truck available for transporting farm produce to market. Reliable and on-time service. Covers all districts.",
        location: { district: "Mandya", taluk: "Mandya", village: "KRS Road" },
        phoneNumber: "9123456789",
        rate: { amount: 2000, unit: "per day" },
        images: [],
        isAvailable: true,
        views: 41,
        callsReceived: 11
      },
      {
        provider: {
          userId: user1._id,
          name: user1.displayName || user1.username,
          avatar: user1.avatar,
          isVerified: user1.isVerifiedProvider || false,
          rating: user1.averageRating || 0
        },
        serviceType: "Seeding",
        title: "Seed Sowing with Machine",
        description: "Modern seed drill machine for precise sowing. Suitable for all crops. Ensures uniform spacing and depth.",
        location: { district: "Tumakuru", taluk: "Tumakuru", village: "Chikkanayakanahalli" },
        phoneNumber: "9876543210",
        rate: { amount: 600, unit: "per acre" },
        images: [],
        isAvailable: true,
        views: 15,
        callsReceived: 3
      },
      {
        provider: {
          userId: user2._id,
          name: user2.displayName || user2.username,
          avatar: user2.avatar,
          isVerified: user2.isVerifiedProvider || false,
          rating: user2.averageRating || 0
        },
        serviceType: "Irrigation Setup",
        title: "Drip Irrigation Installation",
        description: "Complete drip irrigation system installation. Includes pipes, drippers, and pump setup. Water-efficient solution.",
        location: { district: "Ramanagara", taluk: "Kanakapura", village: "Harohalli" },
        phoneNumber: "9988776655",
        rate: { amount: 15000, unit: "fixed" },
        images: [],
        isAvailable: true,
        views: 38,
        callsReceived: 9
      }
    ];

    // Sample Job Requests
    const jobs = [
      {
        farmer: {
          userId: user4._id,
          name: user4.displayName || user4.username,
          avatar: user4.avatar,
          isVerified: user4.isVerifiedFarmer || false
        },
        serviceNeeded: "Tractor",
        title: "Need Tractor for Ploughing - Urgent",
        description: "10 acres land needs ploughing. Ready to start immediately. Soil type is red soil. Need experienced operator.",
        location: { district: "Tumakuru", taluk: "Gubbi", village: "Gorur" },
        dateNeeded: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        budget: { min: 10000, max: 15000 },
        phoneNumber: "9876512345",
        isOpen: true,
        views: 28,
        responsesReceived: 5
      },
      {
        farmer: {
          userId: user5._id,
          name: user5.displayName || user5.username,
          avatar: user5.avatar,
          isVerified: user5.isVerifiedFarmer || false
        },
        serviceNeeded: "Harvester",
        title: "Paddy Harvesting Required",
        description: "15 acres paddy ready for harvest. Need combine harvester with transport facility. Urgent requirement within 5 days.",
        location: { district: "Mandya", taluk: "Malavalli", village: "Binny" },
        dateNeeded: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        budget: { min: 30000, max: 40000 },
        phoneNumber: "9988123456",
        isOpen: true,
        views: 35,
        responsesReceived: 8
      },
      {
        farmer: {
          userId: user4._id,
          name: user4.displayName || user4.username,
          avatar: user4.avatar,
          isVerified: user4.isVerifiedFarmer || false
        },
        serviceNeeded: "Pesticide Spraying",
        title: "Pesticide Spraying for Tomato Crop",
        description: "5 acres tomato crop needs pesticide spraying. Pest attack detected. Need immediate service tomorrow.",
        location: { district: "Kolar", taluk: "Kolar", village: "Bethamangala" },
        dateNeeded: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        budget: { min: 1500, max: 2000 },
        phoneNumber: "9876512345",
        isOpen: true,
        views: 42,
        responsesReceived: 12
      },
      {
        farmer: {
          userId: user5._id,
          name: user5.displayName || user5.username,
          avatar: user5.avatar,
          isVerified: user5.isVerifiedFarmer || false
        },
        serviceNeeded: "Farm Labor",
        title: "Workers Needed for Weeding",
        description: "Need 8-10 workers for weeding work. 8 acres sunflower crop. Work for 3 days. Food will be provided.",
        location: { district: "Chitradurga", taluk: "Hiriyur", village: "Jodipala" },
        dateNeeded: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        budget: { min: 12000, max: 15000 },
        phoneNumber: "9988123456",
        isOpen: true,
        views: 31,
        responsesReceived: 7
      },
      {
        farmer: {
          userId: user4._id,
          name: user4.displayName || user4.username,
          avatar: user4.avatar,
          isVerified: user4.isVerifiedFarmer || false
        },
        serviceNeeded: "Transport",
        title: "Transport for Onion to Market",
        description: "Need truck to transport 50 bags of onions (2 tons) from farm to APMC market Bangalore. Urgent.",
        location: { district: "Chikkaballapura", taluk: "Bagepalli", village: "Mittemari" },
        dateNeeded: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        budget: { min: 3000, max: 5000 },
        phoneNumber: "9876512345",
        isOpen: true,
        views: 19,
        responsesReceived: 4
      }
    ];

    // Insert data
    const createdServices = await ServiceListing.insertMany(services);
    console.log(`✓ Created ${createdServices.length} service listings`);
    
    const createdJobs = await JobRequest.insertMany(jobs);
    console.log(`✓ Created ${createdJobs.length} job requests`);
    
    // Summary
    console.log('\n═══════════════════════════════════════');
    console.log('✅ MARKETPLACE SEED COMPLETED!');
    console.log('═══════════════════════════════════════');
    console.log(`📦 Total Services: ${createdServices.length}`);
    console.log(`💼 Total Job Requests: ${createdJobs.length}`);
    console.log(`👥 Test Users Created: 5`);
    console.log('═══════════════════════════════════════\n');
    
    // Show breakdown
    console.log('Service Types:');
    const serviceTypes = {};
    services.forEach(s => {
      serviceTypes[s.serviceType] = (serviceTypes[s.serviceType] || 0) + 1;
    });
    Object.entries(serviceTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    
    console.log('\nDistricts Covered:');
    const districts = [...new Set(services.map(s => s.location.district))];
    districts.forEach(d => console.log(`  - ${d}`));
    
    console.log('\n✓ Ready to test Services Marketplace!');
    console.log('✓ Start backend: cd backend && node src/server-minimal.js');
    console.log('✓ Start frontend: cd frontend && npx expo start\n');
    
    await mongoose.disconnect();
    console.log('✓ Disconnected from database');
    
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
}

// Run seed
seedMarketplace();
