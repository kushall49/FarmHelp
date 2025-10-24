import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Surface, ActivityIndicator, IconButton } from 'react-native-paper';
import api from '../services/api';

export default function Chatbot() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { from: 'bot', text: '👋 Hello! I\'m FarmBot, your AI farming assistant. Ask me about crops, pests, soil, weather, or any farming questions!' }
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
      setMessages(prev => [...prev, { from: 'bot', text: res.data.reply || 'Sorry, I couldn\'t process that. Please try again.', timestamp: Date.now() }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { from: 'bot', text: '⚠️ Connection error. Please check your internet and try again.', timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    '🌾 Best crops for loamy soil?',
    '🐛 How to control pests?',
    '💧 Irrigation tips',
    '🌡️ Weather advice'
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Surface style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>🤖 FarmBot Assistant</Text>
        <Text style={styles.subtitle}>Ask anything about farming</Text>
      </Surface>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.from === 'user' ? styles.userBubble : styles.botBubble]}>
            <Surface style={[styles.messageCard, item.from === 'user' ? styles.userCard : styles.botCard]}>
              <Text style={[styles.messageText, item.from === 'user' ? styles.userText : styles.botText]}>
                {item.text}
              </Text>
            </Surface>
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingBubble}>
              <Surface style={styles.botCard}>
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={styles.typingText}>FarmBot is typing...</Text>
                </View>
              </Surface>
            </View>
          ) : null
        }
      />

      {messages.length === 1 && (
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Questions:</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                mode="outlined"
                onPress={() => setMessage(action)}
                style={styles.quickActionButton}
                compact
              >
                {action}
              </Button>
            ))}
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type your farming question..."
          mode="outlined"
          style={styles.input}
          right={
            <TextInput.Icon 
              icon="send" 
              onPress={send} 
              disabled={!message.trim() || loading}
              color="#4CAF50"
            />
          }
          activeOutlineColor="#4CAF50"
          onSubmitEditing={send}
          disabled={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, backgroundColor: '#fff', elevation: 2 },
  title: { fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748B' },
  messageList: { paddingHorizontal: 16, paddingVertical: 12 },
  messageBubble: { marginVertical: 4 },
  userBubble: { alignItems: 'flex-end' },
  botBubble: { alignItems: 'flex-start' },
  messageCard: { maxWidth: '80%', borderRadius: 16, padding: 12, elevation: 2 },
  userCard: { backgroundColor: '#4CAF50' },
  botCard: { backgroundColor: '#FFFFFF' },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  botText: { color: '#1E293B' },
  loadingBubble: { alignItems: 'flex-start', marginVertical: 4, paddingHorizontal: 16 },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  typingText: { marginLeft: 8, color: '#64748B', fontSize: 13 },
  quickActionsContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  quickActionsTitle: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickActionButton: { marginRight: 8, marginBottom: 8, borderColor: '#4CAF50' },
  inputContainer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  input: { backgroundColor: '#F8FAFC' },
});
