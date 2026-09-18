const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('[CONFIG] Missing MongoDB connection string. Set MONGODB_URI (preferred) or MONGO_URI.');
  process.exit(1);
}

console.log('Testing MongoDB Atlas connection...');
console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':***@')); // Hide password

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully!');
  
  // List collections
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('Error listing collections:', err);
    } else {
      console.log('\nAvailable collections:');
      collections.forEach(c => console.log('  -', c.name));
    }
    
    process.exit(0);
  });
})
.catch(err => {
  console.error('❌ MongoDB Atlas connection failed!');
  console.error('Error:', err.message);
  console.error('\nPossible issues:');
  console.error('1. Network/Firewall blocking MongoDB Atlas');
  console.error('2. IP address not whitelisted in Atlas');
  console.error('3. Invalid credentials');
  console.error('4. Internet connectivity issue');
  process.exit(1);
});
