import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Colors } from '../constants/colors';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// ─── Data ─────────────────────────────────────────────────────────────────────

const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string;
  phone?: string;
  state?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidPhone(value: string): boolean {
  return /^\d{10}$/.test(value.replace(/\s/g, ''));
}

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);

  // Async state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Helpers ────────────────────────────────────────────────────────────

  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // ── Validation ─────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!name.trim() || name.trim().length < 2) {
      next.name = 'Please enter your full name';
    }
    if (!isValidPhone(phone)) {
      next.phone = 'Enter a valid 10-digit phone number';
    }
    if (!selectedState) {
      next.state = 'Please select your state';
    }
    if (password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    if (confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match';
    }
    if (!agreedToTerms) {
      next.terms = 'Please agree to Terms & Privacy Policy to continue';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.register({
        name: name.trim(),
        phone: phone.replace(/\s/g, ''),
        state: selectedState,
        password,
      });
      await login(response.token, response.user);
    } catch (err: any) {
      const message: string =
        err?.response?.data?.message ??
        err?.message ??
        'Registration failed. Please try again.';
      setErrors(prev => ({ ...prev, general: message }));
    } finally {
      setLoading(false);
    }
  };

  // ── State selector styles (built outside JSX) ──────────────────────────

  const stateSelectorStyle: ViewStyle = errors.state
    ? { ...styles.stateSelector, ...styles.stateSelectorError }
    : styles.stateSelector;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
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
          {/* ── Hero ──────────────────────────────────────────────────── */}
          <View style={styles.heroSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.heroLeaf}>🌿</Text>
            <Text style={styles.heroTitle}>Join FarmHelp</Text>
            <Text style={styles.heroTagline}>Empowering Indian Farmers</Text>
          </View>

          {/* ── Form card ─────────────────────────────────────────────── */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Join 10,000+ farmers</Text>

            {/* Name */}
            <View style={styles.fieldGap}>
              <Input
                label="Full Name"
                value={name}
                onChangeText={text => {
                  setName(text);
                  clearError('name');
                }}
                placeholder="Enter your full name"
                leftIcon={<Text style={styles.fieldIconText}>👤</Text>}
                autoCapitalize="words"
                error={errors.name}
              />
            </View>

            {/* Phone */}
            <View style={styles.fieldGap}>
              <Input
                label="Phone Number"
                value={phone}
                onChangeText={text => {
                  setPhone(text);
                  clearError('phone');
                }}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                leftIcon={<Text style={styles.fieldIconText}>📱</Text>}
                error={errors.phone}
                maxLength={10}
                autoCapitalize="none"
              />
            </View>

            {/* State picker */}
            <View style={styles.fieldGap}>
              <Text style={styles.stateLabel}>State</Text>
              <TouchableOpacity
                style={stateSelectorStyle}
                onPress={() => setStateModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.stateSelectorIcon}>🏛️</Text>
                <Text
                  style={[
                    styles.stateSelectorText,
                    !selectedState && styles.statePlaceholderText,
                  ]}
                >
                  {selectedState.length > 0 ? selectedState : 'Select your state'}
                </Text>
                <Text style={styles.stateChevron}>▾</Text>
              </TouchableOpacity>
              {errors.state != null && (
                <Text style={styles.fieldError}>{errors.state}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldGap}>
              <Input
                label="Password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  clearError('password');
                }}
                placeholder="Min 6 characters"
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
                error={errors.password}
                autoCapitalize="none"
              />
            </View>

            {/* Confirm password */}
            <View style={styles.fieldGap}>
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  clearError('confirmPassword');
                }}
                placeholder="Re-enter your password"
                secureTextEntry={!showConfirm}
                leftIcon={<Text style={styles.fieldIconText}>🔒</Text>}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirm(v => !v)}
                    hitSlop={styles.hitSlop}
                  >
                    <Text style={styles.eyeIconText}>{showConfirm ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                }
                error={errors.confirmPassword}
                autoCapitalize="none"
              />
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => {
                setAgreedToTerms(v => !v);
                clearError('terms');
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxChecked,
                ]}
              >
                {agreedToTerms && (
                  <Text style={styles.checkboxTick}>✓</Text>
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to{' '}
                <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms != null && (
              <Text style={styles.fieldError}>{errors.terms}</Text>
            )}

            {/* General error banner */}
            {errors.general != null && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            {/* Submit */}
            <Button
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.submitButton}
            />

            {/* Login link */}
            <TouchableOpacity
              style={styles.loginLinkRow}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
                <Text style={styles.loginLink}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── State picker modal ────────────────────────────────────────── */}
      <Modal
        visible={stateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setStateModalVisible(false)}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* State list */}
            <FlatList
              data={INDIAN_STATES}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.stateSeparator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.stateItem,
                    item === selectedState && styles.stateItemActive,
                  ]}
                  onPress={() => {
                    setSelectedState(item);
                    clearError('state');
                    setStateModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      item === selectedState && styles.stateItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === selectedState && (
                    <Text style={styles.stateItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
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
    paddingBottom: 48,
  },

  // Hero
  heroSection: {
    backgroundColor: Colors.primary,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700',
    lineHeight: 22,
  },
  heroLeaf: {
    fontSize: 52,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 26,
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

  // Field wrappers
  fieldGap: {
    marginBottom: 16,
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

  // State selector
  stateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  stateSelectorError: {
    borderColor: Colors.error,
  },
  stateSelectorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  stateSelectorText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  statePlaceholderText: {
    color: Colors.textPlaceholder,
  },
  stateChevron: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Field error
  fieldError: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 2,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginRight: 10,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkboxTick: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
    lineHeight: 14,
  },
  termsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // General error banner
  errorBanner: {
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
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
  submitButton: {
    marginTop: 12,
    marginBottom: 20,
  },

  // Login link
  loginLinkRow: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // ── State modal ──────────────────────────────────────────────────────────────

  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '700',
  },

  // State list items
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  stateItemActive: {
    backgroundColor: Colors.accentSoft,
  },
  stateItemText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  stateItemTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  stateItemCheck: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '700',
  },
  stateSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 24,
  },
});

export default RegisterScreen;
