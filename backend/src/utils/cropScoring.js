const axios = require('axios');

/**
 * Crop Scoring Algorithm
 * 
 * Computes a weighted score for each crop based on environmental conditions.
 * Higher score = better match for the location's conditions.
 */

/**
 * Get current season based on month
 */
function getCurrentSeason(month) {
  // Month is 0-indexed (0 = January)
  if (month >= 2 && month <= 5) return 'summer'; // March-June
  if (month >= 6 && month <= 9) return 'monsoon'; // July-October
  if (month >= 10 || month <= 1) return 'winter'; // November-February
  return 'summer';
}

/**
 * Determine soil type based on district/state (simplified logic)
 * In production, use a proper soil database or API
 */
function getSoilTypeByLocation(district, state) {
  // Simplified mapping - in production use comprehensive database
  const soilMap = {
    'Karnataka': 'red',
    'Punjab': 'alluvial',
    'Maharashtra': 'black',
    'Rajasthan': 'sandy',
    'West Bengal': 'alluvial',
    'Tamil Nadu': 'red',
    'Andhra Pradesh': 'black',
    'Kerala': 'red',
    'Gujarat': 'black',
    'Uttar Pradesh': 'alluvial',
    'Madhya Pradesh': 'black',
    'Bihar': 'alluvial',
  };

  return soilMap[state] || 'loam'; // Default to loam
}

/**
 * Fetch weather data from OpenWeather API
 */
async function getWeatherData(lat, long) {
  try {
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo'; // Add your key to .env
    
    // If no API key, return mock data for development
    if (OPENWEATHER_API_KEY === 'demo') {
      console.warn('[WEATHER] Using mock weather data. Add OPENWEATHER_API_KEY to .env for real data.');
      return {
        temperature: 25,
        humidity: 65,
        rainfall: 600, // Annual average estimate
      };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);

    return {
      temperature: Math.round(response.data.main.temp),
      humidity: response.data.main.humidity,
      rainfall: response.data.rain?.['1h'] ? response.data.rain['1h'] * 365 : 600, // Estimate annual
    };
  } catch (error) {
    console.error('[WEATHER] Error fetching weather data:', error.message);
    // Return default values
    return {
      temperature: 25,
      humidity: 65,
      rainfall: 600,
    };
  }
}

/**
 * Score a single crop based on environmental conditions
 * Returns a score from 0-100
 */
