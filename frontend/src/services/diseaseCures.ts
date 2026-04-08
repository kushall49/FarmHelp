/**
 * Comprehensive Plant Disease Database with Cure Suggestions
 * Based on agricultural research and best practices
 */

export interface DiseaseCure {
  disease: string;
  scientificName?: string;
  affectedCrops: string[];
  symptoms: string[];
  causes: string[];
  organicTreatment: {
    immediate: string[];
    preventive: string[];
  };
  chemicalTreatment: {
    fungicides?: string[];
    insecticides?: string[];
    bactericides?: string[];
    dosage: string;
    applicationMethod: string;
    safetyPeriod: string;
  };
  culturalPractices: string[];
  biologicalControl?: string[];
  nutrients?: {
    deficient?: string[];
    recommended?: string[];
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  spreadRate: 'slow' | 'moderate' | 'fast';
  estimatedRecoveryTime: string;
}

export const diseaseCureDatabase: Record<string, DiseaseCure> = {
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
    causes: [
      'High humidity (>90%)',
      'Cool temperatures (15-20°C)',
      'Prolonged leaf wetness',
      'Dense plant spacing'
    ],
    organicTreatment: {
      immediate: [
        'Remove and destroy infected plant parts immediately',
        'Apply copper-based fungicides (Bordeaux mixture 1%)',
        'Spray neem oil solution (5ml per liter)',
        'Use baking soda spray (1 tablespoon per gallon water)'
      ],
      preventive: [
        'Use disease-resistant varieties',
        'Ensure proper air circulation',
        'Avoid overhead watering',
        'Mulch to prevent soil splash'
      ]
    },
    chemicalTreatment: {
      fungicides: [
        'Mancozeb 75% WP (2g/liter)',
        'Metalaxyl + Mancozeb (2g/liter)',
        'Chlorothalonil 75% WP (2g/liter)',
        'Cymoxanil + Mancozeb'
      ],
      dosage: '2-2.5g per liter of water',
      applicationMethod: 'Foliar spray every 7-10 days. Apply during early morning or evening',
      safetyPeriod: 'Harvest after 7-10 days of last spray'
    },
    culturalPractices: [
      'Rotate crops every 3-4 years',
      'Plant in well-drained soil',
      'Space plants adequately (60-90cm apart)',
      'Remove volunteer plants',
      'Stake plants for better air flow'
    ],
    biologicalControl: [
      'Trichoderma harzianum (soil application)',
      'Pseudomonas fluorescens (seed treatment)',
      'Bacillus subtilis spray'
    ],
    severity: 'critical',
    spreadRate: 'fast',
    estimatedRecoveryTime: '2-3 weeks with treatment, plant may not fully recover if severe'
  },

  'early_blight': {
    disease: 'Early Blight',
    scientificName: 'Alternaria solani',
    affectedCrops: ['Tomato', 'Potato', 'Eggplant'],
    symptoms: [
      'Brown spots with concentric rings (target-like)',
      'Yellowing around lesions',
      'Leaf drop starting from bottom',
      'Stem cankers with dark rings'
    ],
    causes: [
      'Warm temperatures (24-29°C)',
      'High humidity',
      'Nutrient deficiency (especially nitrogen)',
      'Plant stress'
    ],
    organicTreatment: {
      immediate: [
        'Remove affected lower leaves',
        'Apply compost tea spray weekly',
        'Use copper sulfate spray (0.5%)',
        'Spray garlic extract solution'
      ],
      preventive: [
        'Mulch heavily to prevent soil splash',
        'Water at soil level only',
        'Ensure adequate nitrogen',
        'Prune for air circulation'
      ]
    },
    chemicalTreatment: {
      fungicides: [
        'Mancozeb 75% WP (2.5g/liter)',
        'Chlorothalonil (2ml/liter)',
        'Azoxystrobin (1ml/liter)',
        'Difenoconazole (0.5ml/liter)'
      ],
      dosage: '2-2.5g per liter',
      applicationMethod: 'Spray every 10-14 days, alternate fungicides',
      safetyPeriod: '7-10 days before harvest'
    },
    culturalPractices: [
      'Crop rotation with non-solanaceous crops',
      'Use certified disease-free seeds',
      'Maintain proper plant nutrition',
      'Remove crop debris after harvest'
    ],
    biologicalControl: [
      'Bacillus subtilis',
      'Trichoderma viride',
      'Pseudomonas species'
    ],
    nutrients: {
      deficient: ['Nitrogen', 'Potassium'],
      recommended: ['NPK 19:19:19', 'Calcium nitrate', 'Potash']
    },
    severity: 'medium',
    spreadRate: 'moderate',
    estimatedRecoveryTime: '3-4 weeks with proper management'
  },

