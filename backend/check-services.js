const mongoose = require('mongoose');
const ServiceListing = require('./src/models/ServiceListing');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://1ms23cs094_db_user:AEQZush8GtcXuvfH@cluster0.ug766o7.mongodb.net/farmmate';

async function checkServices() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const count = await ServiceListing.countDocuments();
    console.log('📊 Total services in database:', count);
    console.log('');
    
    const services = await ServiceListing.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title serviceType provider location createdAt');
    
    console.log('🔍 Most recent 5 services:');
    services.forEach((s, i) => {
      console.log(`${i + 1}. ${s.title}`);
      console.log(`   Type: ${s.serviceType}`);
      console.log(`   Provider: ${s.provider.name}`);
      console.log(`   Location: ${s.location.district}, ${s.location.taluk}`);
      console.log(`   Created: ${s.createdAt}`);
      console.log('');
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkServices();
