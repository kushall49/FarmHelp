import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, Card, Surface, Chip, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

// Import safe navigation hook
import { useSafeGoBack } from '../navigation/AppNavigator';

// TypeScript interfaces
interface PickedImage {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

interface AnalysisResult {
  crop?: string;
  disease?: string;
  confidence?: number;
  confidence_percentage?: string;
  predictions?: Array<{ class_name: string; confidence: number }>;
  recommendation?: string;
  recommendations?: string;
  treatment?: string;
  fertilizers?: any;
  gradcam?: string;
  processing_time_ms?: number;
  result?: any; // For nested result structure
}

interface ApiResponse {
  id: string;
  result: AnalysisResult;
}

export default function PlantAnalyzer(): JSX.Element {
  // ✅ NAVIGATION FIX: Use safe navigation with deep link fallback
  const navigation = useNavigation();
  const handleGoBack = useSafeGoBack();
  const [image, setImage] = useState<PickedImage | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Debug: Log render cycles
  console.log('[RENDER] Component rendered - image:', !!image, 'result:', !!result, 'loading:', loading);

  async function pickImage(): Promise<void> {
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

  async function takePhoto(): Promise<void> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      // Use Snackbar instead of alert
      setSnackbarMessage('Camera permission is required to take photos');
      setSnackbarVisible(true);
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

  async function analyze(): Promise<void> {
    // ✅ NAVIGATION FIX: Removed window.history hack - proper navigation now handled by AppNavigator
    
    if (!image) {
      console.warn('[ANALYZER] No image selected');
      return;
    }

    console.log('[ANALYZER] === Starting Analysis ===');
    console.log('[ANALYZER] 🔒 INLINE MODE: Results will render below, NO navigation');
    console.log('[ANALYZER] Platform:', Platform.OS);
    console.log('[ANALYZER] Image URI:', image.uri);

    setLoading(true);
    
    try {
      const formData = new FormData();
      const filename = image.uri.split('/').pop() || 'plant.jpg';
      const fileType = filename.split('.').pop()?.toLowerCase() || 'jpg';
      
      // CRITICAL FIX: Always use 'jpeg' MIME type (standardized)
      const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg';

      console.log('[ANALYZER] File details:', {
        filename,
        fileType,
        mimeType,
        platform: Platform.OS
      });

      // ✅ PRODUCTION FIX: Platform-specific FormData handling
      if (Platform.OS === 'web') {
        console.log('[ANALYZER] Web platform detected - converting to File/Blob');
        
        try {
          // On web, ImagePicker returns blob: URIs that need to be fetched
          const response = await fetch(image.uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          
          console.log('[ANALYZER] Blob created:', {
            size: blob.size,
            type: blob.type
          });

          // CRITICAL: Create proper File object with JPEG MIME
          const file = new File([blob], filename, { type: mimeType });
          
          console.log('[ANALYZER] File created:', {
            name: file.name,
            size: file.size,
            type: file.type
          });

          // PRODUCTION: Append with explicit filename
          formData.append('image', file, filename);
          console.log('[ANALYZER] ✅ Web: File appended to FormData');
          
        } catch (fetchError: any) {
          console.error('[ANALYZER] ❌ Failed to convert image:', fetchError);
          throw new Error(`Image conversion failed: ${fetchError.message}`);
        }
        
      } else {
        console.log('[ANALYZER] Mobile platform detected - using URI format');
        
        // PRODUCTION: Mobile FormData with proper MIME type
        // @ts-ignore - React Native FormData accepts this format
        formData.append('image', {
          uri: image.uri,
          name: filename,
          type: mimeType  // Always valid MIME type
        });
        
        console.log('[ANALYZER] ✅ Mobile: URI object appended with MIME:', mimeType);
      }

      console.log('[ANALYZER] Sending request to API...');
      const res = await api.uploadPlant(formData);
      
      console.log('[ANALYZER] ✅ Raw API Response:', res);
      console.log('[ANALYZER] Response Status:', res.status);
      console.log('[ANALYZER] Response Data:', res.data);
      
      // PRODUCTION: Safe response parsing with fallback
      let analysisResult: AnalysisResult;
      
      if (!res.data) {
        throw new Error('Empty response from server');
      }
      
      // Handle nested result structure
      if (res.data.result) {
        analysisResult = res.data.result;
      } else if (res.data.success !== false) {
        analysisResult = res.data;
      } else {
        throw new Error(res.data.error || 'Analysis failed');
      }
      
      console.log('[ANALYZER] Extracted Analysis Result:', analysisResult);
      console.log('[ANALYZER] Disease:', analysisResult?.disease || 'Unknown');
      console.log('[ANALYZER] Confidence:', analysisResult?.confidence || analysisResult?.confidence_percentage);
      
      // PRODUCTION: Validate result structure
      if (!analysisResult.disease && !analysisResult.crop) {
        console.warn('[ANALYZER] ⚠️ Incomplete result structure, using fallback');
        analysisResult = {
          ...analysisResult,
          disease: analysisResult.disease || 'Analysis Complete',
          crop: analysisResult.crop || 'Unknown',
          confidence_percentage: analysisResult.confidence_percentage || '0%',
          recommendation: analysisResult.recommendation || 'No recommendations available'
        };
      }
      
      // CRITICAL: Set result BEFORE showing message
      setResult(analysisResult);
      console.log('[ANALYZER] ✅ Result state updated successfully');
      
      // Wait for React to process state update, then scroll and show success message
      setTimeout(() => {
        console.log('[ANALYZER] Auto-scrolling to results...');
        
        // INLINE SCROLL - Multiple methods to guarantee visibility
        try {
          if (Platform.OS === 'web') {
            console.log('[ANALYZER] 🔒 Web scroll starting...');
            
            // Method 1: Direct element scroll
            const resultsEl = document.getElementById('inline-plant-results');
            if (resultsEl) {
              resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              console.log('[ANALYZER] ✅ Scrolled to results element directly');
            } else {
              // Method 2: Scroll parent container
              const maxScroll = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
              );
              window.scrollTo({ 
                top: maxScroll - window.innerHeight + 200, 
                behavior: 'smooth' 
              });
              console.log('[ANALYZER] ✅ Scrolled window to:', maxScroll);
            }
          } else {
            // Mobile: scroll ScrollView
            console.log('[ANALYZER] 🔒 Mobile scroll starting...');
            scrollViewRef.current?.scrollToEnd({ animated: true });
            console.log('[ANALYZER] ✅ Mobile ScrollView scrolled');
          }
        } catch (scrollErr: any) {
          console.error('[ANALYZER] ❌ Scroll error:', scrollErr);
        }
        
        // Show success message via Snackbar
        setTimeout(() => {
          setSnackbarMessage('✅ Analysis complete! Results displayed below.');
          setSnackbarVisible(true);
        }, 500);
      }, 300);
        
    } catch (err: any) {
      console.error('[ANALYZER] ❌ Error:', err);
      console.error('[ANALYZER] Error message:', err.message);
      console.error('[ANALYZER] Error response:', err.response?.data);
      console.error('[ANALYZER] Error status:', err.response?.status);
      
      // PRODUCTION: Safe error message extraction
      let errorMessage = 'Analysis failed. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show error via Snackbar
      setSnackbarMessage(`❌ ${errorMessage}`);
      setSnackbarVisible(true);
      
      // PRODUCTION: Set fallback result on error (prevent white screen)
      setResult({
        disease: 'Error',
        crop: 'Unknown',
        confidence_percentage: '0%',
        recommendation: `Analysis failed: ${errorMessage}. Please try again with a different image.`,
        predictions: []
      });
        
    } finally { 
      setLoading(false); 
      console.log('[ANALYZER] === Analysis Complete ===');
    }
  }

  const getSeverityColor = (confidence: number): string => {
    if (confidence > 0.8) return '#F44336';
    if (confidence > 0.5) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <View 
      style={{ flex: 1 }} 
      onStartShouldSetResponder={() => true}
      onResponderRelease={(e) => {
        // Prevent any bubbling that might trigger navigation
        e.stopPropagation();
      }}
    >
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
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
            <Button onPress={() => { setImage(null); setResult(null); }}>Remove</Button>
            <Button 
              mode="contained" 
              onPress={(e: any) => {
                // 🔒 CRITICAL: Prevent ALL default behaviors on web
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                console.log('[ANALYZER] 🚨 ANALYZE BUTTON CLICKED - Navigation prevented');
                analyze();
                return false;
              }} 
              disabled={loading} 
              buttonColor="#4CAF50"
            >
              {loading ? 'Analyzing...' : '🔍 Analyze Now'}
            </Button>
          </Card.Actions>
        </Card>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>AI is analyzing your plant...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      )}

      {result && !loading && (
        <Card style={styles.resultCard} nativeID="inline-plant-results">
          <Card.Content>
            <Text style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>🔒 INLINE RESULTS (No Navigation)</Text>
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
              {!result.confidence && result.confidence_percentage && (
                <Chip 
                  mode="flat" 
                  style={[styles.confidenceChip, { backgroundColor: '#4CAF50' }]}
                  textStyle={{ color: '#fff', fontWeight: 'bold' }}
                >
                  {result.confidence_percentage}%
                </Chip>
              )}
            </View>

            <Surface style={styles.diseaseCard}>
              <Text style={styles.diseaseLabel}>Detected Condition:</Text>
              <Text style={styles.diseaseName}>
                {result.disease || result.crop || 'Analysis Complete'}
              </Text>
            </Surface>

            {/* VISIBILITY DEBUG */}
            <Surface style={{ padding: 6, marginTop: 6, backgroundColor: '#E8F5E9' }}>
              <Text style={{ fontSize: 9, color: '#2E7D32' }}>
                ✅ Rendered: {new Date().toLocaleTimeString()}
                {'\n'}📍 Crop: {result.crop || 'N/A'}
                {'\n'}🦠 Disease: {result.disease || 'N/A'}
                {'\n'}📊 Conf: {result.confidence_percentage || result.confidence || '0%'}
              </Text>
            </Surface>

            {(result.recommendations || result.recommendation) && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>💡 Recommendations:</Text>
                <Text style={styles.recommendationText}>
                  {result.recommendations || result.recommendation}
                </Text>
              </View>
            )}

            {result.treatment && (
              <View style={styles.treatmentSection}>
                <Text style={styles.sectionTitle}>💊 Treatment:</Text>
                <Text style={styles.treatmentText}>{result.treatment}</Text>
              </View>
            )}

            {result.fertilizers && result.fertilizers.recommended && result.fertilizers.recommended.length > 0 && (
              <View style={styles.fertilizersSection}>
                <Text style={styles.sectionTitle}>🌱 Recommended Fertilizers:</Text>
                {result.fertilizers.recommended.map((fert: any, index: number) => (
                  <Text key={index} style={styles.fertilizerText}>
                    • {typeof fert === 'string' ? fert : fert.name || JSON.stringify(fert)}
                  </Text>
                ))}
              </View>
            )}

            {result.predictions && result.predictions.length > 0 && (
              <View style={styles.predictionsSection}>
                <Text style={styles.sectionTitle}>🎯 Top Predictions:</Text>
                {result.predictions.slice(0, 3).map((pred: any, index: number) => (
                  <Surface key={index} style={styles.predictionCard}>
                    <Text style={styles.predictionName}>{pred.class_name || pred.class}</Text>
                    <Text style={styles.predictionConfidence}>
                      {Math.round((pred.confidence || 0) * 100)}%
                    </Text>
                  </Surface>
                ))}
              </View>
            )}

            {/* Debug: Show raw data if no structured data available */}
            {!result.disease && !result.crop && !result.recommendation && !result.recommendations && (
              <Surface style={styles.debugCard}>
                <Text style={styles.debugTitle}>📋 Raw Response (Debug Mode):</Text>
                <ScrollView horizontal style={{ maxHeight: 200 }}>
                  <Text style={styles.debugText}>
                    {JSON.stringify(result, null, 2)}
                  </Text>
                </ScrollView>
                <Text style={styles.debugHint}>
                  ⚠️ If you see this, the response structure may be unexpected. Check console logs.
                </Text>
              </Surface>
            )}

            <Surface style={styles.infoBox}>
              <Text style={styles.infoText}>
                ⚠️ This is an AI-powered estimate. Consult agricultural experts for critical decisions.
              </Text>
            </Surface>
          </Card.Content>
        </Card>
      )}

