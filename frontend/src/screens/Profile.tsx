import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Surface, List, Button, Avatar, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeGoBack } from '../navigation/AppNavigator';
import TopNavigation from '../components/TopNavigation';

export default function Profile({ navigation }: any) {
  const handleGoBack = useSafeGoBack();
  const [username, setUsername] = useState('User');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const storedName = await AsyncStorage.getItem('username');
    if (storedName) {
      setUsername(storedName);
    }
  };

  async function logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('username');
    navigation.replace('Login');
  }

  const menuItems = [
    { title: 'Settings', icon: 'cog', subtitle: 'App preferences', screen: null },
    { title: 'Help & Support', icon: 'help-circle', subtitle: 'FAQs and contact us', screen: null },
    { title: 'About FarmMate', icon: 'information', subtitle: 'Version 1.0.0', screen: null },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <TopNavigation activeTab="Profile" />
      <ScrollView style={styles.container}>
        <Surface style={styles.header}>
          <View style={styles.profileSection}>
            <Avatar.Text size={80} label={username.charAt(0).toUpperCase()} style={styles.avatar} />
            <Text variant="headlineMedium" style={styles.name}>{username}</Text>
          </View>
        </Surface>

        <Card style={styles.menuCard}>
          <Card.Content>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <List.Item
                  title={item.title}
                  description={item.subtitle}
                  titleStyle={styles.menuTitle}
                  left={props => <List.Icon {...props} icon={item.icon} color="#4CAF50" />}
                  right={props => <List.Icon {...props} icon="chevron-right" color="#CBD5E1" />}
                  onPress={() => {}}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 4,
  },
  profileSection: { alignItems: 'center' },
  avatar: { backgroundColor: '#388E3C', marginBottom: 12 },
  name: { color: 'white', fontWeight: 'bold' },
  menuCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, elevation: 2 },
  menuTitle: { fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  menuItem: { paddingVertical: 4 },
  logoutButton: { marginHorizontal: 16, marginBottom: 16 },
  footer: { textAlign: 'center', color: '#64748B', fontSize: 13, marginBottom: 8 },
});
