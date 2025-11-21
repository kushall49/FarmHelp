import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Surface, List, Button, Avatar, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeGoBack } from '../navigation/AppNavigator';

export default function Profile({ navigation }: any) {
  // ✅ NAVIGATION FIX: Use safe navigation with deep link fallback
  const handleGoBack = useSafeGoBack();
  const [user] = useState({ name: 'Farmer', phone: '+91 9876543210', location: 'Karnataka, India' });

  async function logout() {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  }

  const stats = [
    { label: 'Plants Analyzed', value: '12', icon: '🔬', color: '#4CAF50' },
    { label: 'Crops Recommended', value: '8', icon: '🌾', color: '#FF9800' },
    { label: 'Chats', value: '24', icon: '💬', color: '#2196F3' },
  ];

  const menuItems = [
    { title: 'Analysis History', icon: 'history', subtitle: 'View past plant analyses', screen: null },
    { title: 'Saved Crops', icon: 'bookmark', subtitle: 'Your favorite recommendations', screen: null },
    { title: 'Settings', icon: 'cog', subtitle: 'App preferences', screen: null },
    { title: 'Help & Support', icon: 'help-circle', subtitle: 'FAQs and contact us', screen: null },
    { title: 'About FarmMate', icon: 'information', subtitle: 'Version 1.0.0', screen: null },
  ];

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.profileSection}>
          <Avatar.Text size={80} label={user.name[0]} style={styles.avatar} />
          <Text variant="headlineMedium" style={styles.name}>{user.name}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
          <Text style={styles.location}>📍 {user.location}</Text>
        </View>
      </Surface>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <Card key={index} style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Card style={styles.menuCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.menuTitle}>Account</Text>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <List.Item
                title={item.title}
                description={item.subtitle}
                left={props => <List.Icon {...props} icon={item.icon} color="#4CAF50" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => item.screen && navigation.navigate(item.screen)}
                style={styles.menuItem}
              />
              {index < menuItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={logout}
        style={styles.logoutButton}
        buttonColor="#F44336"
        icon="logout"
      >
        Logout
      </Button>

      <Text style={styles.footer}>Made with 💚 for Indian Farmers</Text>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 24, margin: 16, borderRadius: 20, backgroundColor: '#4CAF50', elevation: 4 },
  profileSection: { alignItems: 'center' },
  avatar: { backgroundColor: '#2E7D32', marginBottom: 16 },
  name: { fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  phone: { fontSize: 16, color: '#E8F5E9', marginBottom: 4 },
  location: { fontSize: 14, color: '#C8E6C9' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
  statCard: { flex: 1, marginHorizontal: 4, borderRadius: 12, elevation: 2 },
  statContent: { alignItems: 'center', paddingVertical: 8 },
  statIcon: { fontSize: 28, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#64748B', textAlign: 'center' },
  menuCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, elevation: 2 },
  menuTitle: { fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  menuItem: { paddingVertical: 4 },
  logoutButton: { marginHorizontal: 16, marginBottom: 16 },
  footer: { textAlign: 'center', color: '#64748B', fontSize: 13, marginBottom: 8 },
});
