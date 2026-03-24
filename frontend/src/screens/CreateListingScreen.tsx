import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Surface,
  Menu,
  IconButton,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { useSafeGoBack } from '../navigation/AppNavigator';

const SERVICE_TYPES = [
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

const RATE_UNITS = ['per hour', 'per day', 'per acre', 'fixed'];

const KARNATAKA_DISTRICTS = [
  'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
  'Bidar', 'Chamarajanagar', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
  'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
  'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
  'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
  'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir',
];

export default function CreateListingScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  // Form data
  const [serviceType, setServiceType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rateAmount, setRateAmount] = useState('');
  const [rateUnit, setRateUnit] = useState('per day');
  
  // Dropdowns
  const [serviceTypeMenuVisible, setServiceTypeMenuVisible] = useState(false);
  const [districtMenuVisible, setDistrictMenuVisible] = useState(false);
  const [rateUnitMenuVisible, setRateUnitMenuVisible] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [16, 9],
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImagesToCloudinary = async () => {
    const uploadedUrls: string[] = [];

    for (const imageUri of images) {
      try {
        const formData = new FormData();
        
        if (Platform.OS === 'web') {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const file = new File([blob], `service_${Date.now()}.jpg`, { type: 'image/jpeg' });
          formData.append('image', file as any);
        } else {
          formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `service_${Date.now()}.jpg`,
          } as any);
        }

        const uploadResponse = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          uploadedUrls.push(data.url);
        }
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    console.log('[CREATE LISTING] Submit button pressed');
    
    // Validation
    if (!serviceType) {
      console.log('[CREATE LISTING] Validation failed: No service type');
      Alert.alert('Required Field Missing', 'Please select a service type');
      return;
    }
    if (!title.trim()) {
      console.log('[CREATE LISTING] Validation failed: No title');
      Alert.alert('Required Field Missing', 'Please enter a title');
      return;
    }
    if (!description.trim()) {
      console.log('[CREATE LISTING] Validation failed: No description');
      Alert.alert('Required Field Missing', 'Please enter a description');
      return;
    }
    if (!district) {
      console.log('[CREATE LISTING] Validation failed: No district');
      Alert.alert('Required Field Missing', 'Please select a district');
      return;
    }
    if (!taluk.trim()) {
      console.log('[CREATE LISTING] Validation failed: No taluk');
      Alert.alert('Required Field Missing', 'Please enter a taluk');
      return;
    }
    if (!phoneNumber.trim()) {
      console.log('[CREATE LISTING] Validation failed: No phone number');
      Alert.alert('Required Field Missing', 'Please enter a phone number');
      return;
    }
    if (!rateAmount.trim() || isNaN(Number(rateAmount))) {
      console.log('[CREATE LISTING] Validation failed: Invalid rate');
      Alert.alert('Invalid Input', 'Please enter a valid rate amount (numbers only)');
      return;
    }

    console.log('[CREATE LISTING] Validation passed, creating listing...');
    setLoading(true);

    try {
      // Upload images first (skip for now if none)
      const imageUrls = images.length > 0 ? await uploadImagesToCloudinary() : [];
      console.log('[CREATE LISTING] Images uploaded:', imageUrls.length);

      // Create listing
      const listingData = {
        serviceType,
        title: title.trim(),
        description: description.trim(),
        district,
        taluk: taluk.trim(),
        village: village.trim(),
        phoneNumber: phoneNumber.trim(),
        rateAmount: Number(rateAmount),  // ✅ Changed from 'rate' to 'rateAmount'
        rateUnit,
        images: imageUrls,
      };

      console.log('[CREATE LISTING] Sending data to API:', JSON.stringify(listingData, null, 2));
      const response = await api.createServiceListing(listingData);
      console.log('[CREATE LISTING] API response:', response.data);

      // Clear form
      setServiceType('');
      setTitle('');
      setDescription('');
      setDistrict('');
      setTaluk('');
      setVillage('');
      setPhoneNumber('');
      setRateAmount('');
      setImages([]);

      Alert.alert(
        'Success!',
        'Your service listing has been created successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('[CREATE LISTING] Navigating back to ServicesHome');
              // Navigate back and the useFocusEffect will refresh the list
              navigation.navigate('ServicesHome');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[CREATE LISTING] Error:', error);
      console.error('[CREATE LISTING] Error response:', error.response?.data);
      Alert.alert(
        'Error', 
        error.response?.data?.error || error.message || 'Failed to create listing. Please try again.'
      );
    } finally {
      setLoading(false);
      console.log('[CREATE LISTING] Loading state reset');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Create Service Listing</Text>
        <View style={{ width: 40 }} />
      </Surface>

      <View style={styles.contentWrapper}>
        <View style={styles.content}>
        {/* Image Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Photos (Optional)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <MaterialCommunityIcons name="close-circle" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <MaterialCommunityIcons name="camera-plus" size={32} color="#999" />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Service Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Service Type *</Text>
          <Menu
            visible={serviceTypeMenuVisible}
            onDismiss={() => setServiceTypeMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setServiceTypeMenuVisible(true)}
              >
                <Text style={[styles.dropdownText, !serviceType && styles.placeholder]}>
                  {serviceType || 'Select service type'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
              </TouchableOpacity>
            }
          >
            {SERVICE_TYPES.map((type) => (
              <Menu.Item
                key={type}
                onPress={() => {
                  setServiceType(type);
                  setServiceTypeMenuVisible(false);
                }}
                title={type}
              />
            ))}
          </Menu>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e"
            mode="outlined"
            placeholder="e.g., Tractor for rent - 50HP"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e"
            mode="outlined"
            placeholder="Describe your service, equipment condition, experience..."
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          {/* District */}
          <Text style={styles.label}>District *</Text>
          <Menu
            visible={districtMenuVisible}
            onDismiss={() => setDistrictMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setDistrictMenuVisible(true)}
              >
                <Text style={[styles.dropdownText, !district && styles.placeholder]}>
                  {district || 'Select district'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
              </TouchableOpacity>
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

          {/* Taluk */}
          <Text style={styles.label}>Taluk *</Text>
          <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e"
            mode="outlined"
            placeholder="e.g., Hunsur"
            value={taluk}
            onChangeText={setTaluk}
            style={styles.input}
          />

          {/* Village */}
          <Text style={styles.label}>Village (Optional)</Text>
          <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e"
            mode="outlined"
            placeholder="e.g., Bilikere"
            value={village}
            onChangeText={setVillage}
            style={styles.input}
          />
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.label}>Contact Number *</Text>
          <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e"
            mode="outlined"
            placeholder="10-digit mobile number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Rate (₹) *</Text>
              <TextInput activeOutlineColor="#1a7a4a" outlineColor="#ddeee4" textColor="#1a2e1e"
                mode="outlined"
                placeholder="Amount"
                value={rateAmount}
                onChangeText={setRateAmount}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
            
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Unit *</Text>
              <Menu
                visible={rateUnitMenuVisible}
                onDismiss={() => setRateUnitMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setRateUnitMenuVisible(true)}
                  >
                    <Text style={styles.dropdownText}>{rateUnit}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                  </TouchableOpacity>
                }
              >
                {RATE_UNITS.map((unit) => (
                  <Menu.Item
                    key={unit}
                    onPress={() => {
                      setRateUnit(unit);
                      setRateUnitMenuVisible(false);
                    }}
                    title={unit}
                  />
                ))}
              </Menu>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          labelStyle={styles.submitButtonLabel}
        >
          {loading ? 'Creating...' : 'Create Listing'}
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
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textMain,
  },
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textMain,
    marginBottom: 20,
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bg,
    fontSize: 15,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.textMain,
  },
  placeholder: {
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
  },
  imagesContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  addImageText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 16,
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
  },
});
