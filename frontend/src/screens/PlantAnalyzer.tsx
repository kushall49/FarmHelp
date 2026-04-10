import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, Card, Surface, Chip, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { sanitizeImageUri } from '../utils/uriValidation';

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
  prediction?: string;
  confidence?: number;
  confidence_percentage?: string;
  confidencePercentage?: number | string;
  predictions?: Array<{ class_name: string; confidence: number }>;
  recommendation?: string;
  recommendations?: any;
  treatment?: string;
  cure?: {
    immediate?: string[];
    organic?: string[];
    chemical?: string[];
    prevention?: string[];
  };
  fertilizers?: any;
  gradcam?: string;
  processing_time_ms?: number;
  result?: any; // For nested result structure
}

interface ApiResponse {
  id: string;
  result: AnalysisResult;
}

const renderTextSafely = (data: any): string => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'string') return `• ${item}`;
      if (item && typeof item === 'object') {
        // Extract known fields if present
        const text = item.text || item.description || item.name || Object.values(item)[0];
        return `• ${text ? String(text) : JSON.stringify(item)}`;
      }
      return `• ${String(item)}`;
    }).join('\n\n');
  }
  if (typeof data === 'object') {
    const lines = [];
    for (const [key, value] of Object.entries(data)) {
      if (value && ['string', 'number', 'boolean'].includes(typeof value)) {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        lines.push(`${formattedKey}: ${value}`);
      } else if (Array.isArray(value)) {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        lines.push(`${formattedKey}:\n  ${value.join('\n  ')}`);
      }
    }
    return lines.length > 0 ? lines.join('\n\n') : JSON.stringify(data, null, 2).replace(/[{}"]/g, '');
  }
  return String(data);
};

const hasDisplayableContent = (data: any): boolean => {
  if (data == null) return false;
  if (typeof data === 'string') return data.trim().length > 0;
  if (typeof data === 'number' || typeof data === 'boolean') return true;
  if (Array.isArray(data)) return data.length > 0 && data.some(item => hasDisplayableContent(item));
  if (typeof data === 'object') {
    const values = Object.values(data);
    return values.length > 0 && values.some(value => hasDisplayableContent(value));
  }
  return false;
};

const normalizeAnalysisResult = (raw: any): AnalysisResult => {
  if (!raw || typeof raw !== 'object') return {};

  const parsedConfidence = typeof raw.confidence === 'number'
    ? raw.confidence
    : Number.parseFloat(String(raw.confidence || '0'));
  const confidence = Number.isFinite(parsedConfidence) ? parsedConfidence : 0;

  const confidenceRaw = raw.confidence_percentage ?? raw.confidencePercentage;
  const confidencePercentage = confidenceRaw != null
    ? String(confidenceRaw).replace('%', '')
    : (confidence > 0 ? String(Math.round(confidence * 100)) : '');

  const diseaseName = raw.disease?.name || raw.disease || raw.prediction || 'Analysis Complete';

  let fertilizers = raw.fertilizers;
  if (Array.isArray(raw.fertilizers)) {
    fertilizers = { recommended: raw.fertilizers };
  } else if (raw.fertilizers?.recommendations && !raw.fertilizers?.recommended) {
    fertilizers = { ...raw.fertilizers, recommended: raw.fertilizers.recommendations };
  }

  const cure = raw.cure;
  const cureSteps = Array.isArray(cure?.immediate) ? cure.immediate : [];
  const fallbackRecommendation = cureSteps.length > 0
    ? `Immediate actions:\n${cureSteps.map((s: string) => `• ${s}`).join('\n')}`
    : undefined;

  return {
    ...raw,
    crop: raw.crop || 'Unknown',
    disease: String(diseaseName),
    confidence,
    confidence_percentage: confidencePercentage,
    recommendation: raw.recommendation || raw.recommendations?.summary || fallbackRecommendation,
    recommendations: raw.recommendations || raw.cure,
    treatment: raw.treatment || raw.cure,
    fertilizers
  };
};

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
      quality: 1.0, // Full quality - no compression
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
      quality: 1.0, // Full quality - no compression
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
        } as any);
        
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
        analysisResult = normalizeAnalysisResult(res.data.result);
      } else if (res.data.analysis) {
        analysisResult = normalizeAnalysisResult(res.data.analysis);
      } else if (res.data.success !== false) {
        analysisResult = normalizeAnalysisResult(res.data);
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
      onResponderRelease={(e) => { e.stopPropagation(); }}
    >
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Plant Analyzer</Text>
          <Text style={styles.subtitle}>AI-powered crop disease detection</Text>
        </View>
        <Surface style={styles.headerIconContainer} elevation={0}>
          <Text style={{ fontSize: 28 }}>🌿</Text>
        </Surface>
      </View>

      {!image ? (
        <View style={styles.uploadSection}>
          <View style={styles.dashedBox}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 32 }}>📸</Text>
            </View>
            <Text style={styles.uploadTitle}>Upload Plant Image</Text>
            <Text style={styles.uploadSubtitle}>Take a photo of the affected leaf or upload from gallery</Text>
            
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={pickImage} 
                icon="image" 
                style={[styles.actionButton, styles.galleryBtn]}
                textColor="#10B981"
                buttonColor="#ECFDF5"
              >
                Gallery
              </Button>
              <Button 
                mode="contained" 
                onPress={takePhoto} 
                icon="camera" 
                style={[styles.actionButton, styles.cameraBtn]}
                buttonColor="#10B981"
              >
                Camera
              </Button>
            </View>
          </View>
        </View>
      ) : (
        <Card style={styles.modernCard}>
          <Image source={{ uri: sanitizeImageUri(image.uri, '') }} style={styles.previewImage} />
          <View style={styles.imageOverlay}>
            <View style={styles.imageActionRow}>
              <Button 
                mode="contained" 
                buttonColor="rgba(0,0,0,0.6)" 
                textColor="#fff"
                onPress={() => { setImage(null); setResult(null); }}
                style={styles.overlayBtn}
                icon="close"
              >
                Clear
              </Button>
            </View>
          </View>
          
          <View style={styles.analyzeContainer}>
            <Button 
              mode="contained" 
              onPress={(e: any) => {
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                analyze();
                return false;
              }} 
              disabled={loading} 
              style={styles.analyzeBtn}
              contentStyle={styles.analyzeBtnContent}
              buttonColor="#10B981"
            >
              {loading ? 'Processing Image...' : 'Run Diagnostics'}
            </Button>
          </View>
        </Card>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={48} color="#10B981" />
          <Text style={styles.loadingText}>Analyzing Plant Health...</Text>
          <Text style={styles.loadingSubtext}>Our AI is scanning for millions of patterns</Text>
        </View>
      ) : null}

      {(result && !loading) ? (
        <View style={styles.resultContainer} nativeID="inline-plant-results">
          
          <Text style={styles.sectionHeader}>Diagnosis Report</Text>

          <Card style={[styles.modernCard, styles.diagnosisCard]}>
            <View style={styles.diagnosisHeader}>
              <View style={styles.diagnosisIconBox}>
                <Text style={{ fontSize: 24 }}>{result.disease && !String(result.disease).toLowerCase().includes('healthy') ? '🦠' : '✅'}</Text>
              </View>
              <View style={styles.diagnosisTitleBox}>
                <Text style={styles.diseaseLabel}>DETECTED CONDITION</Text>
                <Text style={styles.diseaseName}>
                  {result.disease ? String(result.disease) : (result.crop ? String(result.crop) : 'Analysis Complete')}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Confidence</Text>
                <Text style={[styles.statValue, { color: getSeverityColor(Number(result.confidence)) }]}>
                  {result.confidence
                    ? `${Math.round(Number(result.confidence) * 100)}%`
                    : (result.confidence_percentage ? `${String(result.confidence_percentage).replace('%', '')}%` : 'N/A')}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Crop Type</Text>
                <Text style={[styles.statValue, { color: '#334155' }]} numberOfLines={1}>
                  {result.crop ? String(result.crop) : 'Unknown'}
                </Text>
              </View>
            </View>
          </Card>

          {(hasDisplayableContent(result.recommendations) || hasDisplayableContent(result.recommendation)) ? (
            <Card style={[styles.modernCard, styles.lightCard]}>
              <Text style={styles.cardSectionTitle}>💡 What to do next</Text>
              <Text style={styles.cardBodyText}>
                {hasDisplayableContent(result.recommendation)
                  ? renderTextSafely(result.recommendation)
                  : renderTextSafely(result.recommendations)}
              </Text>
            </Card>
          ) : null}

          {result.treatment ? (
            <Card style={[styles.modernCard, styles.treatmentCard]}>
              <Text style={styles.cardSectionTitle}>💊 Treatment Protocol</Text>
              <Text style={styles.cardBodyText}>{renderTextSafely(result.treatment)}</Text>
            </Card>
          ) : null}

          {(result.fertilizers && result.fertilizers.recommended && result.fertilizers.recommended.length > 0) ? (
            <Card style={styles.modernCard}>
              <Text style={styles.cardSectionTitle}>🌱 Suggested Fertilizers</Text>
              <View style={styles.pillsContainer}>
              {result.fertilizers.recommended.map((fert: any, index: number) => (
                <Surface key={index} style={styles.pillBox} elevation={0}>
                  <Text style={styles.pillText}>
                    {typeof fert === 'string' ? fert : (fert.name ? String(fert.name) : 'Fertilizer')}
                  </Text>
                </Surface>
              ))}
              </View>
            </Card>
          ) : null}

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              Note: This is an AI-generated assessment. Please consult with a local agronomist for severe crop conditions.
            </Text>
          </View>
        </View>
      ) : null}

    </ScrollView>
    
    <Snackbar
      visible={snackbarVisible}
      onDismiss={() => setSnackbarVisible(false)}
      duration={4000}
      style={{ 
        backgroundColor: snackbarMessage.includes('❌') ? '#EF4444' : '#10B981',
        borderRadius: 12,
        marginBottom: Platform.OS === 'web' ? 24 : 16,
        marginHorizontal: 16
      }}
    >
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
        {snackbarMessage}
      </Text>
    </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20
  },
  title: { 
    fontSize: 26,
    fontWeight: '800', 
    color: '#0F172A', 
    marginBottom: 4,
    letterSpacing: -0.5
  },
  subtitle: { 
    fontSize: 14, 
    color: '#64748B',
    fontWeight: '500'
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadSection: {
    paddingHorizontal: 20,
    marginTop: 10
  },
  dashedBox: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F1F5F9'
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 12
  },
  buttonRow: { 
    flexDirection: 'row', 
    width: '100%',
    gap: 12
  },
  actionButton: { 
    flex: 1,
    borderRadius: 14,
  },
  galleryBtn: {
    borderWidth: 0,
  },
  cameraBtn: {
    borderWidth: 0,
  },
  modernCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    overflow: 'hidden'
  },
  previewImage: { 
    width: '100%', 
    height: 320, 
    resizeMode: 'cover' 
  },
  imageOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlayBtn: {
    borderRadius: 100,
  },
  imageActionRow: {
    flexDirection: 'row',
    gap: 8
  },
  analyzeContainer: {
    padding: 20,
    backgroundColor: '#fff'
  },
  analyzeBtn: {
    borderRadius: 16,
  },
  analyzeBtnContent: {
    paddingVertical: 6,
    height: 54
  },
  loadingContainer: { 
    alignItems: 'center', 
    padding: 40,
    marginTop: 20
  },
  loadingText: { 
    marginTop: 20, 
    fontSize: 18, 
    color: '#0F172A', 
    fontWeight: '700' 
  },
  loadingSubtext: { 
    marginTop: 8, 
    fontSize: 14, 
    color: '#64748B' 
  },
  resultContainer: {
    paddingTop: 10,
    paddingBottom: 40
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginHorizontal: 24,
    marginBottom: 16,
    marginTop: 8
  },
  diagnosisCard: {
    padding: 20,
    backgroundColor: '#fff'
  },
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  diagnosisIconBox: {
    width: 48, height: 48,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  diagnosisTitleBox: {
    flex: 1
  },
  diseaseLabel: { 
    fontSize: 11, 
    color: '#D97706', 
    fontWeight: '700', 
    letterSpacing: 1,
    marginBottom: 4
  },
  diseaseName: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#92400E' 
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16
  },
  statBox: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  lightCard: {
    padding: 20,
    backgroundColor: '#F0FDF4'
  },
  treatmentCard: {
    padding: 20,
    backgroundColor: '#EFF6FF'
  },
  cardSectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#0F172A', 
    marginBottom: 12 
  },
  cardBodyText: { 
    fontSize: 15, 
    color: '#334155', 
    lineHeight: 24 
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 20,
    paddingTop: 0
  },
  pillBox: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  pillText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 14
  },
  disclaimerBox: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 16
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18
  }
});
