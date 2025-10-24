const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://kushalac2005:V0PswVr71tKdGg6L@farmhelp.0kapl.mongodb.net/farmmate')
  .then(async () => {
    console.log('Connected to database');
    
    const Service = require('./src/models/Service');
    const Job = require('./src/models/JobRequest');
    
    const services = await Service.find().populate('provider', 'name email');
    const jobs = await Job.find().populate('farmer', 'name email');
    
    console.log('\n=== SERVICES IN DATABASE ===');
    console.log('Total services:', services.length);
    services.forEach((s, i) => {
      console.log(`${i+1}. ${s.title} (${s.serviceType}) - Provider: ${s.provider?.name || 'Unknown'} - ID: ${s._id}`);
    });
    
    console.log('\n=== JOBS IN DATABASE ===');
    console.log('Total jobs:', jobs.length);
    jobs.forEach((j, i) => {
      console.log(`${i+1}. ${j.title} (${j.jobType}) - Farmer: ${j.farmer?.name || 'Unknown'} - ID: ${j._id}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
