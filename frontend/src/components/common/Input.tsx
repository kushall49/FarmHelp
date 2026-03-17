import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
} from 'react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  onSubmitEditing?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  keyboardType,
  returnKeyType,
  multiline,
  numberOfLines,
  maxLength,
  autoCapitalize,
  editable = true,
  containerStyle,
  inputStyle,
  onSubmitEditing,
}) => {
  const [focused, setFocused] = useState(false);

  const wrapperStyle = [
    styles.inputWrapper,
    focused && styles.inputWrapperFocused,
    error != null && styles.inputWrapperError,
    !editable && styles.inputWrapperDisabled,
  ];

  const fieldStyle = [
    styles.input,
    leftIcon != null && styles.inputWithLeftIcon,
    rightIcon != null && styles.inputWithRightIcon,
    multiline && styles.inputMultiline,
    inputStyle,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label != null && <Text style={styles.label}>{label}</Text>}

      <View style={wrapperStyle}>
        {leftIcon != null && (
          <View style={styles.leftIconSlot}>{leftIcon}</View>
        )}

        <TextInput
          style={fieldStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9E9E9E"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
        />

        {rightIcon != null && (
          <View style={styles.rightIconSlot}>{rightIcon}</View>
        )}
      </View>

      {error != null && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 6,
  },
  // ── Input wrapper ────────────────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F0E9',
    borderRadius: 12,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: '#4CAF50',
    borderWidth: 1.5,
  },
  inputWrapperError: {
    borderColor: '#C62828',
    borderWidth: 1.5,
  },
  inputWrapperDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  // ── TextInput field ──────────────────────────────────────────
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1A1A2E',
  },
  inputWithLeftIcon: {
    paddingLeft: 4,
  },
  inputWithRightIcon: {
    paddingRight: 4,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  // ── Icon slots ───────────────────────────────────────────────
  leftIconSlot: {
    paddingLeft: 12,
    paddingRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconSlot: {
    paddingRight: 12,
    paddingLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Error text ───────────────────────────────────────────────
  errorText: {
    fontSize: 12,
    color: '#C62828',
    marginTop: 4,
  },
});

export default Input;
