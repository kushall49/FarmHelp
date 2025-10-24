import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, TextInput, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:4000';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSignup() {
    try {
      if (!email || !password || !username) {
        setError('Please fill email, username and password');
        return;
      }

      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          username, 
          displayName: displayName || username 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific error message from backend
        const errorMsg = data.message || 'Signup failed';
        const fieldInfo = data.field ? ` (${data.field})` : '';
        throw new Error(errorMsg + fieldInfo);
      }

      // Store token and user data
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('username', data.user.username || data.user.displayName || 'User');
      await AsyncStorage.setItem('email', data.user.email);

      console.log('Signup successful, navigating to Home');
      navigation.replace('Home');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  function skipLogin() {
    navigation.replace('Home');
  }

  return (
    <View style={{ padding: 16 }}>
      <Title>Create account</Title>
      {error ? <Paragraph style={{ color: 'red' }}>{error}</Paragraph> : null}
      <TextInput 
        label="Username" 
        value={username} 
        onChangeText={setUsername} 
        autoCapitalize="none"
      />
      <TextInput 
        label="Display Name (optional)" 
        value={displayName} 
        onChangeText={setDisplayName}
      />
      <TextInput 
        label="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput 
        label="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      <Button 
        mode="contained" 
        onPress={onSignup} 
        style={{ marginTop: 12 }}
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Sign up'}
      </Button>
      <Button mode="outlined" onPress={skipLogin} style={{ marginTop: 12 }}>
        Skip Login (Demo)
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Login')} style={{ marginTop: 8 }}>
        Already have an account? Login
      </Button>
    </View>
  );
}
