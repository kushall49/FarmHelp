import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api, ChatMessage } from '../services/api';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_SUGGESTIONS: string[] = [
  '🌾 Best crop for clay soil?',
  '🔬 Paddy disease symptoms?',
  '💧 Irrigation tips for wheat',
  '📈 Market prices today',
  '🌿 Organic pesticides',
  '🌦️ Monsoon farming tips',
];

const TYPING_ID = '__typing__';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const makePulse = (anim: Animated.Value, delay: number): Animated.CompositeAnimation =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ]),
      );

    const a1 = makePulse(dot1, 0);
    const a2 = makePulse(dot2, 150);
    const a3 = makePulse(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface BubbleProps {
  message: Message;
}

const MessageBubble: React.FC<BubbleProps> = React.memo(({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userBubbleWrapper}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{message.content}</Text>
        </View>
        <Text style={styles.timestampRight}>{formatTime(message.timestamp)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.botBubbleWrapper}>
      <View style={styles.botBubble}>
        {message.isTyping ? (
          <TypingDots />
        ) : (
          <Text style={styles.botBubbleText}>{message.content}</Text>
        )}
      </View>
      {!message.isTyping && (
        <Text style={styles.timestampLeft}>{formatTime(message.timestamp)}</Text>
      )}
    </View>
  );
});

// ─── Welcome Card ─────────────────────────────────────────────────────────────

interface WelcomeCardProps {
  onSuggestionPress: (text: string) => void;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ onSuggestionPress }) => (
  <View style={styles.welcomeWrapper}>
    <View style={styles.welcomeCard}>
      <Text style={styles.welcomeEmoji}>🤖</Text>
      <Text style={styles.welcomeTitle}>Hello! I'm FarmBot</Text>
      <Text style={styles.welcomeSubtitle}>Your AI farming assistant</Text>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.suggestionScrollContent}
    >
      {QUICK_SUGGESTIONS.map((suggestion) => (
        <TouchableOpacity
          key={suggestion}
          style={styles.suggestionChip}
          onPress={() => onSuggestionPress(suggestion)}
          activeOpacity={0.75}
        >
          <Text style={styles.suggestionChipText}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Chatbot: React.FC = () => {
  const navigation = useNavigation();
  useAuth(); // ensures component re-renders on auth changes

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, []);

  const buildHistory = useCallback((msgs: Message[]): ChatMessage[] =>
    msgs
      .filter((m) => !m.isTyping && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
  []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      setInputText('');
      setIsSending(true);

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      const typingMsg: Message = {
        id: TYPING_ID,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true,
      };

      // Capture current messages for history before state update
      const currentMessages = messages;

      setMessages((prev) => [...prev, userMsg, typingMsg]);
      scrollToBottom();

      try {
        const history = buildHistory([...currentMessages, userMsg]);
        const response = await api.sendMessage(trimmed, history);

        const botMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: response.reply?.trim() || 'I could not process that. Please try again.',
          timestamp: new Date(),
        };

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== TYPING_ID),
          botMsg,
        ]);
      } catch {
        const errorMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== TYPING_ID),
          errorMsg,
        ]);
      } finally {
        setIsSending(false);
        scrollToBottom();
      }
    },
    [isSending, messages, buildHistory, scrollToBottom],
  );

  const handleSuggestionPress = useCallback(
    (text: string) => sendMessage(text),
    [sendMessage],
  );

  const handleSend = useCallback(() => sendMessage(inputText), [inputText, sendMessage]);

  const hasRealMessages = messages.some(
    (m) => m.role === 'user' || (m.role === 'assistant' && !m.isTyping),
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <MessageBubble message={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const ListHeaderComponent = !hasRealMessages ? (
    <WelcomeCard onSuggestionPress={handleSuggestionPress} />
  ) : null;

  const canSend = inputText.trim().length > 0 && !isSending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🤖 FarmBot AI</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* ── Chat FlatList ────────────────────────────────────────────────────── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* ── Active Suggestion Chips ──────────────────────────────────────────── */}
      {hasRealMessages && (
        <View style={styles.activeSuggestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeSuggestionsScrollContent}
          >
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.activeChip}
                onPress={() => handleSuggestionPress(suggestion)}
                activeOpacity={0.75}
              >
                <Text style={styles.activeChipText} numberOfLines={1}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Input Bar ────────────────────────────────────────────────────────── */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.micButton} activeOpacity={0.7}>
          <Text style={styles.micIcon}>🎤</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about farming..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={1000}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonInactive,
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Text
              style={[
                styles.sendIcon,
                canSend ? styles.sendIconActive : styles.sendIconInactive,
              ]}
            >
              ➤
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: {
    color: Colors.textInverse,
    fontSize: 22,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#81C784',
    marginRight: 4,
  },
  onlineText: {
    color: '#81C784',
    fontSize: 11,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 36,
  },

  // Chat Area
  chatArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },

  // Welcome
  welcomeWrapper: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    flex: 1,
  },
  welcomeCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  suggestionScrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  suggestionChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  suggestionChipText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },

  // User Bubble
  userBubbleWrapper: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userBubbleText: {
    color: Colors.textInverse,
    fontSize: 14,
    lineHeight: 20,
  },
  timestampRight: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 3,
    marginRight: 2,
  },

  // Bot Bubble
  botBubbleWrapper: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  botBubbleText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  timestampLeft: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 3,
    marginLeft: 2,
  },

  // Typing Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 3,
  },

  // Active Suggestion Chips
  activeSuggestionsContainer: {
    paddingVertical: 8,
    backgroundColor: Colors.transparent,
  },
  activeSuggestionsScrollContent: {
    paddingHorizontal: 12,
  },
  activeChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    maxWidth: 190,
  },
  activeChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },

  // Input Bar
  inputBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  micIcon: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: Colors.border,
  },
  sendIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  sendIconActive: {
    color: Colors.textInverse,
  },
  sendIconInactive: {
    color: Colors.textMuted,
  },
});

export default Chatbot;
