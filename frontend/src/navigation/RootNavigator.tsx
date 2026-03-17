import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

export default function RootNavigator() {
  const { state } = useAuth();

  // Still loading stored token from AsyncStorage
  if (state.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  return state.isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAF5',
  },
});
