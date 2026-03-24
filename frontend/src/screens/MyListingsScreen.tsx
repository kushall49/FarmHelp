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
      <View style={styles.contentWrapper}>
        <View style={styles.content}>
        <MaterialCommunityIcons name="progress-wrench" size={80} color="#1a7a4a" />
        <Title style={styles.title}>Coming Soon</Title>
        <Text style={styles.subtitle}>
          View and manage your service listings and job requests here
        </Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#1a7a4a" />
            <Text style={styles.featureText}>View all your listings</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#1a7a4a" />
            <Text style={styles.featureText}>Edit listing details</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#1a7a4a" />
            <Text style={styles.featureText}>Toggle availability</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#1a7a4a" />
            <Text style={styles.featureText}>View analytics</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <Button 
          mode="contained" buttonColor="#1a7a4a" textColor="#ffffff" 
          onPress={() => navigation.navigate('ServicesHome')}
          style={styles.button}
          icon="home"
        >
          Back to Marketplace
        </Button>
        
        <Button
          mode="outlined" textColor="#1a7a4a" style={[{ borderColor: "#1a7a4a", borderWidth: 1.5 }, styles.button]}
          onPress={() => navigation.navigate('CreateListing')}
          icon="plus"
        >
          Create New Listing
        </Button>
        
        <Button 
          mode="text" textColor="#1a7a4a" 
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
          icon="home-outline"
        >
          Go to Home
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
    alignItems: 'center',
    minHeight: 600,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: 40,
    lineHeight: 24,
  },
  features: {
    width: '100%',
    marginBottom: 48,
    paddingHorizontal: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.bg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 16,
    color: colors.textMain,
    fontWeight: '500',
  },
  button: {
    marginTop: 16,
    width: '100%',
    paddingVertical: 6,
    borderRadius: 24,
  },
});
