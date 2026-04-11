import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

interface TopNavigationProps {
  activeTab?: 'Home' | 'Community' | 'Profile';
}

export default function TopNavigation({ activeTab = 'Home' }: TopNavigationProps) {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Guest');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    const user = await AsyncStorage.getItem('username');
    setIsLoggedIn(!!token);
    setUsername(user || 'Guest');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('email');
    setIsLoggedIn(false);
    // Reset to auth stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={[styles.modernNavbar, activeTab !== 'Home' && styles.solidBackground]}>
      <View style={styles.navLeft}>
        <Icon name="sprout" size={28} color="#10B981" />
        <Text style={styles.brandLogo}>FarmMate</Text>
      </View>

      {width > 768 && (
        <View style={styles.navCenterPill}>
          <TouchableOpacity
            style={[styles.navItemContainer, activeTab === 'Home' && styles.navItemContainerActive]}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Icon name="home" size={24} color={activeTab === 'Home' ? "#10B981" : "#6B7280"} style={styles.navIcon} />
            <Text style={[styles.navItem, activeTab === 'Home' && styles.navTextActive]}>{t('home')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItemContainer, activeTab === 'Community' && styles.navItemContainerActive]}
            onPress={() => navigation.navigate('CommunityTab')}
          >
            <Icon name="account-group-outline" size={24} color={activeTab === 'Community' ? "#10B981" : "#6B7280"} style={styles.navIcon} />
            <Text style={[styles.navItem, activeTab === 'Community' && styles.navTextActive]}>{t('community')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItemContainer, activeTab === 'Profile' && styles.navItemContainerActive]}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Icon name="account-outline" size={24} color={activeTab === 'Profile' ? "#10B981" : "#6B7280"} style={styles.navIcon} />
            <Text style={[styles.navItem, activeTab === 'Profile' && styles.navTextActive]}>{t('profile')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.navRight}>
        {isLoggedIn ? (
          <>
            <Text style={styles.navLinkText}>Hi, {username}</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.navButtonOutline}>
              <Text style={styles.navButtonOutlineText}>{t('logout')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.navLinkText}>{t('login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.navButtonOutline}>
              <Text style={styles.navButtonOutlineText}>{t('register')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modernNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  solidBackground: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginLeft: 10,
    letterSpacing: -0.5,
  },
  navCenterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  navItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginHorizontal: 4,
  },
  navItemContainerActive: {
    backgroundColor: '#F3F4F6',
    borderRadius: 30,
  },
  navIcon: {
    marginRight: 8,
  },
  navItem: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
  navTextActive: {
    color: '#10B981',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navLinkText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  navButtonOutline: {
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  navButtonOutlineText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
});
