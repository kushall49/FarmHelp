import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useService } from '../../../context/ServiceContext';
import { serviceApi } from '../../../services/serviceApi';

const { width } = Dimensions.get('window');

const JobCompleteScreen = () => {
  const navigation = useNavigation();
  const { currentRequest, resetServiceState } = useService();
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentRequest?._id) return;
    setSubmitting(true);
    try {
      await serviceApi.rateRequest(currentRequest._id, rating);
    } catch (error) {
      console.log('Rating error:', error);
    } finally {
      resetServiceState();
      navigation.navigate('ServicesHome');
    }
  };

  const operatorInfo = currentRequest?.operatorId || {};

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.topAccent} />
        
        <View style={styles.iconContainer}>
          <Text style={styles.checkIcon}>✅</Text>
        </View>

        <Text style={styles.title}>Job Completed!</Text>
        <Text style={styles.subtitle}>Thank you for using FarmMate Services.</Text>

        <View style={styles.detailsBox}>
          <Text style={styles.detailLabel}>Operator</Text>
          <Text style={styles.detailValue}>{operatorInfo.name || 'Operator'}</Text>
          <View style={styles.divider} />
          <Text style={styles.detailLabel}>Equipment</Text>
          <Text style={styles.detailValueHighlight}>{operatorInfo.equipmentType || 'Equipment'}</Text>
        </View>

        <Text style={styles.ratingTitle}>Rate your experience</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={[styles.star, star <= rating ? styles.starFilled : styles.starEmpty]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, (rating === 0 || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit & Home'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: width - 40, backgroundColor: '#2b2b40', borderRadius: 25, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15, position: 'relative', overflow: 'hidden' },
  topAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 8, backgroundColor: '#52B788' },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(82, 183, 136, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  checkIcon: { fontSize: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { color: '#888', marginBottom: 30 },
  detailsBox: { width: '100%', backgroundColor: '#1A1A2E', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
  detailLabel: { color: '#888', fontSize: 14, marginBottom: 4 },
  detailValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  detailValueHighlight: { color: '#52B788', fontSize: 18, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  ratingTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30 },
  star: { fontSize: 40 },
  starFilled: { color: '#fbbf24' },
  starEmpty: { color: '#444' },
  submitBtn: { width: '100%', backgroundColor: '#52B788', paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#444', opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default JobCompleteScreen;