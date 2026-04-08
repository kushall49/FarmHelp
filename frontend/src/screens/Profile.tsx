import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Text, Card, Surface, List, Button, Avatar, Divider, Switch, Menu } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeGoBack } from '../navigation/AppNavigator';
import TopNavigation from '../components/TopNavigation';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, languageNames, Language } from '../context/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Profile({ navigation }: any) {
  const handleGoBack = useSafeGoBack();
  const [username, setUsername] = useState('User');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();

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

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageMenuVisible(false);
  };

  const menuItems = [
    { title: t('settings'), icon: 'cog', subtitle: 'App preferences', screen: null },
    { title: t('helpSupport'), icon: 'help-circle', subtitle: 'FAQs and contact us', screen: null },
    { title: t('aboutApp'), icon: 'information', subtitle: 'Version 1.0.0', screen: null },
  ];

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <TopNavigation activeTab="Profile" />
      <ScrollView style={styles.container}>
        <Surface style={[styles.header, { backgroundColor: colors.headerBg }]}>
          <View style={styles.profileSection}>
            <Avatar.Text size={80} label={username.charAt(0).toUpperCase()} style={styles.avatar} />
            <Text variant="headlineMedium" style={styles.name}>{username}</Text>
          </View>
        </Surface>

        <Card style={[styles.menuCard, { backgroundColor: colors.card }]}>
          <Card.Content>
            {/* Settings Section */}
            <List.Item
              title={t('settings')}
              description="App preferences"
              titleStyle={[styles.menuTitle, { color: colors.text }]}
              descriptionStyle={{ color: colors.textSecondary }}
              left={props => <List.Icon {...props} icon="cog" color={colors.primary} />}
              right={props => <List.Icon {...props} icon={expandedSection === 'settings' ? "chevron-up" : "chevron-down"} color={colors.textSecondary} />}
              onPress={() => toggleSection('settings')}
              style={styles.menuItem}
            />
            {expandedSection === 'settings' && (
              <View style={[styles.expandedContent, { backgroundColor: colors.expandedBg }]}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{t('pushNotifications')}</Text>
                    <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Receive alerts for plant health, weather</Text>
                  </View>
                  <Switch value={notifications} onValueChange={setNotifications} color={colors.primary} />
                </View>
                <Divider style={[styles.settingDivider, { backgroundColor: colors.border }]} />
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{t('darkMode')}</Text>
                    <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Switch to dark theme</Text>
                  </View>
                  <Switch value={isDarkMode} onValueChange={toggleDarkMode} color={colors.primary} />
                </View>
                <Divider style={[styles.settingDivider, { backgroundColor: colors.border }]} />
                
                {/* Language Selector */}
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{t('language')}</Text>
                    <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{languageNames[language]}</Text>
                  </View>
                  <Menu
                    visible={languageMenuVisible}
                    onDismiss={() => setLanguageMenuVisible(false)}
                    anchor={
                      <TouchableOpacity 
                        style={[styles.languageButton, { backgroundColor: colors.expandedBg, borderColor: colors.border }]}
                        onPress={() => setLanguageMenuVisible(true)}
                      >
                        <Text style={{ color: colors.text }}>{languageNames[language].split(' ')[0]}</Text>
                        <Icon name="chevron-down" size={18} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    }
                    contentStyle={{ backgroundColor: colors.card }}
                  >
                    <Menu.Item 
                      onPress={() => handleLanguageSelect('en')} 
                      title="English"
                      titleStyle={{ color: colors.text }}
                      leadingIcon={language === 'en' ? 'check' : undefined}
                    />
                    <Menu.Item 
                      onPress={() => handleLanguageSelect('hi')} 
                      title="हिंदी (Hindi)"
                      titleStyle={{ color: colors.text }}
                      leadingIcon={language === 'hi' ? 'check' : undefined}
                    />
                    <Menu.Item 
                      onPress={() => handleLanguageSelect('kn')} 
                      title="ಕನ್ನಡ (Kannada)"
                      titleStyle={{ color: colors.text }}
                      leadingIcon={language === 'kn' ? 'check' : undefined}
                    />
                  </Menu>
                </View>
                
                <Divider style={[styles.settingDivider, { backgroundColor: colors.border }]} />
                <List.Item
                  title={t('clearCache')}
                  description="Free up storage space"
                  titleStyle={[styles.settingLabel, { color: colors.text }]}
                  descriptionStyle={[styles.settingDesc, { color: colors.textSecondary }]}
                  right={props => <List.Icon {...props} icon="chevron-right" color={colors.textSecondary} />}
                  style={styles.settingItem}
                />
              </View>
            )}
            <Divider style={{ backgroundColor: colors.border }} />

            {/* Help & Support Section */}
            <List.Item
              title={t('helpSupport')}
              description="FAQs and contact us"
              titleStyle={[styles.menuTitle, { color: colors.text }]}
              descriptionStyle={{ color: colors.textSecondary }}
              left={props => <List.Icon {...props} icon="help-circle" color={colors.primary} />}
              right={props => <List.Icon {...props} icon={expandedSection === 'help' ? "chevron-up" : "chevron-down"} color={colors.textSecondary} />}
              onPress={() => toggleSection('help')}
              style={styles.menuItem}
            />
            {expandedSection === 'help' && (
              <View style={[styles.expandedContent, { backgroundColor: colors.expandedBg }]}>
                <Text style={[styles.faqTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
                
                <View style={styles.faqItem}>
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>Q: How do I scan my plant for diseases?</Text>
                  <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>A: Go to Plant Analyzer, take a photo of your plant's leaves, and our AI will identify any diseases and suggest treatments.</Text>
                </View>
                
                <View style={styles.faqItem}>
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>Q: How accurate is the disease detection?</Text>
                  <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>A: Our AI model has 95%+ accuracy for common crop diseases. For best results, take clear photos in good lighting.</Text>
                </View>
                
                <View style={styles.faqItem}>
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>Q: Can I get crop recommendations for my region?</Text>
                  <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>A: Yes! Use the Crop Suggestions feature and enter your soil type, climate, and location for personalized recommendations.</Text>
                </View>

                <Divider style={[styles.settingDivider, { backgroundColor: colors.border }]} />
                
                <Text style={[styles.contactTitle, { color: colors.text }]}>Contact Us</Text>
                <List.Item
                  title="Email Support"
                  description="lkushal2006@gmail.com"
                  titleStyle={[styles.settingLabel, { color: colors.text }]}
                  descriptionStyle={[styles.contactLink, { color: colors.primary }]}
                  left={props => <List.Icon {...props} icon="email" color={colors.primary} />}
                  onPress={() => Linking.openURL('mailto:lkushal2006@gmail.com')}
                  style={styles.contactItem}
                />
                <List.Item
                  title="Phone Support"
                  description="+91 8660179391"
                  titleStyle={[styles.settingLabel, { color: colors.text }]}
                  descriptionStyle={[styles.contactLink, { color: colors.primary }]}
                  left={props => <List.Icon {...props} icon="phone" color={colors.primary} />}
                  onPress={() => Linking.openURL('tel:+918660179391')}
                  style={styles.contactItem}
                />
              </View>
            )}
            <Divider style={{ backgroundColor: colors.border }} />

            {/* About Section */}
            <List.Item
              title={t('aboutApp')}
              description={`${t('version')} 1.0.0`}
              titleStyle={[styles.menuTitle, { color: colors.text }]}
              descriptionStyle={{ color: colors.textSecondary }}
              left={props => <List.Icon {...props} icon="information" color={colors.primary} />}
              right={props => <List.Icon {...props} icon={expandedSection === 'about' ? "chevron-up" : "chevron-down"} color={colors.textSecondary} />}
              onPress={() => toggleSection('about')}
              style={styles.menuItem}
            />
            {expandedSection === 'about' && (
              <View style={[styles.expandedContent, { backgroundColor: colors.expandedBg }]}>
                <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                  FarmHelp is an AI-powered farming assistant designed to help Indian farmers with plant disease detection, crop recommendations, and expert farming advice.
                </Text>
                <View style={[styles.aboutInfo, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>{t('version')}</Text>
                  <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
                </View>
                <View style={[styles.aboutInfo, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>{t('developer')}</Text>
                  <Text style={[styles.aboutValue, { color: colors.text }]}>Kushal L</Text>
                </View>
                <View style={[styles.aboutInfo, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>{t('lastUpdated')}</Text>
                  <Text style={[styles.aboutValue, { color: colors.text }]}>April 2026</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={logout}
          style={styles.logoutButton}
          buttonColor="#F44336"
          icon="logout"
        >
          {t('logout')}
        </Button>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>Made with 💚 for Indian Farmers</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1 },
  header: {
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
  menuTitle: { fontWeight: 'bold', marginBottom: 8 },
  menuItem: { paddingVertical: 4 },
  logoutButton: { marginHorizontal: 16, marginBottom: 16 },
  footer: { textAlign: 'center', fontSize: 13, marginBottom: 8 },
  expandedContent: {
    padding: 16,
    marginHorizontal: -16,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingDesc: { fontSize: 13, marginTop: 2 },
  settingDivider: { marginVertical: 8 },
  settingItem: { paddingVertical: 4, marginHorizontal: -16 },
  faqTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  faqItem: { marginBottom: 16 },
  faqQuestion: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  faqAnswer: { fontSize: 13, lineHeight: 20 },
  contactTitle: { fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  contactItem: { paddingVertical: 4, marginHorizontal: -16 },
  contactLink: { fontWeight: '500' },
  aboutText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  aboutInfo: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  aboutLabel: { fontSize: 14 },
  aboutValue: { fontSize: 14, fontWeight: '600' },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
