import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  Image, 
  ActivityIndicator,
  useWindowDimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = 'http://localhost:4000';

export default function SignupScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  async function onSignup() {
    try {
      if (!email || !password || !username) {
        setError('Please fill email, username and password');
        return;
      }
      
      if (!agreeTerms) {
        setError('Please agree to terms and conditions');
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
        const errorMsg = data.message || 'Signup failed';
        const fieldInfo = data.field ? ` (${data.field})` : '';
        throw new Error(errorMsg + fieldInfo);
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('username', data.user.username || data.user.displayName || 'User');
      await AsyncStorage.setItem('email', data.user.email);

      navigation.replace('MainTabs');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={[styles.card, isMobile && styles.cardMobile]}>
        
        {/* Left Side - Form */}
        <View style={[styles.leftSide, isMobile && { flex: 1, padding: 24, paddingVertical: 40 }]}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Join FarmHelp</Text>
            <Text style={styles.subtitle}>Create an account to continue</Text>

            {/* Google Sign In Button */}
            <TouchableOpacity style={styles.googleBtn}>
              <Icon name="google" size={20} color="#DB4437" />
              <Text style={styles.googleText}>Sign up with Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            <TextInput
              style={styles.input}
              placeholder="Display Name (optional)"
              placeholderTextColor="#9CA3AF"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberMe} 
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.7}
              >
                <Icon 
                  name={agreeTerms ? "check-box-outline" : "checkbox-blank-outline"} 
                  size={20} 
                  color={agreeTerms ? "#22C55E" : "#D1D5DB"} 
                />
                <Text style={styles.rememberText}>I agree to the terms and conditions</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]} 
              onPress={onSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Create account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signupLink}>Log in</Text>
              </TouchableOpacity>
            </View>
            
            {/* Demo Link */}
            <TouchableOpacity onPress={() => navigation.replace('MainTabs')} style={{marginTop: 20, alignItems: 'center'}}>
               <Text style={{color: '#6b7280', fontSize: 12}}>Skip Login (Demo)</Text>
            </TouchableOpacity>

          </View>

          {/* Logo Footer */}
          {!isMobile && (
            <View style={styles.logoContainer}>
              <Icon name="leaf-circle" size={24} color="#111827" />
              <Text style={styles.logoText}>FarmHelp</Text>
            </View>
          )}
        </View>

        {/* Right Side - Image */}
        {!isMobile && (
          <View style={styles.rightSide}>
            <ImageBackground 
              source={{ uri: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2913&auto=format&fit=crop' }} 
              style={styles.imageBackground}
              resizeMode="cover"
            >
              <View style={styles.imageOverlay} />
              <View style={styles.imageContent}>
                <View style={[styles.logoContainerImage]}>
                  <Icon name="leaf-circle" size={24} color="#fff" />
                  <Text style={[styles.logoText, { color: '#fff' }]}>FarmHelp</Text>
                </View>
                <Text style={styles.quote}>
                  Join the community of modern farmers today.
                </Text>
                <View style={styles.authorRow}>
                  <Image 
                    source={{ uri: 'https://api.dicebear.com/7.x/faces/svg?seed=Emma' }} 
                    style={styles.avatar} 
                  />
                  <Text style={styles.authorName}>Emma, FL</Text>
                </View>
              </View>
            </ImageBackground>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 1100,
    height: 750,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardMobile: {
    height: '100%',
    maxWidth: 500,
    borderRadius: 16,
    maxHeight: 700,
  },
  leftSide: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 20,
  },
  rightSide: {
    flex: 1.1,
    backgroundColor: '#E5E7EB',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 24,
  },
  googleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
    color: '#111827',
    outlineStyle: 'none',
  } as any,
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 13,
  },
  loginBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupLink: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  logoContainer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainerImage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
  },
  imageContent: {
    padding: 40,
    paddingBottom: 60,
  },
  quote: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 40,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  }
});
