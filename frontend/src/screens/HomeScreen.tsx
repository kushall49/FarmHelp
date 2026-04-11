import React, { useEffect, useState, useRef } from 'react';
import { View, Linking, ScrollView, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Title, Card, Paragraph, ActivityIndicator, Text, Surface, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TopNavigation from '../components/TopNavigation';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { isDarkMode, colors } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Guest');
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    text: { color: colors.text },
    textSecondary: { color: colors.textSecondary },
    card: { backgroundColor: colors.card, borderColor: colors.border },
  };

  useEffect(() => {
    checkLoginStatus();
    fetchWeather();
    animateEntrance();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    const user = await AsyncStorage.getItem('username');
    setIsLoggedIn(!!token);
    setUsername(user || 'Guest');
  };

  const animateEntrance = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  async function fetchWeather() {
    try {
      setWeatherLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
            );
            const data = await response.json();
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
          (error) => fetchDefaultWeather()
        );
      } else {
        fetchDefaultWeather();
      }
    } catch (err) {
      fetchDefaultWeather();
    }
  }

  async function fetchDefaultWeather() {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto'
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
      setWeather({
        temperature: 28, humidity: 65, windSpeed: 12, condition: 'Sunny', location: 'Your Location'
      });
    } finally {
      setWeatherLoading(false);
    }
  }

  function getWeatherCondition(code: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 61: 'Light Rain',
      63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 95: 'Thunderstorm'
    };
    return weatherCodes[code] || 'Clear';
  }

  function getWeatherIcon(condition: string) {
    if (!condition) return { name: 'weather-partly-cloudy', color: '#F59E0B' };
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear')) return { name: 'weather-sunny', color: '#F59E0B' };
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return { name: 'weather-cloudy', color: '#64748B' };
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return { name: 'weather-pouring', color: '#3B82F6' };
    if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return { name: 'weather-lightning', color: '#8B5CF6' };
    if (lowerCondition.includes('fog')) return { name: 'weather-fog', color: '#94A3B8' };
    return { name: 'weather-partly-cloudy', color: '#F59E0B' };
  }

  const features = [
    { title: t('plantAnalyzer'), subtitle: 'AI-powered disease detection', screen: 'PlantAnalyzer', color: '#10B981', iconName: 'leaf', description: t('plantAnalyzerDesc') },
    { title: t('cropSuggestions'), subtitle: 'Smart farming suggestions', screen: 'CropRecommendation', color: '#F59E0B', iconName: 'sprout', description: t('cropSuggestionsDesc') },
    { title: t('aiAssistant'), subtitle: '24/7 expert chatbot', screen: 'Chatbot', color: '#3B82F6', iconName: 'robot-outline', description: t('aiAssistantDesc') },
  ];

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Image source={require('../../assets/background.jpg')} style={styles.fixedBg} resizeMode="cover" />
      <TopNavigation activeTab="Home" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Hero Text Section */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>{t('topNotchPlatform')}</Text>
          </View>

          <Text style={styles.mainTitle}>
            {t('heroTitle')}
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(isLoggedIn ? 'PlantAnalyzer' : 'Login')}
          >
            <Text style={styles.heroButtonText}>{t('getStarted')}</Text>
            <Icon name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

            <View style={styles.quoteContainer}>
              <Icon name="format-quote-open" size={28} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.quoteText}>
                {"\"The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings.\""}
              </Text>
              <Text style={styles.quoteAuthor}>— Masanobu Fukuoka</Text>
            </View>
          </Animated.View>

          {/* Wrapper for features - uses dark mode */}
          <View style={[styles.featuresSectionWrapper, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
            {/* Weather Widget */}
            <View style={styles.weatherSection}>
              <Surface style={[styles.weatherCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' }]} elevation={2}>
                {weatherLoading ? (
                  <ActivityIndicator size="small" color="#10B981" />
                ) : weather ? (
                <View style={styles.weatherRow}>
                  <View style={styles.weatherInfo}>
                    <View style={[styles.weatherIconContainer, { backgroundColor: (getWeatherIcon(weather.condition).color || "#000") + "15" }]}>
                      {(function() { const info = getWeatherIcon(weather.condition); return <Icon name={info.name} size={32} color={info.color} />; })()}
                    </View>
                    <View>
                      <Text style={[styles.weatherTemp, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>{weather.temperature}°C {weather.condition}</Text>
                      <Text style={[styles.weatherLocationText, { color: isDarkMode ? '#A0A0A0' : '#6B7280' }]}>
                        <Icon name="map-marker" size={14} color={isDarkMode ? '#A0A0A0' : '#6B7280'} /> {weather.location}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.weatherStatsRight}>
                    <View style={[styles.weatherStatBadge, { backgroundColor: isDarkMode ? '#2D2D2D' : '#F1F5F9' }]}>
                      <Icon name="water-percent" size={18} color="#3B82F6" />
                      <Text style={[styles.weatherSubtext, { color: isDarkMode ? '#FFFFFF' : '#475569' }]}>{weather.humidity}%</Text>
                    </View>
                    <View style={[styles.weatherStatBadge, { backgroundColor: isDarkMode ? '#2D2D2D' : '#F1F5F9' }]}>
                      <Icon name="weather-windy" size={18} color="#64748B" />
                      <Text style={[styles.weatherSubtext, { color: isDarkMode ? '#FFFFFF' : '#475569' }]}>{weather.windSpeed} km/h</Text>
                    </View>
                    <TouchableOpacity onPress={fetchWeather} style={styles.refreshButton}>
                      <Icon name="refresh" size={20} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </Surface>
          </View>

          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>{t('exploreFeatures')}</Text>

          <View style={styles.featureGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onHoverIn={() => setHoveredFeatureIndex(index)}
                onHoverOut={() => setHoveredFeatureIndex(null)}
                onPress={() => navigation.navigate(feature.screen)}
                style={[
                  styles.featureCard,
                  { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
                  hoveredFeatureIndex === index && styles.featureCardHover,
                ]}
              >
                <View style={[styles.featureIconBox, { backgroundColor: feature.color + '15' }]}>
                  <Icon name={feature.iconName} size={32} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: isDarkMode ? '#A0A0A0' : '#64748B' }]}>{feature.description}</Text>
                <View style={styles.featureActionRow}>
                  <Text
                    style={[
                      styles.featureActionText,
                      { color: feature.color },
                      hoveredFeatureIndex === index && styles.featureActionTextHover
                    ]}
                  >
                    {t('tryNow')}
                  </Text>
                  <Icon name="arrow-right" size={16} color={feature.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.modernFooterWrapper, { backgroundColor: isDarkMode ? '#1A1A1A' : '#111827' }]}>
            <View style={styles.footerBrandSection}>
              <Text style={styles.footerBrand}>Kushal</Text>
              <Text style={styles.footerDetailsText}>
                lkushal2006@gmail.com{"\n"}+91 8660179391
              </Text>
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialIcon} activeOpacity={0.8}>
                  <Icon name="instagram" size={18} color="#af42f5" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} activeOpacity={0.8} onPress={() => Linking.openURL("https://www.linkedin.com/in/kushal-l-a39246326/")}>
                  <Icon name="linkedin" size={18} color="#af42f5" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} activeOpacity={0.8} onPress={() => Linking.openURL("https://x.com/D8932857095570")}>
                  <Icon name="twitter" size={18} color="#af42f5" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} activeOpacity={0.8}>
                  <Icon name="facebook" size={18} color="#af42f5" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.copyrightSection}>
              <View style={styles.copyrightDivider} />
              <Text style={styles.copyrightText}>
                © {new Date().getFullYear()} FarmHelp. All Rights Reserved.
              </Text>
              <View style={styles.legalLinks}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
                <Text style={styles.legalDot}>•</Text>
                <Text style={styles.legalLink}>Terms of Service</Text>
                <Text style={styles.legalDot}>•</Text>
                <Text style={styles.legalLink}>Contact</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedBg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%", zIndex: -1 },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a'
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 140,
    paddingHorizontal: 20,
    paddingBottom: 220,
    backgroundColor: 'transparent',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
    lineHeight: 56,
    letterSpacing: -1,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  quoteContainer: {
    marginTop: 48,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  quoteText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 28,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  quoteAuthor: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuresSectionWrapper: {
    padding: 40,
    backgroundColor: 'rgba(255,255,255,1)',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    flex: 1,
    minHeight: 800,
  },
  weatherSection: {
    marginBottom: 48,
    alignItems: 'center',
  },
  weatherCard: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    maxWidth: 720,
    width: '100%',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  weatherTemp: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  weatherLocationText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  weatherStatsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  weatherSubtext: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: -0.5,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 32,
  },
  featureCard: {
    width: width > 768 ? 340 : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
    transitionDuration: '180ms',
  } as any,
  featureCardHover: {
    transform: [{ translateY: -6 }, { scale: 1.01 }],
    shadowOpacity: 0.14,
    shadowRadius: 38,
    elevation: 10,
  },
  featureIconBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 26,
    color: '#64748B',
    flex: 1,
    marginBottom: 24,
  },
  featureActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  featureActionText: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
    transitionDuration: '180ms',
  } as any,
  featureActionTextHover: {
    textDecorationLine: 'underline',
  },
  aboutSection: {
    marginTop: 64,
  },
  aboutCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 32,
    padding: 40,
    flexDirection: width > 768 ? 'row' : 'column',
    alignItems: 'center',
    gap: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aboutIconBox: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width > 768 ? 0 : 16,
  },
  aboutContent: {
    flex: 1,
  },
  aboutText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#475569',
    textAlign: width > 768 ? 'left' : 'center',
  },
  contactSection: {
    marginTop: 64,
    marginBottom: 40,
  },
  contactCard: {
    width: width > 768 ? 260 : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  contactDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  modernFooterWrapper: {
    marginTop: 40,
    backgroundColor: '#FAF9F6',
    paddingTop: 30,
    paddingBottom: 40,
    borderRadius: 32,
    paddingHorizontal: 20,
  },
  footerBrandSection: {
    marginBottom: 30,
  },
  footerBrand: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    marginBottom: 10,
  },
  footerDetailsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  socialRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f6ebff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  footerCol: {
    width: '30%',
    marginBottom: 20,
  },
  footerColTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  footerLink: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  copyrightDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  copyrightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  copyrightSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legalLink: {
    fontSize: 13,
    color: '#9333EA',
    fontWeight: '500',
  },
  legalDot: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 8,
  }
});

