import { axiosInstance } from './api';

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
 * Identify plant species using server-side Pl@ntNet proxy.
 * This keeps the Pl@ntNet API key off the client.
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
    formData.append('image', file);
    organs.forEach(organ => formData.append('organs', organ));
    
    const result = await axiosInstance.post('/plantnet/identify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (!result.data?.success) {
      throw new Error(result.data?.error || 'Plant identification failed');
    }

    return result.data.data as PlantNetResponse;
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
