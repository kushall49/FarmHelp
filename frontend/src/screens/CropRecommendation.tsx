import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api, CropRecommendation as CropRec } from '../services/api';
import { Colors } from '../constants/colors';
import { useSafeGoBack } from '../navigation/AppNavigator';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SOIL_TYPES = ['Clay', 'Loam', 'Sandy', 'Silty', 'Peaty', 'Black', 'Red'] as const;
const SEASONS = ['Kharif', 'Rabi', 'Zaid'] as const;
const WATER_LEVELS = ['Low', 'Medium', 'High'] as const;

type WaterLevel = 'Low' | 'Medium' | 'High';

const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: emoji for crop name
// ─────────────────────────────────────────────────────────────────────────────

function getCropEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('rice') || n.includes('paddy')) return '🌾';
  if (n.includes('wheat')) return '🌿';
  if (n.includes('cotton')) return '☁️';
  if (n.includes('maize') || n.includes('corn')) return '🌽';
  if (n.includes('sugarcane')) return '🎋';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('potato')) return '🥔';
  if (n.includes('onion')) return '🧅';
  if (n.includes('soybean') || n.includes('soy')) return '🫘';
  if (n.includes('mango')) return '🥭';
  if (n.includes('banana')) return '🍌';
  if (n.includes('tea')) return '🍵';
  if (n.includes('coffee')) return '☕';
  if (n.includes('sunflower')) return '🌻';
  if (n.includes('mustard')) return '🌼';
  if (n.includes('chilli') || n.includes('pepper')) return '🌶️';
  if (n.includes('groundnut') || n.includes('peanut')) return '🥜';
  return '🌱';
}

// ─────────────────────────────────────────────────────────────────────────────
// CropCard – defined before main component so it is in scope for FlatList
// ─────────────────────────────────────────────────────────────────────────────

interface CropCardProps {
  crop: CropRec;
  index: number;
}

