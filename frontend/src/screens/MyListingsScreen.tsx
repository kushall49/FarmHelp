import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, Button, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeGoBack } from '../navigation/AppNavigator';

export default function MyListingsScreen({ navigation }: any) {
  // ✅ NAVIGATION FIX: Use safe navigation with deep link fallback
  const handleGoBack = useSafeGoBack();
  
  return (
    <ScrollView style={styles.container}>
      {/* Header with Back Button */}
      <Surface style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          onPress={handleGoBack}
        />
        <Text style={styles.headerTitle}>My Listings</Text>
        <View style={{ width: 40 }} />
      </Surface>

      {/* Coming Soon Content */}
      <View style={styles.content}>
        <MaterialCommunityIcons name="progress-wrench" size={80} color="#4CAF50" />
        <Title style={styles.title}>Coming Soon</Title>
        <Text style={styles.subtitle}>
          View and manage your service listings and job requests here
        </Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>View all your listings</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Edit listing details</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Toggle availability</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>View analytics</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('ServicesHome')}
          style={styles.button}
          icon="home"
        >
          Back to Marketplace
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('CreateListing')}
          style={styles.button}
          icon="plus"
        >
          Create New Listing
        </Button>
        
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
          icon="home-outline"
        >
          Go to Home
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 600,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  features: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  button: {
    marginTop: 12,
    width: '100%',
  },
});
