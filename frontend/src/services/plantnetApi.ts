import axios from 'axios';

// Pl@ntNet API Configuration
// User should set their API key in environment or AsyncStorage
const PLANTNET_API_KEY = '2b10cb9WQRRM6k5E0ND8aKgpzu'; // Replace with actual key
const PLANTNET_API_URL = 'https://my-api.plantnet.org/v2/identify/all';

export interface PlantNetResult {
  species: {
    scientificNameWithoutAuthor: string;
    scientificName: string;
    genus: {
      scientificNameWithoutAuthor: string;
    };
    family: {
      scientificNameWithoutAuthor: string;
    };
    commonNames: string[];
  };
  score: number;
  gbif: {
    id: string;
  };
}

export interface PlantNetResponse {
  query: {
    project: string;
    images: string[];
  };
  language: string;
  preferedReferential: string;
  results: PlantNetResult[];
  version: string;
  remainingIdentificationRequests: number;
}

/**
 * Identify plant species using Pl@ntNet API
 * @param imageUri - Image file URI or base64 data
 * @param organs - Plant organs in image (leaf, flower, fruit, bark, habit, other)
 * @returns Plant identification results
 */
export async function identifyPlant(
  imageUri: string, 
  organs: string[] = ['leaf']
): Promise<PlantNetResponse> {
  try {
    const formData = new FormData();
    
    // Convert image to blob/file
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const filename = imageUri.split('/').pop() || 'plant.jpg';
    
    // Create file object
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
    
    // Append image and organs
    formData.append('images', file);
    organs.forEach(organ => formData.append('organs', organ));
    
    // Make API request
    const result = await axios.post(
      `${PLANTNET_API_URL}?api-key=${PLANTNET_API_KEY}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return result.data;
  } catch (error: any) {
    console.error('[PLANTNET] API Error:', error);
    throw new Error(error.response?.data?.message || 'Plant identification failed');
  }
}

/**
 * Get plant health status based on visual analysis
 * This is a placeholder - actual implementation would use AI model
 */
export function analyzePlantHealth(plantData: PlantNetResult): {
  isHealthy: boolean;
  confidence: number;
  issues: string[];
} {
  // This is simplified - actual implementation would analyze image features
  return {
    isHealthy: true,
    confidence: 0.85,
    issues: []
  };
}
