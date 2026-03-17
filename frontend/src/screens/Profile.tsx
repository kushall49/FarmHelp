import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';
import Avatar from '../components/common/Avatar';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatItem {
  icon: string;
  label: string;
  value: number | string;
}

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Profile(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { state, logout } = useAuth();
  const user = state.user;

  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = useCallback((): void => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('[Profile] Logout error:', error);
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  }, [logout, navigation]);

  // ── Null-user guard ───────────────────────────────────────────────────────

  if (!user) {
    return (
      <View style={styles.noUserContainer}>
        <Text style={styles.noUserIcon}>🌾</Text>
        <Text style={styles.noUserTitle}>Not Logged In</Text>
        <Text style={styles.noUserSubtitle}>
          Please log in to view your profile.
        </Text>
        <TouchableOpacity
          style={styles.noUserButton}
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
          }
          accessibilityLabel="Go to login"
        >
          <Text style={styles.noUserButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  const stats: StatItem[] = [
    { icon: '🔬', label: 'Plants Analyzed', value: 0 },
    { icon: '🌾', label: 'Crops Saved', value: 0 },
    { icon: '💬', label: 'Posts Made', value: 0 },
    { icon: '⭐', label: 'Bookmarks', value: 0 },
  ];

  const menuItems: MenuItem[] = [
    {
      icon: '📋',
      label: 'My Listings',
      onPress: () => navigation.navigate('MyListings'),
    },
    {
      icon: '📝',
      label: 'My Posts',
      onPress: () => navigation.navigate('Community'),
    },
    {
      icon: '🌾',
      label: 'Saved Crops',
      onPress: () => console.log('[Profile] Navigate to Saved Crops'),
    },
    {
      icon: '🔬',
      label: 'Analysis History',
      onPress: () => navigation.navigate('PlantAnalyzer'),
    },
    {
      icon: '🌐',
      label: 'Language Settings',
      onPress: () =>
        Alert.alert('Coming Soon', 'Language settings are coming soon.'),
    },
    {
      icon: '❓',
      label: 'Help & Support',
      onPress: () =>
        Alert.alert('Help & Support', 'Contact: support@farmhelp.in'),
    },
    {
      icon: '⭐',
      label: 'Rate the App',
      onPress: () =>
        Alert.alert('Rate FarmHelp', 'Thank you for your feedback!'),
    },
  ];

  const dangerItems: MenuItem[] = [
    {
      icon: '🔒',
      label: 'Change Password',
      onPress: () =>
        Alert.alert(
          'Change Password',
          'Password change feature coming soon.',
        ),
    },
    {
      icon: '🚪',
      label: 'Logout',
      onPress: handleLogout,
      danger: true,
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── PROFILE HEADER ─────────────────────────────────────── */}
      <View style={styles.profileHeader}>
        {/* Simulated bottom gradient layer */}
        <View style={styles.headerGradientLayer} />

        <View style={styles.headerContent}>
          {/* Avatar */}
          <Avatar
            name={user.name}
            uri={user.avatar}
            size={80}
            showBorder
            verified={user.isVerifiedFarmer}
          />

          {/* Verified pill – only when verified */}
          {user.isVerifiedFarmer && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✓ Verified Farmer</Text>
            </View>
          )}

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>

          <View style={styles.locationRow}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText}>{user.state ?? 'India'}</Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityLabel="Edit profile"
          >
            <Text style={styles.editProfileBtnText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── STATS GRID ─────────────────────────────────────────── */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statCardIcon}>{stat.icon}</Text>
            <Text style={styles.statCardValue}>{stat.value}</Text>
            <Text style={styles.statCardLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── MY ACCOUNT MENU ────────────────────────────────────── */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>MY ACCOUNT</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBordered,
              ]}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── DANGER ZONE MENU ───────────────────────────────────── */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          {dangerItems.map((item, index) => {
            const isLastItem = index === dangerItems.length - 1;
            const isLoggingOutItem = item.danger && loggingOut;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  !isLastItem && styles.menuItemBordered,
                ]}
                onPress={item.onPress}
                disabled={isLoggingOutItem}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Text style={styles.menuItemIcon}>{item.icon}</Text>

                {isLoggingOutItem ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.error}
                    style={styles.menuItemActivityIndicator}
                  />
                ) : (
                  <Text
                    style={[
                      styles.menuItemLabel,
                      item.danger && styles.menuItemLabelDanger,
                    ]}
                  >
                    {item.label}
                  </Text>
                )}

                {!item.danger && (
                  <Text style={styles.menuItemArrow}>›</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── APP VERSION ────────────────────────────────────────── */}
      <Text style={styles.appVersion}>
        {'FarmHelp v1.0.0 • Made for Indian Farmers 🇮🇳'}
      </Text>

      {/* Tab bar spacer */}
      <View style={styles.tabBarSpacer} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Screen ────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContent: {
    paddingBottom: 0,
  },

  // ── No-user state ─────────────────────────────────────────────
  noUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 32,
  },
  noUserIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  noUserTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  noUserSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  noUserButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 12,
  },
  noUserButtonText: {
    color: Colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Profile header ────────────────────────────────────────────
  profileHeader: {
    height: 220,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  headerGradientLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#2E7D32',
    opacity: 0.5,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 44,
  },
  verifiedBadge: {
    marginTop: 6,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  verifiedBadgeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.surface,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.70)',
    marginTop: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationPin: {
    fontSize: 13,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.70)',
  },
  editProfileBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  editProfileBtnText: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Stats grid ────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -20,
    marginHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  statCardIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  statCardLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },

  // ── Menu sections ─────────────────────────────────────────────
  menuSection: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemBordered: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 26,
    textAlign: 'center',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  menuItemLabelDanger: {
    color: Colors.error,
    fontWeight: '600',
  },
  menuItemArrow: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: '400',
    lineHeight: 22,
  },
  menuItemActivityIndicator: {
    flex: 1,
    alignSelf: 'center',
  },

  // ── App version ───────────────────────────────────────────────
  appVersion: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 12,
    paddingVertical: 24,
    lineHeight: 18,
  },

  // ── Tab bar spacer ────────────────────────────────────────────
  tabBarSpacer: {
    height: 100,
  },
});
