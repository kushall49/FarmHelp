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
      console.log('[CREATE JOB] API response:', response);

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
        <TextInput mode="outlined" value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.label}>Description *</Text>
        <TextInput mode="outlined" value={description} onChangeText={setDescription} multiline numberOfLines={4} style={styles.input} />

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
        <TextInput mode="outlined" value={taluk} onChangeText={setTaluk} style={styles.input} />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput mode="outlined" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={styles.input} />

        <Text style={styles.label}>Date Needed * (YYYY-MM-DD)</Text>
        <TextInput mode="outlined" value={dateNeeded} onChangeText={setDateNeeded} placeholder="2025-10-25" style={styles.input} />

        <Button mode="contained" onPress={handleSubmit} loading={loading} style={styles.submitButton}>
          {loading ? 'Posting...' : 'Post Job Request'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#262626' },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 12, marginBottom: 8 },
  input: { backgroundColor: '#fff', marginBottom: 12 },
  chip: { alignSelf: 'flex-start', marginBottom: 12 },
  submitButton: { backgroundColor: '#2196F3', paddingVertical: 8, marginTop: 24 },
});
