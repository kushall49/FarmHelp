import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, Surface, Chip, ActivityIndicator } from 'react-native-paper';
import api from '../services/api';

export default function CropRecommendation() {
  const [soil, setSoil] = useState('');
  const [season, setSeason] = useState('');
  const [temp, setTemp] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const soilTypes = ['Loam', 'Clay', 'Sandy', 'Silt', 'Red', 'Black'];
  const seasons = ['Summer', 'Winter', 'Monsoon', 'Spring'];

  async function getCrops() {
    if (!soil || !season || !temp) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.getCrops({ soil: soil.toLowerCase(), season: season.toLowerCase(), temp: parseFloat(temp) });
      setResults(res.data.results || res.data || []);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to fetch recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>🌾 Crop Recommendations</Text>
        <Text style={styles.subtitle}>Get personalized crop suggestions based on your conditions</Text>
      </Surface>

      <Card style={styles.inputCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.inputTitle}>Enter Your Farm Details</Text>
          
          <TextInput
            label="🌍 Soil Type"
            value={soil}
            onChangeText={setSoil}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Loam, Clay, Sandy"
            activeOutlineColor="#4CAF50"
          />

          <View style={styles.chipContainer}>
            {soilTypes.map((type) => (
              <Chip
                key={type}
                mode={soil.toLowerCase() === type.toLowerCase() ? 'flat' : 'outlined'}
                selected={soil.toLowerCase() === type.toLowerCase()}
                onPress={() => setSoil(type)}
                style={styles.chip}
                selectedColor="#4CAF50"
              >
                {type}
              </Chip>
            ))}
          </View>

          <TextInput
            label="🌦️ Season"
            value={season}
            onChangeText={setSeason}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Summer, Winter, Monsoon"
            activeOutlineColor="#4CAF50"
          />

          <View style={styles.chipContainer}>
            {seasons.map((s) => (
              <Chip
                key={s}
                mode={season.toLowerCase() === s.toLowerCase() ? 'flat' : 'outlined'}
                selected={season.toLowerCase() === s.toLowerCase()}
                onPress={() => setSeason(s)}
                style={styles.chip}
                selectedColor="#2196F3"
              >
                {s}
              </Chip>
            ))}
          </View>

          <TextInput
            label="🌡️ Temperature (°C)"
            value={temp}
            onChangeText={setTemp}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            placeholder="e.g., 25"
            activeOutlineColor="#4CAF50"
          />

          <Button 
            mode="contained" 
            onPress={getCrops} 
            style={styles.button}
            buttonColor="#4CAF50"
            icon="magnify"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Get Recommendations'}
          </Button>
        </Card.Content>
      </Card>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding best crops for your farm...</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <>
          <Text variant="titleLarge" style={styles.resultsTitle}>
            ✅ Found {results.length} Recommended Crop{results.length > 1 ? 's' : ''}
          </Text>
          {results.map((crop: any, index: number) => (
            <Card key={crop._id || index} style={styles.cropCard}>
              <Card.Content>
                <View style={styles.cropHeader}>
                  <Text variant="titleLarge" style={styles.cropName}>🌿 {crop.name}</Text>
                  <Surface style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={styles.badgeText}>#{index + 1}</Text>
                  </Surface>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>🌍 Suitable Soils:</Text>
                  <Text style={styles.value}>{crop.suitableSoils?.join(', ') || crop.soilTypes?.join(', ') || 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>🌦️ Best Seasons:</Text>
                  <Text style={styles.value}>{crop.seasons?.join(', ') || 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>🌡️ Temperature Range:</Text>
                  <Text style={styles.value}>{crop.minTemp}°C - {crop.maxTemp}°C</Text>
                </View>

                {crop.waterRequirement && (
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>💧 Water Need:</Text>
                    <Text style={styles.value}>{crop.waterRequirement}</Text>
                  </View>
                )}

                {crop.yieldPotential && (
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>📈 Yield Potential:</Text>
                    <Text style={styles.value}>{crop.yieldPotential}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {!loading && results.length === 0 && soil && season && temp && (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>📍 No crops found matching your criteria</Text>
            <Text style={styles.emptySubtext}>Try adjusting your soil type, season, or temperature</Text>
          </Card.Content>
        </Card>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 24, margin: 16, borderRadius: 20, backgroundColor: '#fff', elevation: 2 },
  title: { fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B' },
  inputCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, elevation: 3 },
  inputTitle: { fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  input: { marginBottom: 12 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  chip: { marginRight: 8, marginBottom: 8 },
  button: { marginTop: 8 },
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748B' },
  resultsTitle: { fontWeight: 'bold', marginHorizontal: 16, marginBottom: 16, color: '#1E293B' },
  cropCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, elevation: 2, backgroundColor: '#fff' },
  cropHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cropName: { fontWeight: 'bold', color: '#1E293B', flex: 1 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, elevation: 0 },
  badgeText: { fontSize: 12, color: '#4CAF50', fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', width: 140 },
  value: { fontSize: 14, color: '#475569', flex: 1 },
  emptyCard: { marginHorizontal: 16, marginTop: 20, borderRadius: 16, backgroundColor: '#FFF9E6' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#F59E0B', textAlign: 'center', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#92400E', textAlign: 'center' },
});
