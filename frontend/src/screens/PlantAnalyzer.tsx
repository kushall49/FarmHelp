import React, { useState } from 'react';
import { View, Image, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, ActivityIndicator, Card, Surface, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function PlantAnalyzer() {
  const [image, setImage] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3]
    });
    if (!res.canceled) {
      setImage(res.assets[0]);
      setResult(null);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Camera permission required!');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ 
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3]
    });
    if (!res.canceled) {
      setImage(res.assets[0]);
      setResult(null);
    }
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    try {
      const uriParts = image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const formData = new FormData();
      // @ts-ignore
      formData.append('image', { uri: image.uri, name: `plant.${fileType}`, type: `image/${fileType}` });
      const res = await api.uploadPlant(formData);
      setResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Analysis failed. Please try again.');
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  }

  const getSeverityColor = (confidence: number) => {
    if (confidence > 0.8) return '#F44336';
    if (confidence > 0.5) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>🔬 Plant Health Analyzer</Text>
        <Text style={styles.subtitle}>Upload or capture plant image for AI analysis</Text>
      </Surface>

      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={pickImage} icon="image" style={styles.button} buttonColor="#4CAF50">
          Gallery
        </Button>
        <Button mode="contained" onPress={takePhoto} icon="camera" style={styles.button} buttonColor="#2196F3">
          Camera
        </Button>
      </View>

      {image && (
        <Card style={styles.imageCard}>
          <Image source={{ uri: image.uri }} style={styles.image} />
          <Card.Actions>
            <Button onPress={() => setImage(null)}>Remove</Button>
            <Button mode="contained" onPress={analyze} disabled={loading} buttonColor="#4CAF50">
              {loading ? 'Analyzing...' : '🔍 Analyze Now'}
            </Button>
          </Card.Actions>
        </Card>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>AI is analyzing your plant...</Text>
        </View>
      )}

      {result && !loading && (
        <Card style={styles.resultCard}>
          <Card.Content>
            <View style={styles.resultHeader}>
              <Text variant="titleLarge" style={styles.resultTitle}>📊 Analysis Results</Text>
              {result.confidence && (
                <Chip 
                  mode="flat" 
                  style={[styles.confidenceChip, { backgroundColor: getSeverityColor(result.confidence) }]}
                  textStyle={{ color: '#fff', fontWeight: 'bold' }}
                >
                  {Math.round(result.confidence * 100)}%
                </Chip>
              )}
            </View>

            <Surface style={styles.diseaseCard}>
              <Text style={styles.diseaseLabel}>Detected Disease:</Text>
              <Text style={styles.diseaseName}>{result.disease || result.result?.disease || 'Unknown'}</Text>
            </Surface>

            {result.recommendations && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>💡 Recommendations:</Text>
                <Text style={styles.recommendationText}>{result.recommendations}</Text>
              </View>
            )}

            {result.treatment && (
              <View style={styles.treatmentSection}>
                <Text style={styles.sectionTitle}>💊 Treatment:</Text>
                <Text style={styles.treatmentText}>{result.treatment}</Text>
              </View>
            )}

            <Surface style={styles.infoBox}>
              <Text style={styles.infoText}>
                ⚠️ This is an AI-powered estimate. Consult agricultural experts for critical decisions.
              </Text>
            </Surface>
          </Card.Content>
        </Card>
      )}

      {!image && !loading && (
        <Card style={styles.placeholderCard}>
          <Card.Content>
            <Text style={styles.placeholderText}>📸 No image selected</Text>
            <Text style={styles.placeholderSubtext}>Choose an image from gallery or take a photo to get started</Text>
          </Card.Content>
        </Card>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 24, margin: 16, borderRadius: 20, backgroundColor: '#fff', elevation: 2 },
  title: { fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginVertical: 16 },
  button: { flex: 1, marginHorizontal: 8 },
  imageCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden', elevation: 3 },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748B' },
  resultCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 3 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontWeight: 'bold', color: '#1E293B' },
  confidenceChip: { elevation: 2 },
  diseaseCard: { backgroundColor: '#FFF3E0', padding: 16, borderRadius: 12, marginBottom: 16 },
  diseaseLabel: { fontSize: 12, color: '#E65100', fontWeight: '600', marginBottom: 4 },
  diseaseName: { fontSize: 20, fontWeight: 'bold', color: '#E65100' },
  recommendationsSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  recommendationText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  treatmentSection: { marginBottom: 16 },
  treatmentText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  infoBox: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, marginTop: 8, elevation: 0 },
  infoText: { fontSize: 12, color: '#1565C0', textAlign: 'center' },
  placeholderCard: { marginHorizontal: 16, marginTop: 40, borderRadius: 16, backgroundColor: '#FFF9E6' },
  placeholderText: { fontSize: 18, fontWeight: 'bold', color: '#F59E0B', textAlign: 'center', marginBottom: 8 },
  placeholderSubtext: { fontSize: 14, color: '#92400E', textAlign: 'center' },
});
