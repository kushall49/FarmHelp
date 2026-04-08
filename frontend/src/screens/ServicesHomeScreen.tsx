import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  Chip,
  FAB,
  Portal,
  ActivityIndicator,
  Searchbar,
  Menu,
  Button,
  IconButton,
} from 'react-native-paper';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import ServiceCard from '../components/ServiceCard';
import JobCard from '../components/JobCard';
import TopNavigation from '../components/TopNavigation';
import { useSafeGoBack } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SERVICE_TYPES = [
  'All',
  'Tractor',
  'Harvester',
  'Ploughing',
  'Seeding',
  'Irrigation Setup',
  'Pesticide Spraying',
  'Farm Labor',
  'Transport',
  'Equipment Rental',
  'Other',
];

const KARNATAKA_DISTRICTS = [
  'All Districts',
  'Bagalkot',
  'Ballari',
  'Belagavi',
  'Bengaluru Rural',
  'Bengaluru Urban',
  'Bidar',
  'Chamarajanagar',
  'Chikkaballapura',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Davanagere',
  'Dharwad',
  'Gadag',
  'Hassan',
  'Haveri',
  'Kalaburagi',
  'Kodagu',
  'Kolar',
  'Koppal',
  'Mandya',
  'Mysuru',
  'Raichur',
  'Ramanagara',
  'Shivamogga',
  'Tumakuru',
  'Udupi',
  'Uttara Kannada',
  'Vijayapura',
  'Yadgir',
];

export default function ServicesHomeScreen({ navigation, route }: any) {
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState<'services' | 'jobs'>(
    route.params?.initialTab || 'services'
  );
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // FAB menu
  const [fabOpen, setFabOpen] = useState(false);
  
  // District dropdown
  const [districtMenuVisible, setDistrictMenuVisible] = useState(false);

  // Refresh when screen comes into focus (after creating service/job)
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [activeTab, selectedDistrict, selectedCategory])
  );

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedDistrict, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'services') {
        await fetchServices();
      } else {
        await fetchJobs();
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      console.log('[SERVICES] Fetching services...');
      console.log('[SERVICES] District:', selectedDistrict);
      console.log('[SERVICES] Category:', selectedCategory);
      
      const params: any = { isAvailable: true };
      
      if (selectedDistrict !== 'All Districts') {
        params.district = selectedDistrict;
      }
      
      if (selectedCategory !== 'All') {
        params.serviceType = selectedCategory;
      }
      
      console.log('[SERVICES] Request params:', params);
      
      const response = await api.getServiceListings(params);
      console.log('[SERVICES] Response:', response.data);
      
      const servicesData = response.data.data || [];
      console.log('[SERVICES] Services count:', servicesData.length);
      
      setServices(servicesData);
    } catch (error: any) {
      console.error('[SERVICES] Fetch services error:', error);
      console.error('[SERVICES] Error response:', error.response?.data);
      setServices([]);
    }
  };

  const fetchJobs = async () => {
    try {
      console.log('[JOBS] Fetching jobs...');
      
      const params: any = { isOpen: true };
      
      if (selectedDistrict !== 'All Districts') {
        params.district = selectedDistrict;
      }
      
      if (selectedCategory !== 'All') {
        params.serviceNeeded = selectedCategory;
      }
      
      console.log('[JOBS] Request params:', params);
      
      const response = await api.getJobRequests(params);
      console.log('[JOBS] Response:', response.data);
      
      const jobsData = response.data.data || [];
      console.log('[JOBS] Jobs count:', jobsData.length);
      
      setJobs(jobsData);
    } catch (error: any) {
      console.error('[JOBS] Fetch jobs error:', error);
      console.error('[JOBS] Error response:', error.response?.data);
      setJobs([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filteredData = activeTab === 'services' ? services : jobs;

  return (
    <View style={styles.container}>
      <TopNavigation activeTab="Services" />
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Services Marketplace</Text>
          <IconButton
            icon="magnify"
            size={24}
            onPress={() => {}}
          />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <MaterialCommunityIcons
              name="tractor"
              size={20}
              color={activeTab === 'services' ? '#4CAF50' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
              Find Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
            onPress={() => setActiveTab('jobs')}
          >
            <MaterialCommunityIcons
              name="briefcase-search"
              size={20}
              color={activeTab === 'jobs' ? '#4CAF50' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>
              Find Jobs
            </Text>
          </TouchableOpacity>
        </View>

        {/* District Filter */}
        <Menu
          visible={districtMenuVisible}
          onDismiss={() => setDistrictMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.districtButton}
              onPress={() => setDistrictMenuVisible(true)}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color="#4CAF50" />
              <Text style={styles.districtButtonText}>{selectedDistrict}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          }
        >
          <ScrollView style={{ maxHeight: 300 }}>
            {KARNATAKA_DISTRICTS.map((district) => (
              <Menu.Item
                key={district}
                onPress={() => {
                  setSelectedDistrict(district);
                  setDistrictMenuVisible(false);
                }}
                title={district}
              />
            ))}
          </ScrollView>
        </Menu>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={styles.chipsContent}
        >
          {SERVICE_TYPES.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.chip,
                selectedCategory === category && styles.selectedChip,
              ]}
              textStyle={[
                styles.chipText,
                selectedCategory === category && styles.selectedChipText,
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </Surface>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }) =>
            activeTab === 'services' ? (
              <ServiceCard
                service={item}
                onPress={() => navigation.navigate('ServiceDetails', { serviceId: item._id })}
              />
            ) : (
              <JobCard
                job={item}
                onPress={() => navigation.navigate('JobDetails', { jobId: item._id })}
              />
            )
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name={activeTab === 'services' ? 'tractor' : 'briefcase-search'}
                size={80}
                color="#ccc"
              />
              <Text style={styles.emptyText}>
                {activeTab === 'services'
                  ? 'No services available in your area'
                  : 'No job requests in your area'}
              </Text>
              <Text style={styles.emptySubtext}>
                Try changing your filters or be the first to post!
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <Portal>
        <FAB.Group
          visible={isFocused}
          open={fabOpen}
          icon={fabOpen ? 'close' : 'plus'}
          actions={[
            {
              icon: 'tractor',
              label: 'Offer Service',
              onPress: () => navigation.navigate('CreateListing'),
              style: styles.fabAction,
            },
            {
              icon: 'briefcase-plus',
              label: 'Request Service',
              onPress: () => navigation.navigate('CreateJobRequest'),
              style: styles.fabAction,
            },
            {
              icon: 'format-list-bulleted',
              label: 'My Listings',
              onPress: () => navigation.navigate('MyListings'),
              style: styles.fabAction,
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
          fabStyle={styles.fab}
        />
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    elevation: 2,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  districtButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  districtButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
  chipsContainer: {
    paddingLeft: 16,
  },
  chipsContent: {
    paddingRight: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#4CAF50',
  },
  chipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedChipText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    backgroundColor: '#4CAF50',
  },
  fabAction: {
    backgroundColor: '#fff',
  },
});
