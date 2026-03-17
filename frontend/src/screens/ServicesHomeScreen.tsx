import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api, ServiceListing } from '../services/api';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import ServiceCard from '../components/services/ServiceCard';
import EmptyState from '../components/common/EmptyState';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: string[] = [
  'All',
  'Tractor',
  'Harvester',
  'Ploughing',
  'Seeding',
  'Irrigation',
  'Pesticide Spraying',
  'Labor',
  'Transport',
  'Equipment Rental',
];

const INDIAN_DISTRICTS: string[] = [
  'Belgaum',
  'Dharwad',
  'Mysuru',
  'Nashik',
  'Pune',
  'Kolhapur',
  'Amravati',
  'Aurangabad',
  'Ludhiana',
  'Amritsar',
  'Jalandhar',
  'Jaipur',
  'Jodhpur',
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Hyderabad',
  'Warangal',
  'Visakhapatnam',
  'Coimbatore',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServicesHomeScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { state: authState } = useAuth();

  // State
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'services' | 'jobs'>('services');
  const [searchText, setSearchText] = useState<string>('');
  const [showDistrictModal, setShowDistrictModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const loadServices = useCallback(
    async (pageNum: number = 1, reset: boolean = false): Promise<void> => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        }

        const params: { district?: string; category?: string; page?: number } = {
          page: pageNum,
        };

        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (selectedDistrict.trim() !== '') {
          params.district = selectedDistrict;
        }

        const response = await api.getServices(params);
        const fetched: ServiceListing[] = response.services ?? [];

        if (reset || pageNum === 1) {
          setServices(fetched);
        } else {
          setServices((prev) => [...prev, ...fetched]);
        }

        setHasMore(fetched.length > 0);
        setPage(pageNum);
      } catch (error) {
        console.error('[ServicesHomeScreen] loadServices error:', error);
        if (pageNum === 1) {
          setServices([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, selectedDistrict],
  );

  useEffect(() => {
    loadServices(1, true);
  }, [loadServices]);

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await loadServices(1, true);
    setRefreshing(false);
  }, [loadServices]);

  const loadMore = useCallback((): void => {
    if (!loading && hasMore) {
      loadServices(page + 1, false);
    }
  }, [loading, hasMore, page, loadServices]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleCall = useCallback((service: ServiceListing): void => {
    Alert.alert(
      'Call Provider',
      `Call ${service.provider.name} for "${service.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: async () => {
            try {
              await api.trackServiceCall(service._id);
            } catch {
              // Tracking failure should not block showing the number
            } finally {
              Alert.alert(
                'Phone Number',
                service.phoneNumber,
                [{ text: 'OK' }],
              );
            }
          },
        },
      ],
    );
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredServices = React.useMemo<ServiceListing[]>(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return services;
    return services.filter(
      (s) =>
        s.title?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query),
    );
  }, [services, searchText]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderServiceItem = useCallback(
    ({ item }: { item: ServiceListing }): React.JSX.Element => (
      <ServiceCard
        service={item}
        onPress={() =>
          navigation.navigate('ServiceDetails', { serviceId: item._id })
        }
        onCall={() => handleCall(item)}
      />
    ),
    [navigation, handleCall],
  );

  const renderDistrictRow = ({
    item,
  }: {
    item: string;
  }): React.JSX.Element => {
    const isSelected = selectedDistrict === item;
    return (
      <TouchableOpacity
        style={[styles.districtRow, isSelected && styles.districtRowSelected]}
        onPress={() => {
          setSelectedDistrict(item);
          setShowDistrictModal(false);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Select district ${item}`}
      >
        <Text
          style={[
            styles.districtRowText,
            isSelected && styles.districtRowTextSelected,
          ]}
        >
          {item}
        </Text>
        {isSelected && (
          <Text style={styles.districtCheckmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <View style={styles.header}>

        {/* Row 1 – Title + create button */}
        <View style={styles.headerRow1}>
          <Text style={styles.headerTitle}>Services Marketplace</Text>
          <TouchableOpacity
            style={styles.headerCreateBtn}
            onPress={() => navigation.navigate('CreateListing')}
            accessibilityLabel="Create new listing"
          >
            <Text style={styles.headerCreateBtnText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 – Segmented tab pills */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'services' && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab('services')}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'services' && styles.tabPillTextActive,
              ]}
            >
              {'🏪 Find Services'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'jobs' && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab('jobs')}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'jobs' && styles.tabPillTextActive,
              ]}
            >
              {'📋 Find Jobs'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SEARCH BAR ─────────────────────────────────────────── */}
      <View style={styles.searchBar}>
        <Text style={styles.searchBarIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tractors, harvesters..."
          placeholderTextColor={Colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            style={styles.searchClearBtn}
            accessibilityLabel="Clear search"
          >
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── FILTER ROW ─────────────────────────────────────────── */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.districtPill}
          onPress={() => setShowDistrictModal(true)}
          accessibilityLabel="Select district"
        >
          <Text style={styles.districtPillText}>
            {'📍 ' + (selectedDistrict !== '' ? selectedDistrict : 'All Districts')}
          </Text>
          <Text style={styles.districtChevron}>▼</Text>
        </TouchableOpacity>

        {selectedDistrict !== '' && (
          <TouchableOpacity
            onPress={() => setSelectedDistrict('')}
            accessibilityLabel="Clear district filter"
          >
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── CATEGORY CHIPS ─────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
        style={styles.chipsScrollView}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => setSelectedCategory(cat)}
              accessibilityRole="button"
              accessibilityLabel={`Category: ${cat}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── CONTENT LIST ───────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList<ServiceListing>
          data={filteredServices}
          keyExtractor={(item) => item._id}
          renderItem={renderServiceItem}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🏪"
              title="No services found"
              subtitle="Try changing your filters or district"
              actionLabel="Post a Service"
              onAction={() => navigation.navigate('CreateListing')}
            />
          }
        />
      )}

      {/* ── DISTRICT SELECTOR MODAL ─────────────────────────────── */}
      <Modal
        visible={showDistrictModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowDistrictModal(false)}
        />

        {/* Bottom sheet */}
        <View style={styles.districtSheet}>
          <View style={styles.districtSheetHeader}>
            <Text style={styles.districtSheetTitle}>Select District</Text>
            <TouchableOpacity
              onPress={() => setShowDistrictModal(false)}
              style={styles.districtSheetCloseBtn}
              accessibilityLabel="Close district selector"
            >
              <Text style={styles.districtSheetCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList<string>
            data={INDIAN_DISTRICTS}
            keyExtractor={(item) => item}
            renderItem={renderDistrictRow}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 44,
  },
  headerRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.surface,
    letterSpacing: 0.2,
  },
  headerCreateBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCreateBtnText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 22,
  },

  // ── Tab row ───────────────────────────────────────────────────
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surface,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.surface,
  },
  tabPillTextActive: {
    color: Colors.primary,
  },

  // ── Search bar ────────────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBarIcon: {
    fontSize: 16,
    paddingHorizontal: 12,
    color: Colors.textMuted,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 12,
    paddingRight: 8,
  },
  searchClearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchClearText: {
    fontSize: 14,
    color: Colors.textMuted,
  },

  // ── Filter row ────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  districtPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  districtPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  districtChevron: {
    fontSize: 10,
    color: Colors.primary,
  },
  clearFilterText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // ── Category chips ────────────────────────────────────────────
  chipsScrollView: {
    flexGrow: 0,
  },
  chipsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.surface,
    fontWeight: '600',
  },

  // ── Loading ───────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── FlatList ──────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },

  // ── District modal backdrop ───────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },

  // ── District bottom sheet ─────────────────────────────────────
  districtSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '40%',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 16,
  },
  districtSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  districtSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  districtSheetCloseBtn: {
    padding: 6,
  },
  districtSheetCloseText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  districtRowSelected: {
    backgroundColor: Colors.accentSoft,
  },
  districtRowText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  districtRowTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  districtCheckmark: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
  },
});
