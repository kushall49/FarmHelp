import React, { useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadImage } from '../utils/api';
import { speakKannada } from '../utils/tts';
import { enqueueRequest } from '../utils/syncQueue';
import { getJwt } from '../helpers/auth';

export default function PlantAnalyzer() {
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async (useCamera) => {
    try {
      const permissionResult = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setError('Permission to access camera/gallery is required!');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setResult(null);
        setError(null);
      }
    } catch (err) {
      console.error('[PICKER] Error:', err);
      setError('Failed to pick image');
    }
  };

  const analyzeImage = async () => {
    if (!imageUri) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get JWT token
      const token = await getJwt();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      // Prepare form data
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });

      console.log('[ANALYZER] Uploading image...');
      
      // Upload to backend
      const response = await uploadImage(formData, token);

      if (response.success) {
        const analysis = response.analysis;
        setResult(analysis);

        // Save to AsyncStorage
        await AsyncStorage.setItem('lastAnalysis', JSON.stringify(analysis));

        // Speak result in Kannada
        await speakKannada(`Prediction: ${analysis.prediction}. Confidence: ${Math.round(analysis.confidence * 100)} percent`);

        console.log('[ANALYZER] Analysis complete:', analysis);
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('[ANALYZER] Error:', err);
      setError(err.message || 'Failed to analyze image');

      // Queue request for retry when online
      try {
        await enqueueRequest({
          endpoint: '/api/plant/analyze',
          method: 'POST',
          data: { imageUri },
          timestamp: Date.now()
        });
        console.log('[ANALYZER] Request queued for retry');
      } catch (queueErr) {
        console.error('[ANALYZER] Failed to queue request:', queueErr);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Plant Health Analyzer</Text>
        <Text style={styles.subtitle}>Upload or capture a plant image for disease detection</Text>

        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <Button title="Take Photo" onPress={() => pickImage(true)} color="#4CAF50" />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Choose from Gallery" onPress={() => pickImage(false)} color="#2196F3" />
          </View>
        </View>

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.analyzeButton}>
              <Button 
                title={loading ? "Analyzing..." : "Analyze Image"} 
                onPress={analyzeImage}
                disabled={loading}
                color="#FF9800"
              />
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>✅ Analysis Result</Text>
            <Text style={styles.resultText}>Prediction: {result.prediction}</Text>
            <Text style={styles.resultText}>
              Confidence: {Math.round(result.confidence * 100)}%
            </Text>
            <Text style={styles.resultText}>Model: {result.modelVersion}</Text>
            <Text style={styles.resultDate}>
              {new Date(result.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  analyzeButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2e7d32',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  resultDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
});