      {!image && !loading && !result && (
        <Card style={styles.placeholderCard}>
          <Card.Content>
            <Text style={styles.placeholderText}>📸 No image selected</Text>
            <Text style={styles.placeholderSubtext}>Choose an image from gallery or take a photo to get started</Text>
          </Card.Content>
        </Card>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
    
    {/* Snackbar for success/error messages - replaces window.alert() */}
    <Snackbar
      visible={snackbarVisible}
      onDismiss={() => setSnackbarVisible(false)}
      duration={4000}
      action={{
        label: 'OK',
        onPress: () => setSnackbarVisible(false),
      }}
      style={{ 
        backgroundColor: snackbarMessage.includes('❌') ? '#F44336' : '#4CAF50',
        marginBottom: Platform.OS === 'web' ? 20 : 0
      }}
    >
      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>
        {snackbarMessage}
      </Text>
    </Snackbar>
    </View>
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
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748B', fontWeight: '600' },
  loadingSubtext: { marginTop: 8, fontSize: 14, color: '#94A3B8' },
  resultCard: { 
    marginHorizontal: 16, 
    marginBottom: 16, 
    borderRadius: 16, 
    backgroundColor: '#fff', 
    elevation: 3,
    zIndex: 999,
    position: 'relative',
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontWeight: 'bold', color: '#1E293B' },
  confidenceChip: { elevation: 2 },
  diseaseCard: { backgroundColor: '#FFF3E0', padding: 16, borderRadius: 12, marginBottom: 16 },
  diseaseLabel: { fontSize: 12, color: '#E65100', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  diseaseName: { fontSize: 20, fontWeight: 'bold', color: '#E65100' },
  recommendationsSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  recommendationText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  treatmentSection: { marginBottom: 16 },
  treatmentText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  fertilizersSection: { marginBottom: 16 },
  fertilizerText: { fontSize: 14, color: '#475569', lineHeight: 22, marginLeft: 8 },
  predictionsSection: { marginBottom: 16 },
  predictionCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, marginBottom: 8 },
  predictionName: { fontSize: 14, color: '#334155', fontWeight: '500' },
  predictionConfidence: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold' },
  debugCard: { backgroundColor: '#FFF9E6', padding: 16, borderRadius: 12, marginTop: 16, marginBottom: 16 },
  debugTitle: { fontSize: 14, color: '#92400E', marginBottom: 8, fontWeight: '600' },
  debugText: { fontSize: 11, color: '#78350F', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', lineHeight: 16 },
  debugHint: { fontSize: 12, color: '#A16207', marginTop: 8, fontStyle: 'italic' },
  infoBox: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, marginTop: 8, elevation: 0 },
  infoText: { fontSize: 12, color: '#1565C0', textAlign: 'center' },
  placeholderCard: { marginHorizontal: 16, marginTop: 40, borderRadius: 16, backgroundColor: '#FFF9E6' },
  placeholderText: { fontSize: 18, fontWeight: 'bold', color: '#F59E0B', textAlign: 'center', marginBottom: 8 },
  placeholderSubtext: { fontSize: 14, color: '#92400E', textAlign: 'center' },
});
