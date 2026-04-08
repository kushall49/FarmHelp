/**
 * Plant Disease Analyzer Service
 * Provides comprehensive disease detection and cure suggestions
 */

const diseaseCureDatabase = {
  // ============ FUNGAL DISEASES ============
  'late_blight': {
    disease: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    affectedCrops: ['Tomato', 'Potato', 'Pepper'],
    symptoms: [
      'Dark water-soaked spots on leaves',
      'White fuzzy growth on underside of leaves',
      'Brown-black lesions on stems',
      'Fruit rot with brown patches'
    ],
    organicCure: [
      'Remove and destroy infected plant parts immediately',
      'Apply copper-based fungicides (Bordeaux mixture 1%)',
      'Spray neem oil solution (5ml per liter)',
      'Use baking soda spray (1 tablespoon per gallon water)'
    ],
    chemicalCure: [
      'Mancozeb 75% WP (2g/liter)',
      'Metalaxyl + Mancozeb (2g/liter)',
      'Chlorothalonil 75% WP (2g/liter)'
    ],
    prevention: [
      'Use disease-resistant varieties',
      'Ensure proper air circulation',
      'Avoid overhead watering',
      'Rotate crops every 3-4 years'
    ],
    severity: 'critical',
    recoveryTime: '2-3 weeks with treatment'
  },

  'early_blight': {
    disease: 'Early Blight',
    scientificName: 'Alternaria solani',
    affectedCrops: ['Tomato', 'Potato', 'Eggplant'],
    symptoms: [
      'Brown spots with concentric rings (target-like)',
      'Yellowing around lesions',
      'Leaf drop starting from bottom'
    ],
    organicCure: [
      'Remove affected lower leaves',
      'Apply compost tea spray weekly',
      'Use copper sulfate spray (0.5%)'
    ],
    chemicalCure: [
      'Mancozeb 75% WP (2.5g/liter)',
      'Chlorothalonil (2ml/liter)',
      'Azoxystrobin (1ml/liter)'
    ],
    prevention: [
      'Mulch heavily to prevent soil splash',
      'Water at soil level only',
      'Ensure adequate nitrogen',
      'Crop rotation with non-solanaceous crops'
    ],
    severity: 'medium',
    recoveryTime: '3-4 weeks'
  },

  'powdery_mildew': {
    disease: 'Powdery Mildew',
    scientificName: 'Erysiphe species',
    affectedCrops: ['Cucumber', 'Pumpkin', 'Rose', 'Grape'],
    symptoms: [
      'White powdery coating on leaves',
      'Leaf curling and distortion',
      'Stunted growth'
    ],
    organicCure: [
      'Spray milk solution (1:9 milk:water)',
      'Apply sulfur dust or spray',
      'Use baking soda spray (1 tbsp + oil per gallon)',
      'Neem oil spray (2%)'
    ],
    chemicalCure: [
      'Sulfur 80% WP (3g/liter)',
      'Hexaconazole (1ml/liter)',
      'Penconazole (0.5ml/liter)'
    ],
    prevention: [
      'Ensure good air circulation',
      'Avoid excessive nitrogen',
      'Plant in full sun',
      'Remove infected leaves immediately'
    ],
    severity: 'medium',
    recoveryTime: '2-3 weeks'
  },

  'bacterial_spot': {
    disease: 'Bacterial Spot',
    scientificName: 'Xanthomonas campestris',
    affectedCrops: ['Tomato', 'Pepper'],
    symptoms: [
      'Small dark spots with yellow halos',
      'Leaf spots turn brown and fall out',
      'Fruit spots with raised centers'
    ],
    organicCure: [
      'Remove infected plant parts',
      'Apply copper-based bactericides',
      'Use hydrogen peroxide solution (3%)'
    ],
    chemicalCure: [
      'Copper hydroxide (2g/liter)',
      'Copper oxychloride (3g/liter)',
      'Streptocycline (15-20g/100 liters)'
    ],
    prevention: [
      'Use certified disease-free seeds',
      'Avoid working with wet plants',
      'Disinfect tools between plants',
      'Use drip irrigation'
    ],
    severity: 'high',
    recoveryTime: 'Cannot be cured, focus on prevention'
  },

  'leaf_spot': {
    disease: 'Leaf Spot',
    affectedCrops: ['Most crops'],
    symptoms: [
      'Circular or irregular spots on leaves',
      'Spots may be brown, black, or gray',
      'Yellowing around spots'
    ],
    organicCure: [
      'Remove affected leaves',
      'Apply copper fungicide',
      'Improve air circulation',
      'Avoid overhead watering'
    ],
    chemicalCure: [
      'Mancozeb (2g/liter)',
      'Chlorothalonil (2ml/liter)',
      'Copper oxychloride (3g/liter)'
    ],
    prevention: [
      'Space plants properly',
      'Water at soil level',
      'Remove plant debris',
      'Crop rotation'
    ],
    severity: 'low',
    recoveryTime: '2-3 weeks'
  },

  'rust': {
    disease: 'Rust Disease',
    affectedCrops: ['Wheat', 'Beans', 'Roses'],
    symptoms: [
      'Orange, yellow, or reddish pustules on leaves',
      'Powdery spore masses',
      'Leaf yellowing and drop'
    ],
    organicCure: [
      'Remove infected leaves',
      'Apply sulfur fungicide',
      'Neem oil spray',
      'Improve air circulation'
    ],
    chemicalCure: [
      'Propiconazole (1ml/liter)',
      'Triadimefon (0.5g/liter)',
      'Mancozeb (2g/liter)'
    ],
    prevention: [
      'Plant resistant varieties',
      'Ensure good air flow',
      'Avoid wetting foliage',
      'Remove volunteer plants'
    ],
    severity: 'medium',
    recoveryTime: '3-4 weeks'
  },

  'healthy': {
    disease: 'Healthy Plant',
    affectedCrops: ['All crops'],
    symptoms: [
      'Vibrant green leaves',
      'Strong stem and roots',
      'Good growth rate',
      'No visible pests or diseases'
    ],
    organicCure: [],
    chemicalCure: [],
    prevention: [
      'Continue regular monitoring',
      'Maintain balanced fertilization',
      'Ensure proper watering',
      'Practice crop rotation'
    ],
    severity: 'low',
    recoveryTime: 'Plant is healthy'
  }
};