function scoreCrop(crop, conditions) {
  const {
    temperature,
    humidity,
    rainfall,
    season,
    soilType,
  } = conditions;

  let totalScore = 0;
  let maxPossibleScore = 0;
  const reasons = [];

  // 1. Soil Type Match (Weight from crop.soilScore)
  const soilWeight = crop.soilScore || 5;
  maxPossibleScore += soilWeight * 10;
  
  if (crop.suitableSoils && crop.suitableSoils.includes(soilType)) {
    totalScore += soilWeight * 10;
    reasons.push(`Perfect soil match: ${soilType}`);
  } else if (crop.suitableSoils && crop.suitableSoils.length > 0) {
    totalScore += soilWeight * 3; // Partial score
    reasons.push(`Soil not ideal (has ${crop.suitableSoils.join(', ')})`);
  }

  // 2. Season Match (Weight from crop.seasonScore)
  const seasonWeight = crop.seasonScore || 5;
  maxPossibleScore += seasonWeight * 10;
  
  if (crop.seasons && crop.seasons.includes(season)) {
    totalScore += seasonWeight * 10;
    reasons.push(`Ideal season: ${season}`);
  } else if (crop.seasons && crop.seasons.length > 0) {
    totalScore += seasonWeight * 2; // Partial score
    reasons.push(`Not the best season (prefer ${crop.seasons.join(', ')})`);
  }

  // 3. Temperature Range (Weight from crop.tempScore)
  const tempWeight = crop.tempScore || 5;
  maxPossibleScore += tempWeight * 10;
  
  if (temperature >= crop.minTemp && temperature <= crop.maxTemp) {
    totalScore += tempWeight * 10;
    reasons.push(`Temperature perfect (${temperature}°C in ${crop.minTemp}-${crop.maxTemp}°C range)`);
  } else {
    const tempDiff = Math.min(
      Math.abs(temperature - crop.minTemp),
      Math.abs(temperature - crop.maxTemp)
    );
    const tempScore = Math.max(0, tempWeight * 10 - tempDiff * 2);
    totalScore += tempScore;
    if (tempScore > 0) {
      reasons.push(`Temperature acceptable (${temperature}°C, prefer ${crop.minTemp}-${crop.maxTemp}°C)`);
    }
  }

  // 4. Rainfall Range (Weight from crop.rainfallScore)
  const rainfallWeight = crop.rainfallScore || 5;
  maxPossibleScore += rainfallWeight * 10;
  
  if (rainfall >= crop.minRainfall && rainfall <= crop.maxRainfall) {
    totalScore += rainfallWeight * 10;
    reasons.push(`Rainfall perfect (${rainfall}mm in ${crop.minRainfall}-${crop.maxRainfall}mm range)`);
  } else {
    const rainfallDiff = Math.min(
      Math.abs(rainfall - crop.minRainfall),
      Math.abs(rainfall - crop.maxRainfall)
    );
    const rainfallScore = Math.max(0, rainfallWeight * 10 - rainfallDiff / 50);
    totalScore += rainfallScore;
    if (rainfallScore > 0) {
      reasons.push(`Rainfall manageable (${rainfall}mm, prefer ${crop.minRainfall}-${crop.maxRainfall}mm)`);
    }
  }

  // 5. Market Demand (Weight from crop.marketScore)
  const marketWeight = crop.marketScore || 5;
  maxPossibleScore += marketWeight * 10;
  
  if (crop.marketDemand === 'High') {
    totalScore += marketWeight * 10;
    reasons.push('High market demand');
  } else if (crop.marketDemand === 'Medium') {
    totalScore += marketWeight * 6;
    reasons.push('Medium market demand');
  } else {
    totalScore += marketWeight * 3;
    reasons.push('Lower market demand');
  }

  // Normalize score to 0-100 scale
  const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

  return {
    score: normalizedScore,
    reasons,
  };
}

/**
 * Main recommendation function
 * Returns top N recommended crops with scores and reasons
 */
async function recommendCrops(latitude, longitude, district, state, Crop) {
  try {
    // Get environmental data
    const weatherData = await getWeatherData(latitude, longitude);
    const currentMonth = new Date().getMonth();
    const season = getCurrentSeason(currentMonth);
    const soilType = getSoilTypeByLocation(district, state);

    const conditions = {
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      rainfall: weatherData.rainfall,
      season,
      soilType,
    };

    console.log('[CROP SCORING] Environmental conditions:', conditions);

    // Get all crops from database
    const allCrops = await Crop.find({});
    console.log(`[CROP SCORING] Found ${allCrops.length} crops to evaluate`);

    // Score each crop
    const scoredCrops = allCrops.map(crop => {
      const cropObj = crop.toObject();
      const { score, reasons } = scoreCrop(cropObj, conditions);
      
      return {
        ...cropObj,
        score,
        reasons,
      };
    });

    // Sort by score (descending) and take top 5
    const topCrops = scoredCrops
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((crop, index) => ({
        ...crop,
        rank: index + 1,
      }));

    console.log(`[CROP SCORING] Top 5 crops:`, topCrops.map(c => ({ name: c.name, score: c.score })));

    return {
      recommendations: topCrops,
      environmental: {
        temperature: conditions.temperature,
        humidity: conditions.humidity,
        rainfall: conditions.rainfall,
        season: conditions.season,
        soilType: conditions.soilType,
        district,
        state,
      },
    };
  } catch (error) {
    console.error('[CROP SCORING] Error:', error);
    throw error;
  }
}

module.exports = {
  recommendCrops,
  scoreCrop,
  getCurrentSeason,
  getSoilTypeByLocation,
  getWeatherData,
};
