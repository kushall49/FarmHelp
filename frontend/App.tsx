/**
 * FarmHelp App - Entry Point
 * 
 * Navigation architecture has been completely rebuilt with:
 * - Root Stack (Auth + MainTabs)
 * - Tab Navigator (Home, Community, Services, Profile)
 * - Feature screens with headers and back buttons
 * - Android hardware back button support
 * - Deep link fallback protection
 */

import React, { useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';

// Import new navigation architecture
import AppNavigator, { useAndroidBackHandler } from './src/navigation/AppNavigator';
import type { RootStackParamList } from './src/navigation/navigationTypes';

export default function App() {
  // Reference to navigation for Android back button handler
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Setup Android hardware back button handler
  useAndroidBackHandler(navigationRef);

  return (
    <PaperProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
