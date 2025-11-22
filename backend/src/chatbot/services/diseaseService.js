/**
 * Disease Service - Plant disease detection and management
 * Links to ML model service for image-based detection
 */
class DiseaseService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    
    // Common disease database
    this.diseaseDatabase = {
      'blast': {
        crops: ['rice', 'wheat'],
        symptoms: 'Diamond-shaped lesions on leaves',
        treatment: 'Tricyclazole or Carbendazim spray',
        prevention: 'Use resistant varieties, proper spacing'
      },
      'blight': {
        crops: ['potato', 'tomato'],
        symptoms: 'Brown/black spots on leaves, wilting',
        treatment: 'Copper fungicide, Mancozeb spray',
        prevention: 'Crop rotation, destroy infected plants'
      },
      'wilt': {
        crops: ['cotton', 'tomato', 'brinjal'],
        symptoms: 'Sudden wilting, yellowing of leaves',
        treatment: 'No cure - remove infected plants',
        prevention: 'Use disease-free seeds, soil solarization'
      },
      'rust': {
        crops: ['wheat', 'coffee'],
        symptoms: 'Orange/brown pustules on leaves',
        treatment: 'Propiconazole or Tebuconazole spray',
        prevention: 'Early sowing, resistant varieties'
      },
      'powdery mildew': {
        crops: ['cucurbits', 'grapes'],
        symptoms: 'White powdery coating on leaves',
        treatment: 'Sulfur dust, Karathane spray',
        prevention: 'Good air circulation, avoid overhead irrigation'
      },
      'aphids': {
        crops: ['mustard', 'cotton', 'vegetables'],
        symptoms: 'Small insects on stems, curled leaves',
        treatment: 'Neem oil, Imidacloprid spray',
        prevention: 'Yellow sticky traps, introduce ladybugs'
      },
      'bollworm': {
        crops: ['cotton'],
        symptoms: 'Holes in bolls, caterpillars inside',
        treatment: 'Bt spray, Spinosad',
        prevention: 'Bt cotton, pheromone traps, crop rotation'
      }
    };
  }

  /**
   * Detect disease from user query
   */
  async detectDisease(query) {
    try {
      console.log(`[DISEASE-SERVICE] Query: ${query}`);

      const normalizedQuery = query.toLowerCase();

      // Check if asking about specific disease
      for (const [disease, data] of Object.entries(this.diseaseDatabase)) {
        if (normalizedQuery.includes(disease) || 
            data.crops.some(crop => normalizedQuery.includes(crop))) {
          return this._formatDiseaseResponse(disease, data);
        }
      }

      // General disease management info
      return this._getGeneralDiseaseInfo();
    } catch (error) {
      console.error('[DISEASE-SERVICE] Error:', error.message);
      return '⚠️ Unable to fetch disease information. Please try again.';
    }
  }

  /**
   * Get disease information by name
   */
  getDiseaseInfo(diseaseName) {
    const disease = this.diseaseDatabase[diseaseName.toLowerCase()];
    if (disease) {
      return this._formatDiseaseResponse(diseaseName, disease);
    }
    return null;
  }

  /**
   * Format disease response
   */
  _formatDiseaseResponse(name, data) {
    return `🐛 **${name.toUpperCase()} - Plant Disease/Pest:**

**Affected Crops:** ${data.crops.join(', ')}

**Symptoms:**
${data.symptoms}

**Treatment:**
✅ ${data.treatment}

**Prevention:**
🛡️ ${data.prevention}

**Integrated Pest Management (IPM):**
1. Monitor fields regularly
2. Use disease-resistant varieties
3. Maintain proper spacing
4. Remove infected plant parts
5. Use organic methods first (Neem, Trichoderma)
6. Chemical control as last resort

📸 **For accurate diagnosis:** Use our Plant Health Analyzer to upload a photo of the affected plant!

📞 **Helpline:** 1800-180-1551 (Kisan Call Center)`;
  }

  /**
   * General disease information
   */
  _getGeneralDiseaseInfo() {
    return `🐛 **Plant Disease & Pest Management:**

**Common Diseases:**
• **Blast** (Rice, Wheat) - Fungal disease
• **Blight** (Potato, Tomato) - Leaf spots
• **Wilt** (Cotton, Tomato) - Vascular disease
• **Rust** (Wheat, Coffee) - Orange pustules
• **Powdery Mildew** (Cucurbits) - White coating

**Common Pests:**
• **Aphids** (Vegetables) - Sap suckers
• **Bollworm** (Cotton) - Boll damage
• **Stem Borer** (Rice) - Stem damage
• **Whitefly** (Cotton, Vegetables) - Virus vector

**IPM Strategy:**
1️⃣ **Prevention** - Use resistant varieties
2️⃣ **Cultural** - Crop rotation, spacing
3️⃣ **Biological** - Natural enemies
4️⃣ **Mechanical** - Traps, removal
5️⃣ **Chemical** - Last resort only

📸 **Upload Photo:** Use Plant Health Analyzer for AI-based disease detection!

💡 **Tip:** Ask about a specific disease or pest for detailed information!`;
  }
}

module.exports = new DiseaseService();
