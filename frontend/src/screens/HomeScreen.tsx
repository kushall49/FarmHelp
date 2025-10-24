import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, ImageBackground } from 'react-native';
import { Title, Card, Paragraph, ActivityIndicator, Text, Surface, Button, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Guest');
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    checkLoginStatus();
    fetchCrops();
    fetchWeather();
    animateEntrance();
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
    navigation.navigate('Login');
  };

  const animateEntrance = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  async function fetchCrops() {
    try {
      const res = await api.getCrops({ soil: 'loam', season: 'summer', temp: 25 });
      setCrops(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWeather() {
    try {
      setWeatherLoading(true);
      // Using Open-Meteo API (free, no API key required)
      // Get user's location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Fetch weather data
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
            );
            const data = await response.json();
            
            // Fetch location name using reverse geocoding
            const locationResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const locationData = await locationResponse.json();
            
            setWeather({
              temperature: Math.round(data.current.temperature_2m),
              humidity: data.current.relative_humidity_2m,
              windSpeed: Math.round(data.current.wind_speed_10m),
              weatherCode: data.current.weather_code,
              condition: getWeatherCondition(data.current.weather_code),
              location: locationData.city || locationData.locality || 'Your Location'
            });
            setWeatherLoading(false);
          },
          (error) => {
            console.error('Location error:', error);
            // Fallback to default location (Bangalore)
            fetchDefaultWeather();
          }
        );
      } else {
        // Fallback if geolocation not supported
        fetchDefaultWeather();
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      fetchDefaultWeather();
    }
  }

  async function fetchDefaultWeather() {
    try {
      // Default to Bangalore coordinates
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Kolkata`
      );
      const data = await response.json();
      
      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
        condition: getWeatherCondition(data.current.weather_code),
        location: 'Bangalore, KA'
      });
    } catch (err) {
      console.error('Default weather error:', err);
      // Final fallback with static data
      setWeather({
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        weatherCode: 0,
        condition: 'Sunny',
        location: 'Your Location'
      });
    } finally {
      setWeatherLoading(false);
    }
  }

  function getWeatherCondition(code: number): string {
    // WMO Weather interpretation codes
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Showers',
      81: 'Showers',
      82: 'Heavy Showers',
      85: 'Light Snow Showers',
      86: 'Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Heavy Thunderstorm'
    };
    return weatherCodes[code] || 'Clear';
  }

  function getWeatherEmoji(condition: string): string {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return '☀️';
    if (lowerCondition.includes('cloud')) return '⛅';
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) return '🌧️';
    if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return '⛈️';
    if (lowerCondition.includes('snow')) return '❄️';
    if (lowerCondition.includes('fog')) return '🌫️';
    return '🌤️';
  }

  const features = [
    { 
      title: 'Plant Health Analyzer', 
      subtitle: 'AI-powered disease detection', 
      screen: 'PlantAnalyzer', 
      color: '#4CAF50',
      icon: '🔬',
      description: 'Upload plant photos and get instant diagnosis with treatment recommendations'
    },
    { 
      title: 'Crop Recommendations', 
      subtitle: 'Smart farming suggestions', 
      screen: 'CropRecommendation', 
      color: '#FF9800',
      icon: '🌾',
      description: 'Get personalized crop suggestions based on soil, season, and climate data'
    },
    { 
      title: 'Services Marketplace', 
      subtitle: 'Find services & equipment', 
      screen: 'ServicesHome', 
      color: '#FFC107',
      icon: '🚜',
      description: 'Rent tractors, find labor, and hire farming services in your area'
    },
    { 
      title: 'Farm Community', 
      subtitle: 'Connect with farmers', 
      screen: 'Community', 
      color: '#10B981',
      icon: '🌾',
      description: 'Share knowledge, ask questions, and learn from fellow farmers'
    },
    { 
      title: 'AI Farming Assistant', 
      subtitle: '24/7 expert chatbot', 
      screen: 'Chatbot', 
      color: '#2196F3',
      icon: '🤖',
      description: 'Chat with our AI expert for farming advice, pest control, and best practices'
    },
    { 
      title: 'Profile & Analytics', 
      subtitle: 'Track your progress', 
      screen: 'Profile', 
      color: '#9C27B0',
      icon: '�',
      description: 'View your farming analytics, saved crops, and chat history'
    },
  ];

  return (
    <View style={styles.container}>
      {/* Background Image with Overlay */}
      <ImageBackground 
        source={require('../../assets/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Semi-transparent overlay for better text visibility */}
        <View style={styles.overlay} />
        
        {/* Modern Floating Navigation Bar */}
        <Surface style={styles.navbar}>
          <View style={styles.navContent}>
            <View style={styles.navLeft}>
              <Text style={styles.logo}>🌱 FarmMate</Text>
            </View>
            <View style={styles.navRight}>
              {isLoggedIn ? (
                <>
                <Text style={styles.welcomeText}>Hi, {username}</Text>
                <Button 
                  mode="contained" 
                  onPress={handleLogout}
                  style={styles.logoutButton}
                  labelStyle={styles.buttonLabel}
                  icon="logout"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
                labelStyle={styles.buttonLabel}
                icon="login"
              >
                Login
              </Button>
            )}
          </View>
        </View>
      </Surface>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim }]}>
          <View style={styles.heroContent}>
            <Text style={styles.heroSubtitle}>Welcome to</Text>
            <Title style={styles.heroTitle}>Smart Farming Platform</Title>
            <Paragraph style={styles.heroDescription}>
              Empowering farmers with AI-driven insights for better crop management, 
              disease detection, and sustainable agriculture practices.
            </Paragraph>
            <View style={styles.heroButtons}>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate(isLoggedIn ? 'PlantAnalyzer' : 'Login')}
                style={styles.primaryButton}
                labelStyle={styles.primaryButtonLabel}
                icon="leaf"
              >
                Get Started
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Chatbot')}
                style={styles.secondaryButton}
                labelStyle={styles.secondaryButtonLabel}
              >
                Learn More
              </Button>
            </View>
          </View>
          <View style={styles.heroImage}>
            <Text style={styles.heroEmoji}>🚜</Text>
          </View>
        </Animated.View>

        {/* Real-Time Weather Widget */}
        <View style={styles.weatherSection}>
          <Surface style={styles.weatherCard} elevation={4}>
            {weatherLoading ? (
              <View style={styles.weatherLoading}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.weatherLoadingText}>Loading weather...</Text>
              </View>
            ) : weather ? (
              <>
                <View style={styles.weatherHeader}>
                  <Text style={styles.weatherEmoji}>{getWeatherEmoji(weather.condition)}</Text>
                  <View style={styles.weatherMain}>
                    <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
                    <Text style={styles.weatherCondition}>{weather.condition}</Text>
                  </View>
                </View>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetailItem}>
                    <Text style={styles.weatherDetailIcon}>💧</Text>
                    <Text style={styles.weatherDetailLabel}>Humidity</Text>
                    <Text style={styles.weatherDetailValue}>{weather.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Text style={styles.weatherDetailIcon}>💨</Text>
                    <Text style={styles.weatherDetailLabel}>Wind</Text>
                    <Text style={styles.weatherDetailValue}>{weather.windSpeed} km/h</Text>
                  </View>
                </View>
                <View style={styles.weatherLocation}>
                  <Text style={styles.weatherLocationIcon}>📍</Text>
                  <Text style={styles.weatherLocationText}>{weather.location}</Text>
                  <TouchableOpacity onPress={fetchWeather} style={styles.weatherRefresh}>
                    <Text style={styles.weatherRefreshIcon}>🔄</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.weatherError}>
                <Text style={styles.weatherErrorText}>Unable to load weather</Text>
                <Button mode="outlined" onPress={fetchWeather} icon="refresh">
                  Retry
                </Button>
              </View>
            )}
          </Surface>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>FEATURES</Text>
          <Title style={styles.sectionTitle}>Everything You Need</Title>
          <Paragraph style={styles.sectionDescription}>
            Comprehensive tools to help you make better farming decisions
          </Paragraph>

          <View style={styles.featureGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity 
                key={index} 
                activeOpacity={0.8}
                onPress={() => {
                  console.log('Navigating to:', feature.screen);
                  navigation.navigate(feature.screen);
                }}
                style={styles.featureCard}
              >
                <View style={[styles.featureIconBox, { backgroundColor: feature.color }]}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                <View style={styles.featureArrow}>
                  <Text style={{ fontSize: 20, color: feature.color }}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Active Farmers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Crops Analyzed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Accuracy Rate</Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Card style={styles.ctaCard}>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaEmoji}>🚀</Text>
              <Title style={styles.ctaTitle}>Ready to Transform Your Farming?</Title>
              <Paragraph style={styles.ctaDescription}>
                Join thousands of farmers already using FarmMate to increase their yields and reduce losses.
              </Paragraph>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate(isLoggedIn ? 'PlantAnalyzer' : 'Signup')}
                style={styles.ctaButton}
                labelStyle={styles.ctaButtonLabel}
              >
                {isLoggedIn ? 'Start Analyzing' : 'Sign Up Free'}
              </Button>
            </View>
          </Card>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerSection}>
              <Text style={styles.footerLogo}>🌱 FarmMate</Text>
              <Text style={styles.footerText}>
                AI-powered farming assistant for modern agriculture
              </Text>
            </View>
            <View style={styles.footerSection}>
              <Text style={styles.footerHeading}>Quick Links</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PlantAnalyzer')}>
                <Text style={styles.footerLink}>Plant Analyzer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('CropRecommendation')}>
                <Text style={styles.footerLink}>Crop Guide</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Chatbot')}>
                <Text style={styles.footerLink}>AI Assistant</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerSection}>
              <Text style={styles.footerHeading}>Account</Text>
              {isLoggedIn ? (
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <Text style={styles.footerLink}>My Profile</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.footerLink}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.footerLink}>Sign Up</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          <View style={styles.footerBottom}>
            <Text style={styles.copyright}>© 2025 FarmMate. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff'
  },
  
  // Background Image Styles
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // White overlay for better readability
    zIndex: 1,
  },
  
  // Modern Floating Navbar - Black with rounded design
  navbar: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 1001, // Above overlay
    backgroundColor: '#1E293B',
    borderRadius: 50,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 0.5,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 8,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 4,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 25,
    paddingHorizontal: 4,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  scrollView: {
    flex: 1,
    zIndex: 2, // Above overlay
  },
  
  // Hero Section
  hero: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 80,
    backgroundColor: '#F8FAF9',
  },
  heroContent: {
    marginBottom: 40,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontSize: 18,
    color: '#1E293B',
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 600,
    fontWeight: '500',
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  heroImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 120,
  },
  
  // Weather Widget Styles
  weatherSection: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: '#ffffff',
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  weatherLoading: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  weatherLoadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherEmoji: {
    fontSize: 64,
    marginRight: 20,
  },
  weatherMain: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 52,
  },
  weatherCondition: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '500',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: 16,
  },
  weatherDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  weatherDetailIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weatherDetailValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  weatherLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherLocationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  weatherLocationText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  weatherRefresh: {
    marginLeft: 12,
    padding: 4,
  },
  weatherRefreshIcon: {
    fontSize: 20,
  },
  weatherError: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  weatherErrorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 12,
    fontWeight: '500',
  },
  
  // Features Section
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#ffffff',
  },
  sectionLabel: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 17,
    color: '#1E293B',
    marginBottom: 40,
    lineHeight: 26,
    fontWeight: '500',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  featureIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 12,
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  featureArrow: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  
  // Stats Section
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#4CAF50',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  // CTA Section
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#ffffff',
  },
  ctaCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
  },
  ctaContent: {
    padding: 50,
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
  },
  ctaEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 17,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 8,
  },
  ctaButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Footer
  footer: {
    backgroundColor: '#1E293B',
    paddingTop: 80,
    paddingBottom: 50,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 50,
  },
  footerSection: {
    flex: 1,
    marginHorizontal: 10,
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
  footerHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
    lineHeight: 20,
  },
  footerBottom: {
    paddingHorizontal: 20,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  copyright: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