function CropCard({ crop, index }: CropCardProps): JSX.Element {
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const isTopPick = index === 0;
  const emoji = getCropEmoji(crop.name);
  const scorePct = Math.min(Math.max(Math.round(crop.score ?? 0), 0), 100);

  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue: scorePct,
      duration: 900,
      delay: index * 120,
      useNativeDriver: false,
    }).start();
  }, [scorePct, index]);

  const animatedBarWidth = scoreAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.cropCard, isTopPick && styles.cropCardGold]}>
      {/* ── Best match badge (rank 1 only) ── */}
      {isTopPick && (
        <View style={styles.bestMatchBadge}>
          <Text style={styles.bestMatchText}>⭐ Best Match</Text>
        </View>
      )}

      {/* ── Header row ── */}
      <View
        style={[
          styles.cropCardHeader,
          isTopPick && styles.cropCardHeaderWithBadge,
        ]}
      >
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
        <Text style={styles.cropName} numberOfLines={1}>
          {crop.name}
        </Text>
        <Text style={styles.cropEmoji}>{emoji}</Text>
        <TouchableOpacity
          style={styles.bookmarkButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.bookmarkIcon}>🔖</Text>
        </TouchableOpacity>
      </View>

      {/* ── Match score ── */}
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Match Score</Text>
        <Text style={styles.scoreValue}>{scorePct}%</Text>
      </View>
      <View style={styles.scoreTrack}>
        <Animated.View
          style={[
            styles.scoreFill,
            { width: animatedBarWidth as unknown as number },
          ]}
        />
      </View>

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statText} numberOfLines={1}>
            ⚡ {crop.yieldPotential ?? 'N/A'} kg/ac
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statText} numberOfLines={1}>
            📊 {crop.marketDemand ?? 'N/A'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statText} numberOfLines={1}>
            💧 {crop.waterRequirement ?? 'N/A'}
          </Text>
        </View>
      </View>

      {/* ── Season + soil tags ── */}
      {((crop.seasons && crop.seasons.length > 0) ||
        (crop.suitableSoils && crop.suitableSoils.length > 0)) && (
        <View style={styles.tagsRow}>
          {crop.seasons?.map((s, i) => (
            <View key={`season-${i}`} style={styles.tag}>
              <Text style={styles.tagText}>{s}</Text>
            </View>
          ))}
          {crop.suitableSoils?.slice(0, 2).map((s, i) => (
            <View key={`soil-${i}`} style={styles.tag}>
              <Text style={styles.tagText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Temperature range ── */}
      {(crop.minTemp != null || crop.maxTemp != null) && (
        <Text style={styles.tempRange}>
          🌡️ {crop.minTemp ?? '?'}°C – {crop.maxTemp ?? '?'}°C
        </Text>
      )}

      {/* ── Learn More ── */}
      <TouchableOpacity style={styles.learnMoreButton} activeOpacity={0.7}>
        <Text style={styles.learnMoreText}>Learn More →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CropRecommendationScreen(): JSX.Element {
  useNavigation(); // imported as required; safe-go-back wraps it
  const handleGoBack = useSafeGoBack();

  const [soilType, setSoilType] = useState<string>('Loam');
  const [season, setSeason] = useState<string>('Kharif');
  const [selectedState, setSelectedState] = useState<string>('Karnataka');
  const [acres, setAcres] = useState<string>('');
  const [water, setWater] = useState<WaterLevel>('Medium');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CropRec[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recommended, setRecommended] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);

  // ── API call ──────────────────────────────────────────────────────────────────

  const handleRecommend = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getCropRecommendations({
        soil: soilType,
        season,
        state: selectedState,
        acres: acres.trim() ? parseFloat(acres) : undefined,
        water,
      });
      setResults(response.results ?? []);
      setRecommended(true);
    } catch (err: any) {
      const msg: string =
        err?.message ?? 'Failed to fetch recommendations. Please try again.';
      setError(msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }, [soilType, season, selectedState, acres, water]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
          <Text style={styles.headerTitle}>Smart Crop Advisor</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          AI-powered recommendations based on your conditions
        </Text>
      </View>

      {/* ── FORM CARD ───────────────────────────────────────────────────────── */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>🌾 Tell us about your farm</Text>

        {/* ── SOIL TYPE ── */}
        <Text style={styles.fieldLabel}>🪱 Soil Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillScrollContent}
        >
          {SOIL_TYPES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, soilType === s && styles.pillSelected]}
              onPress={() => setSoilType(s)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.pillText,
                  soilType === s && styles.pillTextSelected,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── SEASON ── */}
        <Text style={styles.fieldLabel}>🌤️ Season</Text>
        <View style={styles.pillRow}>
          {SEASONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, season === s && styles.pillSelected]}
              onPress={() => setSeason(s)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.pillText,
                  season === s && styles.pillTextSelected,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── STATE ── */}
        <Text style={styles.fieldLabel}>📍 State</Text>
        <TouchableOpacity
          style={styles.stateSelector}
          onPress={() => setStateModalVisible(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.stateSelectorText}>{selectedState}</Text>
          <Text style={styles.stateSelectorChevron}>▼</Text>
        </TouchableOpacity>

        {/* ── LAND SIZE ── */}
        <Text style={styles.fieldLabel}>📐 Land Size (acres)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={acres}
            onChangeText={setAcres}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
          />
          <Text style={styles.inputSuffix}>acres</Text>
        </View>

        {/* ── WATER AVAILABILITY ── */}
        <Text style={styles.fieldLabel}>💧 Water</Text>
        <View style={styles.segmentedControl}>
          {WATER_LEVELS.map((w, i) => (
            <TouchableOpacity
              key={w}
              style={[
                styles.segment,
                water === w && styles.segmentSelected,
                i === 0 && styles.segmentFirst,
                i === WATER_LEVELS.length - 1 && styles.segmentLast,
              ]}
              onPress={() => setWater(w)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.segmentText,
                  water === w && styles.segmentTextSelected,
                ]}
              >
                {w}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── SUBMIT BUTTON ── */}
        <TouchableOpacity
          style={[
            styles.recommendButton,
            loading && styles.recommendButtonLoading,
          ]}
          onPress={handleRecommend}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.recommendButtonContent}>
              <ActivityIndicator color={Colors.surface} size="small" />
              <Text style={styles.recommendButtonText}>
                {'  '}Finding best crops...
              </Text>
            </View>
          ) : (
            <Text style={styles.recommendButtonText}>
              🔍 Get Recommendations
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── ERROR BANNER ────────────────────────────────────────────────────── */}
      {error && !loading && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      )}

      {/* ── RESULTS SECTION ─────────────────────────────────────────────────── */}
      {recommended && !loading && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Top Crop Recommendations</Text>
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item, idx) => `${item.name}-${idx}`}
              renderItem={({ item, index }) => (
                <CropCard crop={item} index={index} />
              )}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🌾</Text>
              <Text style={styles.emptyStateTitle}>No recommendations found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try adjusting your soil type, season, or state.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── STATE PICKER MODAL ──────────────────────────────────────────────── */}
      <Modal
        visible={stateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity
                onPress={() => setStateModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={INDIAN_STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.stateItem,
                    selectedState === item && styles.stateItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedState(item);
                    setStateModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      selectedState === item && styles.stateItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedState === item && (
                    <Text style={styles.stateCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.stateItemDivider} />
              )}
            />
          </View>
        </View>
      </Modal>

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

  // ── Form card ────────────────────────────────────────────────────────────────
  formCard: {
    backgroundColor: Colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },

  // ── Pill selectors ───────────────────────────────────────────────────────────
  pillScroll: {
    marginBottom: 16,
  },
  pillScrollContent: {
    paddingRight: 8,
    gap: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  pillSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
  pillTextSelected: {
    color: Colors.textInverse,
  },

  // ── State selector ───────────────────────────────────────────────────────────
  stateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16,
    backgroundColor: Colors.surface,
  },
  stateSelectorText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  stateSelectorChevron: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // ── Land size input ──────────────────────────────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: Colors.surface,
  },
  textInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputSuffix: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },

  // ── Segmented control ────────────────────────────────────────────────────────
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 24,
  },
  segment: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  segmentFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentSelected: {
    backgroundColor: Colors.accent,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  segmentTextSelected: {
    color: Colors.textInverse,
  },

  // ── Recommend button ─────────────────────────────────────────────────────────
  recommendButton: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendButtonLoading: {
    opacity: 0.7,
  },
  recommendButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Error banner ─────────────────────────────────────────────────────────────
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
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

  // ── Results section ──────────────────────────────────────────────────────────
  resultsSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // ── Crop card ────────────────────────────────────────────────────────────────
  cropCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropCardGold: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  bestMatchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    zIndex: 1,
  },
  bestMatchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E65100',
  },
  cropCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropCardHeaderWithBadge: {
    paddingRight: 90,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  cropEmoji: {
    fontSize: 22,
    marginLeft: 6,
    marginRight: 4,
  },
  bookmarkButton: {
    padding: 4,
  },
  bookmarkIcon: {
    fontSize: 18,
  },

  // ── Match score bar ──────────────────────────────────────────────────────────
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  scoreTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 14,
    overflow: 'hidden',
  },
  scoreFill: {
    height: 8,
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },

  // ── Stats row ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  statText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Tags row ─────────────────────────────────────────────────────────────────
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // ── Temp range ───────────────────────────────────────────────────────────────
  tempRange: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },

  // ── Learn more ───────────────────────────────────────────────────────────────
  learnMoreButton: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  learnMoreText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },

  // ── State picker modal ───────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.50)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalClose: {
    fontSize: 18,
    color: Colors.textSecondary,
    padding: 4,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  stateItemSelected: {
    backgroundColor: Colors.accentSoft,
  },
  stateItemText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  stateItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  stateCheckmark: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '700',
  },
  stateItemDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
});
