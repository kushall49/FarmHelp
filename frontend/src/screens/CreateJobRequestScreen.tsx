import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  Menu,
  IconButton,
  Chip,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import { useSafeGoBack } from '../navigation/AppNavigator';

const SERVICE_TYPES = [
  'Tractor', 'Harvester', 'Ploughing', 'Seeding', 'Irrigation Setup',
  'Pesticide Spraying', 'Farm Labor', 'Transport', 'Equipment Rental', 'Other',
];

const KARNATAKA_DISTRICTS = [
  'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
  'Bidar', 'Chamarajanagar', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
  'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
  'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
  'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
  'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir',
];

export default function CreateJobRequestScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  
  const [serviceMenuVisible, setServiceMenuVisible] = useState(false);
  const [districtMenuVisible, setDistrictMenuVisible] = useState(false);

  const handleSubmit = async () => {
    console.log('[CREATE JOB] Submit button pressed');
    
    // Validation
    if (!serviceNeeded) {
      console.log('[CREATE JOB] Validation failed: No service needed');
      Alert.alert('Required Field Missing', 'Please select the service you need');
      return;
    }
    if (!title.trim()) {
      console.log('[CREATE JOB] Validation failed: No title');
      Alert.alert('Required Field Missing', 'Please enter a title');
      return;
    }
    if (!description.trim()) {
      console.log('[CREATE JOB] Validation failed: No description');
      Alert.alert('Required Field Missing', 'Please enter a description');
      return;
    }
    if (!district) {
      console.log('[CREATE JOB] Validation failed: No district');
      Alert.alert('Required Field Missing', 'Please select a district');
      return;
    }
    if (!taluk.trim()) {
      console.log('[CREATE JOB] Validation failed: No taluk');
      Alert.alert('Required Field Missing', 'Please enter a taluk');
      return;
    }
    if (!phoneNumber.trim()) {
      console.log('[CREATE JOB] Validation failed: No phone number');
      Alert.alert('Required Field Missing', 'Please enter a phone number');
      return;
    }
    if (!dateNeeded) {
      console.log('[CREATE JOB] Validation failed: No date');
      Alert.alert('Required Field Missing', 'Please select when you need the service');
      return;
    }

    console.log('[CREATE JOB] Validation passed, creating job request...');
    setLoading(true);
    
    try {
      const jobData = {
        serviceNeeded,
        title: title.trim(),
        description: description.trim(),
        district,
        taluk: taluk.trim(),
        village: village.trim(),
        phoneNumber: phoneNumber.trim(),
        dateNeeded: new Date(dateNeeded).toISOString(),
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
      };

      console.log('[CREATE JOB] Sending data to API:', JSON.stringify(jobData, null, 2));
      const response = await api.createJobRequest(jobData);
      console.log('[CREATE JOB] API response:', response.data);

      // Clear form
      setServiceNeeded('');
      setTitle('');
      setDescription('');
      setDistrict('');
      setTaluk('');
      setVillage('');
      setPhoneNumber('');
      setDateNeeded('');
      setBudgetMin('');
      setBudgetMax('');

      Alert.alert('Success!', 'Your job request has been posted successfully', [
        { 
          text: 'OK', 
          onPress: () => {
            console.log('[CREATE JOB] Navigating to ServicesHome with jobs tab');
            // Navigate back to ServicesHome with Jobs tab
            navigation.navigate('ServicesHome', { initialTab: 'jobs' });
          }
        },
      ]);
    } catch (error: any) {
      console.error('[CREATE JOB] Error:', error);
      console.error('[CREATE JOB] Error response:', error.response?.data);
      Alert.alert(
        'Error', 
        error.response?.data?.error || error.message || 'Failed to post job request. Please try again.'
      );
    } finally {
      setLoading(false);
      console.log('[CREATE JOB] Loading state reset');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Post Job Request</Text>
        <View style={{ width: 40 }} />
      </Surface>

      <View style={styles.contentWrapper}>
        <View style={styles.content}>
        <Text style={styles.label}>Service Needed *</Text>
        <Menu
          visible={serviceMenuVisible}
          onDismiss={() => setServiceMenuVisible(false)}
          anchor={
            <Chip
              icon="briefcase"
              onPress={() => setServiceMenuVisible(true)}
              style={styles.chip}
            >
              {serviceNeeded || 'Select service'}
            </Chip>
          }
        >
          {SERVICE_TYPES.map((type) => (
            <Menu.Item
              key={type}
              onPress={() => {
                setServiceNeeded(type);
                setServiceMenuVisible(false);
              }}
              title={type}
            />
          ))}
        </Menu>

        <Text style={styles.label}>Title *</Text>
        <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e" mode="outlined" value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.label}>Description *</Text>
        <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e" mode="outlined" value={description} onChangeText={setDescription} multiline numberOfLines={4} style={styles.input} />

        <Text style={styles.label}>District *</Text>
        <Menu
          visible={districtMenuVisible}
          onDismiss={() => setDistrictMenuVisible(false)}
          anchor={
            <Chip
              icon="map-marker"
              onPress={() => setDistrictMenuVisible(true)}
              style={styles.chip}
            >
              {district || 'Select district'}
            </Chip>
          }
        >
          <ScrollView style={{ maxHeight: 300 }}>
            {KARNATAKA_DISTRICTS.map((dist) => (
              <Menu.Item
                key={dist}
                onPress={() => {
                  setDistrict(dist);
                  setDistrictMenuVisible(false);
                }}
                title={dist}
              />
            ))}
          </ScrollView>
        </Menu>

        <Text style={styles.label}>Taluk *</Text>
        <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e" mode="outlined" value={taluk} onChangeText={setTaluk} style={styles.input} />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e" mode="outlined" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={styles.input} />

        <Text style={styles.label}>Date Needed * (YYYY-MM-DD)</Text>
        <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e" mode="outlined" value={dateNeeded} onChangeText={setDateNeeded} placeholder="2025-10-25" style={styles.input} />

        <Button mode="contained" onPress={handleSubmit} loading={loading} style={styles.submitButton}>
          {loading ? 'Posting...' : 'Post Job Request'}
        </Button>
          </View>
        </View>
      </ScrollView>
  );
}


const colors = {
  primary: '#1a7a4a',
  primaryLight: '#e8f5ee',
  accent: '#f5a623',
  surface: '#ffffff',
  bg: '#f6f9f7',
  textMain: '#1a2e1e',
  textMuted: '#6b8070',
  border: '#ddeee4'
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textMain },
  contentWrapper: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: colors.surface,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMain, marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: colors.bg, fontSize: 15 },
  chip: { alignSelf: 'flex-start', marginBottom: 16, backgroundColor: colors.primaryLight },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 32,
    marginBottom: 40,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
    letterSpacing: 0.5,
  }
});
