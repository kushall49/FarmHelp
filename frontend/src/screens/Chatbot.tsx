import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { TextInput, Button, Text, Card, Surface, ActivityIndicator, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import { useSafeGoBack } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

export default function Chatbot() {
  const navigation = useNavigation();
  const handleGoBack = useSafeGoBack();
  const { isDarkMode, colors } = useTheme();
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { 
      from: 'bot', 
      text: t('chatbotWelcome')
    }
  ]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  async function send() {
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { from: 'user', text: userMessage, timestamp: Date.now() }]);
    setLoading(true);

    try {
      const res = await api.chatbot(userMessage);
      setMessages(prev => [...prev, { from: 'bot', text: res.data.reply || t('chatbotRetry'), timestamp: Date.now() }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { from: 'bot', text: t('chatbotError'), timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    t('chatbotQ1'),
    t('chatbotQ2'),
    t('chatbotQ3'),
    t('chatbotQ4')
  ];

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: { backgroundColor: colors.card },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    inputContainer: { backgroundColor: colors.card, borderTopColor: isDarkMode ? colors.border : '#E2E8F0' },
    input: { backgroundColor: isDarkMode ? colors.background : '#F8FAFC', color: colors.text },
    messageText: { color: colors.text },
    botCard: { backgroundColor: isDarkMode ? colors.border : '#FFFFFF' },
    botText: { color: colors.text },
    quickActionsContainer: { backgroundColor: colors.card, borderTopColor: isDarkMode ? colors.border : '#E2E8F0' },
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, dynamicStyles.container]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <LinearGradient
        colors={isDarkMode ? ['#1E293B', '#334155'] : ['#4CAF50', '#66BB6A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Icon name="robot-excited" size={40} color="#FFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text variant="headlineMedium" style={styles.title}>{t('chatbotTitle')}</Text>
            <Text style={styles.subtitle}>{t('chatbotSubtitle')}</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.from === 'user' ? styles.userBubble : styles.botBubble]}>
            {item.from === 'bot' && (
              <View style={styles.botAvatarContainer}>
                <LinearGradient
                  colors={['#4CAF50', '#66BB6A']}
                  style={styles.botAvatar}
                >
                  <Icon name="robot" size={16} color="#FFF" />
                </LinearGradient>
              </View>
            )}
            <Surface style={[
              styles.messageCard, 
              item.from === 'user' ? styles.userCard : [styles.botCard, dynamicStyles.botCard]
            ]} elevation={3}>
              <Text style={[
                styles.messageText, 
                item.from === 'user' ? styles.userText : dynamicStyles.botText
              ]}>
                {item.text}
              </Text>
            </Surface>
            {item.from === 'user' && (
              <View style={styles.userAvatarContainer}>
                <LinearGradient
                  colors={['#2196F3', '#64B5F6']}
                  style={styles.userAvatar}
                >
                  <Icon name="account" size={16} color="#FFF" />
                </LinearGradient>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingBubble}>
              <View style={styles.botAvatarContainer}>
                <LinearGradient
                  colors={['#4CAF50', '#66BB6A']}
                  style={styles.botAvatar}
                >
                  <Icon name="robot" size={16} color="#FFF" />
                </LinearGradient>
              </View>
              <Surface style={[styles.loadingCard, dynamicStyles.botCard]} elevation={2}>
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={[styles.typingText, { color: colors.textSecondary }]}>{t('chatbotTyping')}</Text>
                </View>
              </Surface>
            </View>
          ) : null
        }
      />

      {messages.length === 1 && (
        <View style={[styles.quickActionsContainer, dynamicStyles.quickActionsContainer]}>
          <Text style={[styles.quickActionsTitle, { color: colors.textSecondary }]}>{t('chatbotQuickTitle')}</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <LinearGradient
                key={index}
                colors={isDarkMode ? ['#334155', '#475569'] : ['#E8F5E9', '#C8E6C9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickActionGradient}
              >
                <Button
                  mode="text"
                  onPress={() => setMessage(action)}
                  style={styles.quickActionButton}
                  labelStyle={{ color: isDarkMode ? colors.text : '#2E7D32', fontSize: 12 }}
                  compact
                >
                  {action}
                </Button>
              </LinearGradient>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
        <View style={styles.inputWrapper}>
          <Icon name="chat-question" size={24} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t('chatbotPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            mode="outlined"
            style={[styles.input, dynamicStyles.input]}
            textColor={colors.text}
            outlineColor={isDarkMode ? colors.border : '#E2E8F0'}
            activeOutlineColor="#4CAF50"
            onSubmitEditing={send}
            disabled={loading}
            multiline
            numberOfLines={2}
          />
          <LinearGradient
            colors={message.trim() && !loading ? ['#4CAF50', '#66BB6A'] : ['#9E9E9E', '#BDBDBD']}
            style={styles.sendButtonGradient}
          >
            <IconButton
              icon="send"
              size={24}
              iconColor="#FFF"
              onPress={send}
              disabled={!message.trim() || loading}
              style={styles.sendButton}
            />
          </LinearGradient>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 50,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: { 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    fontSize: 22,
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 13, 
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  messageList: { 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    paddingBottom: 24,
  },
  messageBubble: { 
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userBubble: { 
    justifyContent: 'flex-end',
  },
  botBubble: { 
    justifyContent: 'flex-start',
  },
  botAvatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarContainer: {
    marginLeft: 8,
    marginBottom: 4,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageCard: { 
    maxWidth: width * 0.75, 
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userCard: { 
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  botCard: { 
    borderBottomLeftRadius: 4,
  },
  messageText: { 
    fontSize: 15, 
    lineHeight: 22,
  },
  userText: { 
    color: '#FFFFFF',
  },
  loadingBubble: { 
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  loadingCard: {
    borderRadius: 18,
    padding: 12,
    borderBottomLeftRadius: 4,
  },
  typingIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  typingText: { 
    marginLeft: 12, 
    fontSize: 13,
    fontStyle: 'italic',
  },
  quickActionsContainer: { 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    borderTopWidth: 1,
    elevation: 4,
  },
  quickActionsTitle: { 
    fontSize: 14, 
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  quickActionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionGradient: {
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
  },
  quickActionButton: {
    margin: 0,
  },
  inputContainer: { 
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    top: 16,
  },
  input: { 
    flex: 1,
    paddingLeft: 48,
    paddingRight: 60,
    fontSize: 15,
    borderRadius: 25,
    maxHeight: 100,
  },
  sendButtonGradient: {
    position: 'absolute',
    right: 4,
    top: 6,
    borderRadius: 25,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  sendButton: {
    margin: 0,
  },
});
