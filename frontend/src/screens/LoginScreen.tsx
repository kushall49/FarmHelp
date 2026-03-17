import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Colors } from '../constants/colors';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidPhone(value: string): boolean {
  return /^\d{10}$/.test(value.replace(/\s/g, ''));
}

// ─── Component ────────────────────────────────────────────────────────────────

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ── Validation ────────────────────────────────────────────────────────

  const validate = (): boolean => {
    let valid = true;
    setPhoneError('');
    setPasswordError('');

    if (!isValidPhone(phone)) {
      setPhoneError('Enter a valid 10-digit phone number');
      valid = false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }
    return valid;
  };

  // ── Submit ────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const response = await api.login({ phone: cleanPhone, password });
      await login(response.token, response.user);
    } catch (err: any) {
      const message: string =
        err?.response?.data?.message ??
        err?.message ??
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <ScrollView
        style={styles.scrollBase}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLeaf}>🌿</Text>
          <Text style={styles.heroTitle}>FarmHelp</Text>
          <Text style={styles.heroTagline}>Empowering Indian Farmers</Text>
        </View>

        {/* ── Form card (overlaps hero by 40px) ─────────────────────────── */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to continue</Text>

          {/* Phone field */}
          <View style={styles.fieldGap}>
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={text => {
                setPhone(text);
                setPhoneError('');
              }}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              leftIcon={<Text style={styles.phonePrefixText}>+91</Text>}
              error={phoneError}
              maxLength={10}
              autoCapitalize="none"
            />
          </View>

          {/* Password field */}
          <View style={styles.fieldGap}>
            <Input
              label="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                setPasswordError('');
              }}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              leftIcon={<Text style={styles.fieldIconText}>🔒</Text>}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  hitSlop={styles.hitSlop}
                >
                  <Text style={styles.eyeIconText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              }
              error={passwordError}
              autoCapitalize="none"
            />
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Error banner */}
          {error.length > 0 && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Login CTA */}
          <Button
            title="Login"
            onPress={handleLogin}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            style={styles.loginButton}
          />

          {/* OR divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register CTA */}
          <Button
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollBase: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // Hero section
  heroSection: {
    backgroundColor: Colors.primary,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  heroLeaf: {
    fontSize: 64,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.70)',
    marginTop: 6,
  },

  // Form card
  formCard: {
    backgroundColor: Colors.surface,
    marginTop: -40,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },

  // Field helpers
  fieldGap: {
    marginBottom: 16,
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 2,
  },
  fieldIconText: {
    fontSize: 16,
  },
  eyeIconText: {
    fontSize: 18,
    paddingHorizontal: 2,
  },
  hitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
  },

  // Forgot password
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -6,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Error banner
  errorBanner: {
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorBannerText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Buttons
  loginButton: {
    marginBottom: 20,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
});

export default LoginScreen;
