import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, TextInput, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:4000';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    try {
      if (!email || !password) {
        setError('Please fill all fields');
        return;
      }

      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific error message from backend
        const errorMsg = data.message || 'Login failed';
        const fieldInfo = data.field ? ` (${data.field})` : '';
        throw new Error(errorMsg + fieldInfo);
      }

      // Store token and user data
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('username', data.user.username || data.user.displayName || 'User');
      await AsyncStorage.setItem('email', data.user.email);

      console.log('Login successful, navigating to MainTabs');
      navigation.replace('MainTabs');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function skipLogin() {
    navigation.replace('MainTabs');
  }

  return (
    <View style={{ padding: 16 }}>
      <Title>FarmMate Login</Title>
      {error ? <Paragraph style={{ color: 'red' }}>{error}</Paragraph> : null}
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button mode="contained" onPress={onLogin} style={{ marginTop: 12 }} loading={loading} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <Button onPress={() => navigation.navigate('Signup')}>Create an account</Button>
      <Button mode="outlined" onPress={skipLogin} style={{ marginTop: 20 }}>Skip Login (Demo)</Button>
    </View>
  );
}