/**
 * Analyze disease and provide cure suggestions
 */
function analyzeDiseaseAndProvideCure(detectedDisease, confidence) {
  console.log('[DISEASE-ANALYZER] Analyzing:', detectedDisease);
  
  // Normalize disease name
  const normalized = (detectedDisease || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Try exact match
  if (diseaseCureDatabase[normalized]) {
    return formatCureResponse(diseaseCureDatabase[normalized], confidence);
  }
  
  // Try partial match
  for (const [key, cure] of Object.entries(diseaseCureDatabase)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return formatCureResponse(cure, confidence);
    }
    if (cure.disease.toLowerCase().includes(detectedDisease.toLowerCase())) {
      return formatCureResponse(cure, confidence);
    }
  }
  
  // Default response if no match found
  return {
    disease: detectedDisease || 'Unknown Disease',
    confidence: confidence || 0,
    severity: 'medium',
    cure: {
      immediate: [
        'Remove affected plant parts',
        'Improve air circulation',
        'Ensure proper watering',
        'Apply neem oil as general treatment'
      ],
      organic: [
        'Use compost tea',
        'Apply neem oil spray',
        'Improve soil drainage',
        'Maintain plant health'
      ],
      chemical: [
        'Consult local agricultural extension',
        'Use broad-spectrum fungicide if fungal',
        'Follow product label instructions'
      ],
      prevention: [
        'Monitor plants regularly',
        'Practice crop rotation',
        'Maintain proper spacing',
        'Remove plant debris'
      ]
    },
    recommendation: 'For accurate diagnosis and treatment, please consult a local agricultural expert or extension service.',
    recoveryTime: 'Varies - professional diagnosis recommended'
  };
}

/**
 * Format cure response
 */
function formatCureResponse(cureData, confidence) {
  return {
    disease: cureData.disease,
    scientificName: cureData.scientificName,
    confidence: confidence || 0.85,
    severity: cureData.severity,
    affectedCrops: cureData.affectedCrops,
    symptoms: cureData.symptoms,
    cure: {
      immediate: cureData.organicCure.slice(0, 2) || [],
      organic: cureData.organicCure || [],
      chemical: cureData.chemicalCure || [],
      prevention: cureData.prevention || []
    },
    recommendation: generateRecommendation(cureData),
    recoveryTime: cureData.recoveryTime
  };
}

/**
 * Generate detailed recommendation
 */
function generateRecommendation(cureData) {
  const { disease, severity, recoveryTime } = cureData;
  
  if (disease === 'Healthy Plant') {
    return '✅ Your plant looks healthy! Continue with regular care and monitoring to maintain plant health.';
  }
  
  let recommendation = `⚠️ ${disease} detected. `;
  
  if (severity === 'critical') {
    recommendation += '🚨 This is a serious disease requiring immediate action. ';
  } else if (severity === 'high') {
    recommendation += '⚡ This disease needs prompt treatment. ';
  } else {
    recommendation += 'Start treatment promptly for best results. ';
  }
  
  recommendation += `\n\n📋 Recovery time: ${recoveryTime}`;
  recommendation += `\n\n💡 Start with organic treatments for safety, use chemical treatments for severe cases.`;
  
  return recommendation;
}

/**
 * Main analysis function
 */
async function analyzeWithCureSuggestions(aiResult) {
  try {
    const disease = aiResult.disease || aiResult.crop || 'Unknown';
    const confidence = aiResult.confidence || aiResult.confidence_percentage || 0.75;
    
    console.log('[DISEASE-ANALYZER] Processing:', { disease, confidence });
    
    const cureInfo = analyzeDiseaseAndProvideCure(disease, confidence);
    
    return {
      ...aiResult,
      ...cureInfo,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[DISEASE-ANALYZER] Error:', error);
    return {
      ...aiResult,
      error: 'Failed to generate cure suggestions',
      recommendation: 'Please consult an agricultural expert for proper diagnosis and treatment.'
    };
  }
}

module.exports = {
  analyzeDiseaseAndProvideCure,
  analyzeWithCureSuggestions,
  diseaseCureDatabase
};
