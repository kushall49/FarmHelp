import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { Text, Button, ActivityIndicator, Surface, IconButton, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import { useSafeGoBack } from '../navigation/AppNavigator';

export default function JobDetailsScreen({ route, navigation }: any) {
  // ✅ NAVIGATION FIX: Use safe navigation with deep link fallback
  const handleGoBack = useSafeGoBack();
  const { jobId } = route.params;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const response = await api.getJobById(jobId);
      setJob(response.data);
    } catch (error) {
      console.error('Fetch job error:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    try {
      await api.trackResponse(jobId);
      Linking.openURL(`tel:${job.phoneNumber}`);
    } catch (error) {
      console.error('Respond error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text>Job request not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Job Details</Text>
        <IconButton icon="share-variant" onPress={() => {}} />
      </Surface>

      <ScrollView>
        <View style={styles.content}>
          <Chip icon="briefcase" style={styles.chip}>{job.serviceNeeded}</Chip>
          
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.description}>{job.description}</Text>

          {/* Farmer */}
          <Surface style={styles.farmerCard}>
            <Text style={styles.sectionTitle}>Posted By</Text>
            <View style={styles.farmerRow}>
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={32} color="#999" />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.farmerName}>{job.farmer.name}</Text>
                  {job.farmer.isVerified && (
                    <MaterialCommunityIcons name="check-decagram" size={18} color="#2196F3" />
                  )}
                </View>
                <Text style={{ color: '#999' }}>Farmer</Text>
              </View>
            </View>
          </Surface>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
            <Text>{job.location.taluk}, {job.location.district}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
            <Text>Needed: {new Date(job.dateNeeded).toLocaleDateString()}</Text>
          </View>

          {job.budget && (job.budget.min || job.budget.max) && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="currency-inr" size={20} color="#666" />
              <Text>
                Budget: ₹{job.budget.min || 0} - ₹{job.budget.max || 'Negotiable'}
              </Text>
            </View>
          )}

          <Button
            mode="contained"
            icon="phone"
            onPress={handleRespond}
            style={styles.respondButton}
          >
            Respond to Request
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#262626' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  chip: { alignSelf: 'flex-start', backgroundColor: '#E3F2FD', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#262626', marginBottom: 12 },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 24 },
  farmerCard: { padding: 16, borderRadius: 12, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  farmerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  farmerName: { fontSize: 16, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  respondButton: { backgroundColor: '#2196F3', paddingVertical: 8, marginTop: 24 },
});
