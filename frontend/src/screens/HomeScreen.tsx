/**
 * HomeScreen.tsx
 *
 * Main landing screen for FarmHelp — a production-grade farming companion app.
 * Shows a personalised greeting hero, live stats strip, quick-action grid,
 * a community feed preview, and a trusted-farmers banner.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Image,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api, Post } from '../services/api';
import { Colors } from '../constants/colors';
import QuickActionCard from '../components/home/QuickActionCard';
import PostCard from '../components/community/PostCard';
import Avatar from '../components/common/Avatar';

// ─── Screen dimensions ────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Local navigation type ────────────────────────────────────────────────────
// Covers all routes accessible (directly or via tab jump) from this screen.
type RootStackParamList = {
  Home: undefined;
  PlantAnalyzer: undefined;
  CropRecommendation: undefined;
  Chatbot: undefined;
  Community: undefined;
  Services: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

// ─── Static data ──────────────────────────────────────────────────────────────
const MONTH_NAMES: string[] = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

const STATE_BADGES: string[] = ['KA', 'MH', 'UP', 'AP', 'TN', 'PB', 'GJ'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a time-of-day greeting string based on the current hour (0–23). */
function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

/**
 * Derives the dominant crop season for a given 0-indexed month.
 *  Kharif  → June – October  (months 5–9)
 *  Rabi    → November – March (months 10–2)
 *  Zaid    → April – May      (months 3–4)
 */
