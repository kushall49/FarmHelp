import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import { useSafeGoBack } from '../navigation/AppNavigator';

export default function RateProviderScreen({ route, navigation }: any) {
  // ✅ NAVIGATION FIX: Use safe navigation with deep link fallback
  const handleGoBack = useSafeGoBack();
  const { providerId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await api.rateProvider(providerId, { rating, comment });
      Alert.alert('Success!', 'Rating submitted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Rate provider error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Rate Provider</Text>
        <View style={{ width: 40 }} />
      </Surface>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>How was your experience?</Text>
        
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <IconButton
              key={star}
              icon={star <= rating ? 'star' : 'star-outline'}
              size={40}
              iconColor={star <= rating ? '#FFC107' : '#ccc'}
              onPress={() => setRating(star)}
            />
          ))}
        </View>

        <Text style={styles.label}>Comments (Optional)</Text>
        <TextInput
          mode="outlined"
          placeholder="Share your experience with this provider..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        >
          Submit Rating
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#262626' },
  content: { padding: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 16, marginTop: 8 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  input: { backgroundColor: '#fff', marginBottom: 24 },
  submitButton: { backgroundColor: '#4CAF50', paddingVertical: 8 },
});
