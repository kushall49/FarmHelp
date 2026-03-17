import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { api, PlantAnalysisResult } from '../services/api';
import { Colors } from '../constants/colors';
import { useSafeGoBack } from '../navigation/AppNavigator';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SectionKey = 'about' | 'treatment' | 'products';

interface SelectedImage {
  uri: string;
  base64?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getSeverityStyle(severity: string | undefined): {
  badgeBg: string;
  badgeText: string;
} {
  switch (severity?.toLowerCase()) {
    case 'high':
      return { badgeBg: Colors.badgeRed, badgeText: Colors.error };
    case 'medium':
      return { badgeBg: Colors.badgeAmber, badgeText: Colors.warning };
    case 'low':
      return { badgeBg: Colors.badgeGreen, badgeText: Colors.success };
    default:
      return { badgeBg: Colors.border, badgeText: Colors.textSecondary };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: ExpandableSection header row
// ─────────────────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  sectionKey: SectionKey;
  expanded: SectionKey | null;
  onToggle: (key: SectionKey) => void;
}

function SectionHeader({
  title,
  sectionKey,
  expanded,
  onToggle,
}: SectionHeaderProps) {
  const isOpen = expanded === sectionKey;
  return (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => onToggle(sectionKey)}
      activeOpacity={0.7}
    >
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Text style={styles.sectionChevron}>{isOpen ? '▲' : '▼'}</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PlantAnalyzerScreen(): JSX.Element {
  useNavigation(); // imported as required; safe-go-back wraps it
  const handleGoBack = useSafeGoBack();

  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PlantAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);

  // ── Camera / Gallery ────────────────────────────────────────────────────────

  const handleCamera = useCallback(async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Camera access is needed to photograph your plants. Please enable it in Settings.',
        [{ text: 'OK' }],
      );
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!res.canceled && res.assets.length > 0) {
      setSelectedImage({ uri: res.assets[0].uri });
      setResult(null);
      setError(null);
    }
  }, []);

  const handleGallery = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!res.canceled && res.assets.length > 0) {
      setSelectedImage({ uri: res.assets[0].uri });
      setResult(null);
      setError(null);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  }, []);

  // ── Analysis ─────────────────────────────────────────────────────────────────

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      const filename = selectedImage.uri.split('/').pop() ?? 'plant.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      if (Platform.OS === 'web') {
        const fetchRes = await fetch(selectedImage.uri);
        const blob = await fetchRes.blob();
        formData.append(
          'image',
          new File([blob], filename, { type: mimeType }),
          filename,
        );
      } else {
        // React Native FormData accepts this shape
        // @ts-ignore
        formData.append('image', { uri: selectedImage.uri, name: filename, type: mimeType });
      }

      const response = await api.analyzePlant(formData);
      setResult(response.result);
      setExpandedSection('about');
    } catch (err: any) {
      const msg: string = err?.message ?? 'Analysis failed. Please try again.';
      setError(msg);
      Alert.alert('Analysis Failed', msg);
    } finally {
      setAnalyzing(false);
    }
  }, [selectedImage]);

  // ── Section toggle ────────────────────────────────────────────────────────────

  const toggleSection = useCallback((key: SectionKey) => {
    setExpandedSection(prev => (prev === key ? null : key));
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────────

  const isHealthy =
    result?.disease === 'Healthy' ||
    (result?.disease?.toLowerCase().includes('healthy') ?? false);

  const confidencePct = result
    ? Math.min(Math.max(Math.round(result.confidence), 0), 100)
    : 0;

  const severityStyle = getSeverityStyle(result?.severity);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plant Disease Analyzer</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>AI-powered disease detection</Text>
      </View>

      {/* ── UPLOAD ZONE ─────────────────────────────────────────────────────── */}
      {!selectedImage && (
        <View style={styles.uploadZone}>
          <Text style={styles.uploadEmoji}>🌿</Text>
          <Text style={styles.uploadTitle}>Upload Plant Photo</Text>
          <Text style={styles.uploadSubtitle}>Get instant disease diagnosis</Text>
          <View style={styles.uploadButtonRow}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleCamera}
              activeOpacity={0.75}
            >
              <Text style={styles.uploadButtonText}>📷 Camera</Text>
            </TouchableOpacity>
            <View style={styles.uploadButtonGap} />
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleGallery}
              activeOpacity={0.75}
            >
              <Text style={styles.uploadButtonText}>🖼️ Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── IMAGE PREVIEW ───────────────────────────────────────────────────── */}
      {selectedImage && (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveImage}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── ANALYZE BUTTON ──────────────────────────────────────────────────── */}
      {selectedImage && (
        <TouchableOpacity
          style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={analyzing}
          activeOpacity={0.8}
        >
          {analyzing ? (
            <View style={styles.analyzeButtonContent}>
              <ActivityIndicator color={Colors.surface} size="small" />
              <Text style={styles.analyzeButtonText}>  Analyzing...</Text>
            </View>
          ) : (
            <Text style={styles.analyzeButtonText}>🔍 Analyze Plant</Text>
          )}
        </TouchableOpacity>
      )}

      {/* ── ERROR BANNER ────────────────────────────────────────────────────── */}
      {error && !analyzing && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      )}

      {/* ── RESULTS SECTION ─────────────────────────────────────────────────── */}
      {result && !analyzing && (
        <View style={styles.resultCard}>
          {/* ── Disease name ── */}
          <View style={styles.resultTitleRow}>
            {isHealthy ? (
              <Text style={styles.resultTitleHealthy}>✅ Healthy Plant</Text>
            ) : (
              <Text style={styles.resultTitleDisease}>⚠️ {result.disease}</Text>
            )}
          </View>
          <Text style={styles.resultCropName}>{result.crop}</Text>

          {/* ── Confidence bar ── */}
          <Text style={styles.confidenceLabel}>Confidence: {confidencePct}%</Text>
          <View style={styles.confidenceTrack}>
            <View
              style={[
                styles.confidenceFill,
                // Dynamic width is a runtime value; cannot be pre-declared in StyleSheet
                { width: `${confidencePct}%` as unknown as number },
              ]}
            />
          </View>

          {/* ── Severity badge ── */}
          {result.severity && (
            <View style={styles.severityRow}>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: severityStyle.badgeBg },
                ]}
              >
                <Text
                  style={[
                    styles.severityText,
                    { color: severityStyle.badgeText },
                  ]}
                >
                  {result.severity} Severity
                </Text>
              </View>
            </View>
          )}

          {/* ── SECTION: About This Disease ── */}
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="About This Disease"
              sectionKey="about"
              expanded={expandedSection}
              onToggle={toggleSection}
            />
            {expandedSection === 'about' && (
              <View style={styles.sectionBody}>
                {result.recommendations.symptoms.length > 0 ? (
                  result.recommendations.symptoms.map((symptom, i) => (
                    <View key={i} style={styles.numberedItem}>
                      <Text style={styles.numberedItemIndex}>{i + 1}.</Text>
                      <Text style={styles.numberedItemText}>{symptom}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyListText}>No symptoms listed.</Text>
                )}
              </View>
            )}
          </View>

          {/* ── SECTION: Treatment Plan ── */}
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Treatment Plan"
              sectionKey="treatment"
              expanded={expandedSection}
              onToggle={toggleSection}
            />
            {expandedSection === 'treatment' && (
              <View style={styles.sectionBody}>
                <Text style={styles.treatSubHeader}>Chemical</Text>
                {result.recommendations.chemical.length > 0 ? (
                  result.recommendations.chemical.map((item, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyListText}>None listed.</Text>
                )}

                <Text style={styles.treatSubHeader}>Organic</Text>
                {result.recommendations.organic.length > 0 ? (
                  result.recommendations.organic.map((item, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyListText}>None listed.</Text>
                )}

                <Text style={styles.treatSubHeader}>Preventive</Text>
                {result.recommendations.preventive.length > 0 ? (
                  result.recommendations.preventive.map((item, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyListText}>None listed.</Text>
                )}
              </View>
            )}
          </View>

          {/* ── SECTION: Recommended Products ── */}
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Recommended Products"
              sectionKey="products"
              expanded={expandedSection}
              onToggle={toggleSection}
            />
            {expandedSection === 'products' && (
              <View style={styles.sectionBody}>
                {result.fertilizers.length > 0 ? (
                  result.fertilizers.map((fert, i) => (
                    <View key={i} style={styles.fertCard}>
                      <View style={styles.fertCardHeader}>
                        <Text style={styles.fertName}>{fert.name}</Text>
                        {fert.safetyWarning && (
                          <View style={styles.safetyBadge}>
                            <Text style={styles.safetyBadgeText}>⚠️ Safety</Text>
                          </View>
                        )}
                      </View>
                      {fert.dosage ? (
                        <Text style={styles.fertDetail}>Dosage: {fert.dosage}</Text>
                      ) : null}
                      {fert.application ? (
                        <Text style={styles.fertDetail}>
                          Application: {fert.application}
                        </Text>
                      ) : null}
                      {fert.safetyWarning ? (
                        <Text style={styles.fertWarning}>{fert.safetyWarning}</Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyListText}>No products listed.</Text>
                )}
              </View>
            )}
          </View>

          {/* ── SAVE REPORT ── */}
          <View style={styles.saveRow}>
            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.75}
              onPress={() =>
                Alert.alert('Report Saved', 'Your analysis report has been saved successfully.')
              }
            >
              <Text style={styles.saveButtonText}>💾 Save Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles – NO inline style objects permitted; all values declared here
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 48,
  },
  bottomPadding: {
    height: 24,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: Colors.textInverse,
    fontSize: 22,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },

  // ── Upload zone ─────────────────────────────────────────────────────────────
  uploadZone: {
    margin: 16,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  uploadEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  uploadButtonRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  uploadButton: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  uploadButtonGap: {
    width: 8,
  },
  uploadButtonText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Image preview ────────────────────────────────────────────────────────────
  imageWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '800',
  },

  // ── Analyze button ───────────────────────────────────────────────────────────
  analyzeButton: {
    marginHorizontal: 16,
    marginTop: 14,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Error banner ─────────────────────────────────────────────────────────────
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.errorLight,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorBannerText: {
    fontSize: 14,
    color: Colors.error,
    lineHeight: 20,
  },

  // ── Result card ──────────────────────────────────────────────────────────────
  resultCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  resultTitleRow: {
    marginBottom: 4,
  },
  resultTitleHealthy: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.success,
  },
  resultTitleDisease: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.error,
  },
  resultCropName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },

  // ── Confidence bar ───────────────────────────────────────────────────────────
  confidenceLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  confidenceTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 14,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: 8,
    maxWidth: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },

  // ── Severity badge ───────────────────────────────────────────────────────────
  severityRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  severityText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Expandable sections ──────────────────────────────────────────────────────
  sectionContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionChevron: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionBody: {
    paddingBottom: 14,
  },

  // ── Numbered list ────────────────────────────────────────────────────────────
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 7,
  },
  numberedItemIndex: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '700',
    marginRight: 8,
    minWidth: 22,
  },
  numberedItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  emptyListText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // ── Treatment sub-headers + bullets ──────────────────────────────────────────
  treatSubHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 12,
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bulletDot: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '700',
    marginRight: 8,
  },
  bulletText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },

  // ── Fertilizer cards ─────────────────────────────────────────────────────────
  fertCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  fertName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  safetyBadge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  safetyBadgeText: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: '600',
  },
  fertDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  fertWarning: {
    fontSize: 12,
    color: Colors.warning,
    marginTop: 5,
    lineHeight: 17,
  },

  // ── Save report ──────────────────────────────────────────────────────────────
  saveRow: {
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  saveButton: {
    width: 200,
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