function getSeason(month: number): string {
  if (month >= 5 && month <= 9) return 'Kharif';
  if (month >= 10 || month <= 2) return 'Rabi';
  return 'Zaid';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { state: authState } = useAuth();
  const { state: appState } = useApp();

  // ── Local state ─────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ── Animation refs ──────────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  // ── Derived display values ───────────────────────────────────────────────────
  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const season = getSeason(now.getMonth());
  const monthName = MONTH_NAMES[now.getMonth()];

  const user = authState.user;
  const firstName: string = user?.name
    ? user.name.split(' ')[0]
    : 'Farmer';
  const notifications: number = appState.notifications;

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Entrance animation — run once on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();

    loadPosts();
  }, []);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const loadPosts = useCallback(async (): Promise<void> => {
    try {
      setPostsLoading(true);
      const response = await api.getPosts({ limit: 3 });
      if (response.success) {
        setPosts(response.posts);
      }
    } catch (err) {
      console.error('[HomeScreen] Failed to fetch posts:', err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  const handleLikePost = useCallback(async (postId: string): Promise<void> => {
    try {
      const response = await api.likePost(postId);
      if (response.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, likes: response.likes } : p,
          ),
        );
      }
    } catch (err) {
      console.error('[HomeScreen] Failed to like post:', err);
    }
  }, []);

  // ── Navigation helpers ───────────────────────────────────────────────────────

  const goToPlantAnalyzer = useCallback((): void => {
    navigation.navigate('PlantAnalyzer');
  }, [navigation]);

  const goToCropAdvisor = useCallback((): void => {
    navigation.navigate('CropRecommendation');
  }, [navigation]);

  const goToChatbot = useCallback((): void => {
    navigation.navigate('Chatbot');
  }, [navigation]);

  /**
   * Services and Community live in sibling tab stacks.
   * We use a type assertion to reach them via the composite tab navigator.
   */
  const goToServices = useCallback((): void => {
    (navigation as any).navigate('ServicesTab');
  }, [navigation]);

  const goToCommunity = useCallback((): void => {
    (navigation as any).navigate('CommunityTab');
  }, [navigation]);

  const goToProfile = useCallback((): void => {
    (navigation as any).navigate('ProfileTab');
  }, [navigation]);

  const goToNotifications = useCallback((): void => {
    // Placeholder — a dedicated Notifications screen will be wired in future.
    console.log('[HomeScreen] Notifications tapped');
  }, []);

  // ── Sub-renders ─────────────────────────────────────────────────────────────

  /** Decorative blobs that give the hero section a leafy, organic feel. */
  const renderHeroBlobs = (): React.ReactElement => (
    <>
      <View style={styles.heroBlobTopRight} />
      <View style={styles.heroBlobTopLeft} />
      <View style={styles.heroBlobMidRight} />
      <View style={styles.heroBlobBottomLeft} />
      <View style={styles.heroBlobBottomRight} />
    </>
  );

  /** Resolves the posts section into one of three states: loading, empty, or list. */
  const renderPosts = (): React.ReactElement => {
    if (postsLoading) {
      return (
        <View style={styles.postsLoadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    if (posts.length === 0) {
      return (
        <View style={styles.emptyPostsBox}>
          <Text style={styles.emptyPostsEmoji}>👥</Text>
          <Text style={styles.emptyPostsTitle}>No posts yet</Text>
          <Text style={styles.emptyPostsBody}>
            Be the first to share something with the community!
          </Text>
        </View>
      );
    }

    return (
      <FlatList<Post>
        data={posts}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => {
              console.log('[HomeScreen] Post tapped:', item._id);
            }}
            onLike={() => handleLikePost(item._id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.postSpacer} />}
      />
    );
  };

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HEADER BAR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <View style={styles.header}>
        {/* Left: logo mark + wordmark */}
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>🌿</Text>
          <Text style={styles.headerWordmark}>FarmHelp</Text>
        </View>

        {/* Right: bell + avatar */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellTouchable}
            onPress={goToNotifications}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Text style={styles.bellEmoji}>🔔</Text>
            {notifications > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeLabel}>
                  {notifications > 99 ? '99+' : String(notifications)}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToProfile}
            activeOpacity={0.8}
            accessibilityLabel="Go to profile"
            accessibilityRole="button"
          >
            <Avatar
              name={user?.name ?? 'Farmer'}
              uri={user?.avatar}
              size={36}
              showBorder
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SCROLLABLE BODY
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. HERO SECTION
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <View style={styles.heroContainer}>
          {/* Decorative organic background */}
          <View style={styles.heroBackground}>
            {renderHeroBlobs()}
          </View>

          {/* Dark-green tint overlay for legibility */}
          <View style={styles.heroOverlay} />

          {/* Animated hero copy — slides up on mount */}
          <Animated.View
            style={[
              styles.heroContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.heroGreeting}>
              {greeting}, {firstName}! 🌱
            </Text>
            <Text style={styles.heroSubtitle}>
              What does your farm need today?
            </Text>

            {/* Pill row: temperature | season | month */}
            <View style={styles.heroPillRow}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>🌡️ -- °C</Text>
              </View>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>🌧️ {season}</Text>
              </View>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>📅 {monthName}</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. QUICK STATS ROW  (overlaps hero bottom)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <View style={styles.statsStrip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollPadding}
          >
            {/* Stat card: Weather */}
            <View style={styles.statCard}>
              <Text style={styles.statCardIcon}>☀️</Text>
              <Text style={styles.statCardValue}>28°C</Text>
              <Text style={styles.statCardLabel}>Mostly Sunny</Text>
            </View>

            {/* Stat card: Season */}
            <View style={styles.statCard}>
              <Text style={styles.statCardIcon}>🌱</Text>
              <Text style={styles.statCardValue}>{season}</Text>
              <Text style={styles.statCardLabel}>Current Season</Text>
            </View>

            {/* Stat card: Market price placeholder */}
            <View style={styles.statCard}>
              <Text style={styles.statCardIcon}>📈</Text>
              <Text style={styles.statCardValue}>₹2,150/q</Text>
              <Text style={styles.statCardLabel}>Rice MSP</Text>
            </View>
          </ScrollView>
        </View>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            4. QUICK ACTIONS SECTION
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Quick Actions</Text>
            <TouchableOpacity
              onPress={goToCommunity}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Text style={styles.sectionSeeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* 2 × 2 grid */}
          <View style={styles.actionsGrid}>
            {/* Row 1 */}
            <View style={styles.actionsRow}>
              <View style={styles.actionCardWrapper}>
                <QuickActionCard
                  icon="🔬"
                  title="Plant Analyzer"
                  subtitle="Detect crop diseases"
                  iconBg={Colors.accentSoft}
                  onPress={goToPlantAnalyzer}
                />
              </View>
              <View style={styles.actionCardWrapper}>
                <QuickActionCard
                  icon="🌾"
                  title="Crop Advisor"
                  subtitle="AI recommendations"
                  iconBg={Colors.warningLight}
                  onPress={goToCropAdvisor}
                />
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.actionsRow}>
              <View style={styles.actionCardWrapper}>
                <QuickActionCard
                  icon="🤖"
                  title="FarmBot AI"
                  subtitle="24/7 farming help"
                  iconBg={Colors.infoLight}
                  onPress={goToChatbot}
                />
              </View>
              <View style={styles.actionCardWrapper}>
                <QuickActionCard
                  icon="🏪"
                  title="Services"
                  subtitle="Find farm services"
                  iconBg={COLORS_EXTRA.orangeLight}
                  onPress={goToServices}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            5. COMMUNITY PREVIEW SECTION
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Community Feed</Text>
            <TouchableOpacity
              onPress={goToCommunity}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Text style={styles.sectionSeeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {renderPosts()}
        </View>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            6. TRUSTED FARMERS BANNER
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <View style={styles.trustedWrapper}>
          <View style={styles.trustedCard}>
            {/* Headline row */}
            <View style={styles.trustedHeadRow}>
              <Text style={styles.trustedFlag}>🇮🇳</Text>
              <Text style={styles.trustedHeadText}>
                Trusted by 10,000+ Farmers Across India
              </Text>
            </View>

            {/* State badge row */}
            <View style={styles.stateBadgeRow}>
              {STATE_BADGES.map((abbr) => (
                <View key={abbr} style={styles.stateBadge}>
                  <Text style={styles.stateBadgeText}>{abbr}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            7. BOTTOM PADDING  (clears tab bar)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ─── Extra colours not in the shared palette ─────────────────────────────────
// Kept here so JSX stays free of inline strings.
const COLORS_EXTRA = {
  orangeLight: '#FFF3E0',
  heroBg: '#2E7D32',
  heroBlob1: '#388E3C',
  heroBlob2: '#33691E',
  heroBlob3: '#43A047',
  heroBlob4: '#1B5E20',
  heroBlob5: '#4CAF50',
  heroOverlay: 'rgba(27,94,32,0.75)',
  pillBg: 'rgba(255,255,255,0.20)',
  pillBorder: 'rgba(255,255,255,0.30)',
  subtitleWhite: 'rgba(255,255,255,0.85)',
};

// ─── Computed layout constants ────────────────────────────────────────────────
// Each action card occupies ~half the row width (accounting for padding + gap).
const ACTION_CARD_WIDTH = (SCREEN_WIDTH - 32 - 10) / 2;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Root & scroll container ────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── 1. Header bar ──────────────────────────────────────────────────────────
  header: {
    height: 64,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  headerWordmark: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellTouchable: {
    position: 'relative',
    padding: 4,
  },
  bellEmoji: {
    fontSize: 22,
  },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeLabel: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: '700',
    lineHeight: 11,
  },

  // ── 2. Hero section ────────────────────────────────────────────────────────
  heroContainer: {
    height: 220,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS_EXTRA.heroBg,
  },
  // Decorative blobs — slightly different greens to mimic a leaf canopy
  heroBlobTopRight: {
    position: 'absolute',
    top: -32,
    right: -24,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS_EXTRA.heroBlob1,
    opacity: 0.5,
  },
  heroBlobTopLeft: {
    position: 'absolute',
    top: -18,
    left: -32,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS_EXTRA.heroBlob2,
    opacity: 0.4,
  },
  heroBlobMidRight: {
    position: 'absolute',
    top: 55,
    right: 44,
    width: 64,
    height: 86,
    borderRadius: 32,
    backgroundColor: COLORS_EXTRA.heroBlob3,
    opacity: 0.35,
  },
  heroBlobBottomLeft: {
    position: 'absolute',
    bottom: -8,
    left: 64,
    width: 86,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS_EXTRA.heroBlob4,
    opacity: 0.55,
  },
  heroBlobBottomRight: {
    position: 'absolute',
    bottom: 24,
    right: -12,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS_EXTRA.heroBlob5,
    opacity: 0.18,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS_EXTRA.heroOverlay,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroGreeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS_EXTRA.subtitleWhite,
    marginBottom: 12,
  },
  heroPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroPill: {
    backgroundColor: COLORS_EXTRA.pillBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS_EXTRA.pillBorder,
  },
  heroPillText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '500',
  },

  // ── 3. Quick stats strip ───────────────────────────────────────────────────
  statsStrip: {
    marginTop: -20,
    paddingHorizontal: 16,
  },
  statsScrollPadding: {
    paddingRight: 4,
  },
  statCard: {
    width: 140,
    height: 100,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'space-between',
  },
  statCardIcon: {
    fontSize: 22,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statCardLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  // ── Shared section chrome ──────────────────────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionSeeAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },

  // ── 4. Quick actions 2 × 2 grid ───────────────────────────────────────────
  actionsGrid: {
    gap: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCardWrapper: {
    width: ACTION_CARD_WIDTH,
  },

  // ── 5. Community posts ─────────────────────────────────────────────────────
  postsLoadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPostsBox: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyPostsEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyPostsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyPostsBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  postSpacer: {
    height: 10,
  },

  // ── 6. Trusted farmers banner ──────────────────────────────────────────────
  trustedWrapper: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  trustedCard: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 12,
    padding: 16,
  },
  trustedHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trustedFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  trustedHeadText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
    lineHeight: 20,
  },
  stateBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stateBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stateBadgeText: {
    fontSize: 8,
    color: Colors.white,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // ── 7. Bottom spacer ──────────────────────────────────────────────────────
  bottomSpacer: {
    height: 100,
  },
});