  'powdery_mildew': {
    disease: 'Powdery Mildew',
    scientificName: 'Erysiphe, Oidium species',
    affectedCrops: ['Cucumber', 'Pumpkin', 'Rose', 'Grape', 'Mango'],
    symptoms: [
      'White powdery coating on leaves',
      'Leaf curling and distortion',
      'Stunted growth',
      'Premature leaf drop'
    ],
    causes: [
      'High humidity with dry conditions',
      'Poor air circulation',
      'Dense canopy',
      'Shade conditions'
    ],
    organicTreatment: {
      immediate: [
        'Spray milk solution (1:9 milk:water)',
        'Apply sulfur dust or spray',
        'Use baking soda spray (1 tbsp + 1 tbsp oil per gallon)',
        'Neem oil spray (2%)'
      ],
      preventive: [
        'Ensure good air circulation',
        'Avoid excessive nitrogen',
        'Plant in full sun when possible',
        'Remove infected leaves immediately'
      ]
    },
    chemicalTreatment: {
      fungicides: [
        'Sulfur 80% WP (3g/liter)',
        'Hexaconazole (1ml/liter)',
        'Triadimefon (0.5g/liter)',
        'Penconazole (0.5ml/liter)'
      ],
      dosage: '1-3g per liter depending on severity',
      applicationMethod: 'Spray thoroughly covering both leaf surfaces, repeat every 7-10 days',
      safetyPeriod: '3-7 days before harvest'
    },
    culturalPractices: [
      'Prune for better air flow',
      'Avoid overhead irrigation',
      'Space plants properly',
      'Remove weeds regularly'
    ],
    biologicalControl: [
      'Ampelomyces quisqualis',
      'Bacillus pumilus',
      'Potassium bicarbonate spray'
    ],
    severity: 'medium',
    spreadRate: 'fast',
    estimatedRecoveryTime: '2-3 weeks with treatment'
  },

  // Additional diseases... (continuing in next part due to length)
  
  'healthy': {
    disease: 'Healthy Plant',
    affectedCrops: ['All crops'],
    symptoms: [
      'Vibrant green leaves',
      'Strong stem and roots',
      'Good growth rate',
      'No visible pests or diseases'
    ],
    causes: [
      'Optimal growing conditions',
      'Proper nutrition',
      'Adequate water and sunlight',
      'Good pest management'
    ],
    organicTreatment: {
      immediate: [],
      preventive: [
        'Continue regular monitoring',
        'Maintain balanced fertilization',
        'Ensure proper watering schedule',
        'Practice crop rotation'
      ]
    },
    chemicalTreatment: {
      dosage: 'None needed',
      applicationMethod: 'Continue preventive care',
      safetyPeriod: 'N/A'
    },
    culturalPractices: [
      'Regular inspection for early pest detection',
      'Maintain soil health with organic matter',
      'Proper pruning and training',
      'Adequate spacing for air circulation'
    ],
    biologicalControl: [
      'Encourage beneficial insects',
      'Apply compost tea monthly',
      'Use mulch to conserve moisture'
    ],
    severity: 'low',
    spreadRate: 'slow',
    estimatedRecoveryTime: 'Plant is healthy - continue good practices'
  }
};

/**
 * Get cure information for a detected disease
 */
export function getDiseaseCure(diseaseName: string): DiseaseCure | null {
  // Normalize disease name
  const normalized = diseaseName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Try exact match
  if (diseaseCureDatabase[normalized]) {
    return diseaseCureDatabase[normalized];
  }
  
  // Try partial match
  for (const [key, cure] of Object.entries(diseaseCureDatabase)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return cure;
    }
    if (cure.disease.toLowerCase().includes(diseaseName.toLowerCase())) {
      return cure;
    }
  }
  
  // Return default recommendation if no specific cure found
  return {
    disease: diseaseName,
    affectedCrops: ['Unknown'],
    symptoms: ['Unable to identify specific symptoms'],
    causes: ['Requires further inspection'],
    organicTreatment: {
      immediate: [
        'Remove affected plant parts',
        'Improve air circulation',
        'Apply neem oil as general treatment',
        'Ensure proper watering'
      ],
      preventive: [
        'Monitor plants regularly',
        'Maintain plant health',
        'Practice crop rotation',
        'Consult local agricultural extension'
      ]
    },
    chemicalTreatment: {
      dosage: 'Consult agricultural expert for specific treatment',
      applicationMethod: 'Professional diagnosis recommended',
      safetyPeriod: 'Follow product label instructions'
    },
    culturalPractices: [
      'Improve soil drainage',
      'Maintain proper spacing',
      'Regular weeding',
      'Balanced fertilization'
    ],
    severity: 'medium',
    spreadRate: 'moderate',
    estimatedRecoveryTime: 'Varies - professional diagnosis recommended'
  };
}

/**
 * Get general recommendations for plant health
 */
export function getGeneralRecommendations(): string[] {
  return [
    'Monitor plants regularly for early detection',
    'Ensure proper drainage to prevent root diseases',
    'Water in the morning to reduce leaf wetness duration',
    'Remove and destroy infected plant material promptly',
    'Sanitize tools between uses',
    'Practice crop rotation to break disease cycles',
    'Maintain proper plant spacing for air circulation',
    'Use disease-resistant varieties when available',
    'Keep the growing area clean and weed-free',
    'Provide balanced nutrition based on soil tests'
  ];
}
