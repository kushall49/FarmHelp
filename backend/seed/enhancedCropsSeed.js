const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const CropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  suitableSoils: { type: [String], default: [] },
  seasons: { type: [String], default: [] },
  minTemp: { type: Number },
  maxTemp: { type: Number },
  minRainfall: { type: Number },
  maxRainfall: { type: Number },
  waterRequirement: { type: String },
  yieldPotential: { type: String },
  marketDemand: { type: String },
  soilScore: { type: Number, default: 5 },
  seasonScore: { type: Number, default: 5 },
  tempScore: { type: Number, default: 5 },
  rainfallScore: { type: Number, default: 5 },
  marketScore: { type: Number, default: 5 },
}, {
  timestamps: true
});

const Crop = mongoose.model('Crop', CropSchema);

const enhancedCrops = [
  // Kharif/Monsoon Crops
  {
    name: 'Rice (Paddy)',
    suitableSoils: ['clay', 'loam', 'alluvial'],
    seasons: ['monsoon', 'summer'],
    minTemp: 20,
    maxTemp: 35,
    minRainfall: 1000,
    maxRainfall: 2500,
    waterRequirement: 'High',
    yieldPotential: '25-35 quintals/acre',
    marketDemand: 'High',
    soilScore: 8,
    seasonScore: 9,
    tempScore: 8,
    rainfallScore: 9,
    marketScore: 9
  },
  {
    name: 'Cotton',
    suitableSoils: ['black', 'alluvial', 'red'],
    seasons: ['monsoon'],
    minTemp: 21,
    maxTemp: 35,
    minRainfall: 600,
    maxRainfall: 1200,
    waterRequirement: 'Medium',
    yieldPotential: '10-15 quintals/acre',
    marketDemand: 'High',
    soilScore: 9,
    seasonScore: 8,
    tempScore: 7,
    rainfallScore: 7,
    marketScore: 9
  },
  {
    name: 'Maize (Corn)',
    suitableSoils: ['loam', 'sandy', 'red'],
    seasons: ['monsoon', 'summer', 'winter'],
    minTemp: 18,
    maxTemp: 32,
    minRainfall: 500,
    maxRainfall: 900,
    waterRequirement: 'Medium',
    yieldPotential: '20-28 quintals/acre',
    marketDemand: 'High',
    soilScore: 7,
    seasonScore: 8,
    tempScore: 8,
    rainfallScore: 7,
    marketScore: 8
  },
  {
    name: 'Jowar (Sorghum)',
    suitableSoils: ['loam', 'red', 'black'],
    seasons: ['monsoon', 'winter'],
    minTemp: 20,
    maxTemp: 35,
    minRainfall: 400,
    maxRainfall: 750,
    waterRequirement: 'Low',
    yieldPotential: '12-18 quintals/acre',
    marketDemand: 'Medium',
    soilScore: 7,
    seasonScore: 7,
    tempScore: 7,
    rainfallScore: 6,
    marketScore: 6
  },
  {
    name: 'Bajra (Pearl Millet)',
    suitableSoils: ['sandy', 'loam', 'red'],
    seasons: ['monsoon'],
    minTemp: 25,
    maxTemp: 38,
    minRainfall: 400,
    maxRainfall: 650,
    waterRequirement: 'Low',
    yieldPotential: '8-12 quintals/acre',
    marketDemand: 'Medium',
    soilScore: 6,
    seasonScore: 7,
    tempScore: 8,
    rainfallScore: 6,
    marketScore: 6
  },
  {
    name: 'Groundnut (Peanut)',
    suitableSoils: ['sandy', 'loam', 'red'],
    seasons: ['monsoon', 'summer'],
    minTemp: 20,
    maxTemp: 30,
    minRainfall: 500,
    maxRainfall: 1000,
    waterRequirement: 'Medium',
    yieldPotential: '12-18 quintals/acre',
    marketDemand: 'High',
    soilScore: 7,
    seasonScore: 8,
    tempScore: 7,
    rainfallScore: 7,
    marketScore: 8
  },
  {
    name: 'Soybean',
    suitableSoils: ['black', 'red', 'loam'],
    seasons: ['monsoon'],
    minTemp: 20,
    maxTemp: 30,
    minRainfall: 500,
    maxRainfall: 900,
    waterRequirement: 'Medium',
    yieldPotential: '10-15 quintals/acre',
    marketDemand: 'High',
    soilScore: 8,
    seasonScore: 8,
    tempScore: 7,
    rainfallScore: 7,
    marketScore: 9
  },

  // Rabi/Winter Crops
  {
    name: 'Wheat',
    suitableSoils: ['loam', 'clay', 'alluvial'],
    seasons: ['winter'],
    minTemp: 10,
    maxTemp: 25,
    minRainfall: 500,
    maxRainfall: 900,
    waterRequirement: 'Medium',
    yieldPotential: '18-25 quintals/acre',
    marketDemand: 'High',
    soilScore: 9,
    seasonScore: 9,
    tempScore: 9,
    rainfallScore: 7,
    marketScore: 10
  },
  {
    name: 'Gram (Chickpea)',
    suitableSoils: ['loam', 'black', 'red'],
    seasons: ['winter'],
    minTemp: 10,
    maxTemp: 30,
    minRainfall: 300,
    maxRainfall: 600,
    waterRequirement: 'Low',
    yieldPotential: '8-12 quintals/acre',
    marketDemand: 'High',
    soilScore: 7,
    seasonScore: 8,
    tempScore: 8,
    rainfallScore: 6,
    marketScore: 8
  },
  {
    name: 'Mustard',
    suitableSoils: ['loam', 'sandy', 'alluvial'],
    seasons: ['winter'],
    minTemp: 10,
    maxTemp: 25,
    minRainfall: 300,
    maxRainfall: 500,
    waterRequirement: 'Low',
    yieldPotential: '6-10 quintals/acre',
    marketDemand: 'High',
    soilScore: 7,
    seasonScore: 8,
    tempScore: 8,
    rainfallScore: 6,
    marketScore: 8
  },
  {
    name: 'Barley',
    suitableSoils: ['loam', 'sandy', 'alluvial'],
    seasons: ['winter'],
    minTemp: 5,
    maxTemp: 20,
    minRainfall: 300,
    maxRainfall: 600,
    waterRequirement: 'Low',
    yieldPotential: '15-20 quintals/acre',
    marketDemand: 'Medium',
    soilScore: 6,
    seasonScore: 7,
    tempScore: 8,
    rainfallScore: 6,
    marketScore: 6
  },
  {
    name: 'Potato',
    suitableSoils: ['loam', 'sandy', 'alluvial'],
    seasons: ['winter'],
    minTemp: 15,
    maxTemp: 25,
    minRainfall: 400,
    maxRainfall: 700,
    waterRequirement: 'Medium',
    yieldPotential: '80-120 quintals/acre',
    marketDemand: 'High',
    soilScore: 8,
    seasonScore: 8,
    tempScore: 8,
    rainfallScore: 7,
    marketScore: 9
  },
  {
    name: 'Onion',
    suitableSoils: ['loam', 'sandy', 'red'],
    seasons: ['winter'],
    minTemp: 13,
    maxTemp: 24,
    minRainfall: 350,
    maxRainfall: 650,
    waterRequirement: 'Medium',
    yieldPotential: '60-90 quintals/acre',
    marketDemand: 'High',
    soilScore: 7,
    seasonScore: 8,
    tempScore: 7,
    rainfallScore: 6,
    marketScore: 9
  },

  // Zaid/Summer Crops
  {
    name: 'Watermelon',
    suitableSoils: ['sandy', 'loam', 'red'],
    seasons: ['summer'],
    minTemp: 24,
    maxTemp: 35,
    minRainfall: 300,
    maxRainfall: 500,
    waterRequirement: 'Medium',
    yieldPotential: '120-150 quintals/acre',
    marketDemand: 'High',
    soilScore: 7,
    seasonScore: 9,
    tempScore: 8,
    rainfallScore: 6,
    marketScore: 8
  },
  {
    name: 'Muskmelon',
    suitableSoils: ['sandy', 'loam'],
    seasons: ['summer'],
    minTemp: 25,
    maxTemp: 35,
    minRainfall: 250,
    maxRainfall: 450,
    waterRequirement: 'Medium',
    yieldPotential: '80-100 quintals/acre',
    marketDemand: 'High',
    soilScore: 7,
    seasonScore: 9,
    tempScore: 8,
    rainfallScore: 6,
    marketScore: 8
  },
  {
    name: 'Cucumber',
    suitableSoils: ['loam', 'sandy', 'alluvial'],
    seasons: ['summer'],
    minTemp: 18,
    maxTemp: 30,
    minRainfall: 300,
    maxRainfall: 500,
    waterRequirement: 'Medium',
    yieldPotential: '50-70 quintals/acre',
    marketDemand: 'Medium',
    soilScore: 7,
    seasonScore: 8,
    tempScore: 7,
    rainfallScore: 6,
    marketScore: 7
  },
  {
    name: 'Tomato',
    suitableSoils: ['loam', 'red', 'alluvial'],
    seasons: ['summer', 'winter'],
    minTemp: 18,
    maxTemp: 30,
    minRainfall: 400,
    maxRainfall: 700,
    waterRequirement: 'Medium',
    yieldPotential: '100-150 quintals/acre',
    marketDemand: 'High',
    soilScore: 8,
    seasonScore: 8,
    tempScore: 8,
    rainfallScore: 7,
    marketScore: 9
  },

  // Perennial/Cash Crops
  {
    name: 'Sugarcane',
    suitableSoils: ['loam', 'black', 'alluvial'],
    seasons: ['monsoon', 'winter'],
    minTemp: 20,
    maxTemp: 35,
    minRainfall: 1500,
    maxRainfall: 2500,
    waterRequirement: 'High',
    yieldPotential: '300-400 quintals/acre',
    marketDemand: 'High',
    soilScore: 8,
    seasonScore: 8,
    tempScore: 8,
    rainfallScore: 9,
    marketScore: 9
  },
  {
    name: 'Turmeric',
    suitableSoils: ['loam', 'red', 'clay'],
    seasons: ['monsoon'],
    minTemp: 20,
    maxTemp: 35,
    minRainfall: 1500,
    maxRainfall: 2500,
    waterRequirement: 'High',
    yieldPotential: '150-200 quintals/acre',
    marketDemand: 'High',
    soilScore: 8,
    seasonScore: 7,
    tempScore: 7,
    rainfallScore: 8,
    marketScore: 9
  }
];

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI required in .env file');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing crops...');
    await Crop.deleteMany({});
    console.log('✅ Cleared existing crops');

    console.log('🌱 Seeding enhanced crop data...');
    const result = await Crop.insertMany(enhancedCrops);
    console.log(`✅ Seeded ${result.length} crops successfully!`);

    console.log('\n📊 Seeded Crops Summary:');
    console.log('   Kharif/Monsoon: Rice, Cotton, Maize, Jowar, Bajra, Groundnut, Soybean');
    console.log('   Rabi/Winter: Wheat, Gram, Mustard, Barley, Potato, Onion');
    console.log('   Zaid/Summer: Watermelon, Muskmelon, Cucumber, Tomato');
    console.log('   Cash Crops: Sugarcane, Turmeric');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding crops:', error);
    process.exit(1);
  }
}

seed();
