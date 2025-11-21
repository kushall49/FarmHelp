/**
 * App Navigator - Main Navigation Architecture
 * 
 * Structure:
 * RootStack (Stack.Navigator)
 * ├── Auth Screens (Login, Signup)
 * └── MainTabs (Tab.Navigator)
 *     ├── HomeTab (Stack.Navigator)
 *     │   ├── Home
 *     │   ├── PlantAnalyzer (with header + back)
 *     │   ├── Chatbot (with header + back)
 *     │   └── CropRecommendation (with header + back)
 *     ├── CommunityTab (Stack.Navigator)
 *     │   ├── Community
 *     │   ├── CreatePost (with header + back)
 *     │   ├── PostDetail (with header + back)
 *     │   └── UserProfile (with header + back)
 *     ├── ServicesTab (Stack.Navigator)
 *     │   ├── ServicesHome
 *     │   └── ... (all service screens with headers)
 *     └── ProfileTab (Profile screen)
 */

import React, { useEffect, useRef } from 'react';
import { Platform, BackHandler } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainerRef, useNavigation } from '@react-navigation/native';

// Import types
import type {
  RootStackParamList,
  MainTabParamList,
  HomeStackParamList,
  CommunityStackParamList,
  ServicesStackParamList,
} from './navigationTypes';

// Import Screens - Auth
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// Import Screens - Home Tab
import HomeScreen from '../screens/HomeScreen';
import PlantAnalyzer from '../screens/PlantAnalyzer';
import Chatbot from '../screens/Chatbot';
import CropRecommendation from '../screens/CropRecommendation';
// Temporarily commented out due to package compatibility
// import LocationCropRecommendation from '../screens/LocationCropRecommendation';

// Import Screens - Community Tab
import CommunityScreen from '../screens/CommunityScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

// Import Screens - Services Tab
import ServicesHomeScreen from '../screens/ServicesHomeScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';
import JobDetailsScreen from '../screens/JobDetailsScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import CreateJobRequestScreen from '../screens/CreateJobRequestScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import RateProviderScreen from '../screens/RateProviderScreen';

// Import Screens - Profile Tab
import ProfileScreen from '../screens/Profile';

// ============================================================================
// STACK & TAB NAVIGATORS
// ============================================================================

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();

// ============================================================================
// HOME STACK NAVIGATOR
// ============================================================================

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      {/* Main Home Screen - No header (uses custom header) */}
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      
      {/* Feature Screens - With headers and back buttons */}
      <HomeStack.Screen
        name="PlantAnalyzer"
        component={PlantAnalyzer}
        options={{
          headerShown: true,
          title: 'Plant Health Analyzer',
          headerBackTitle: 'Home',
          headerBackTitleVisible: false,
        }}
      />
      
      <HomeStack.Screen
        name="Chatbot"
        component={Chatbot}
        options={{
          headerShown: true,
          title: 'AI Assistant',
          headerBackTitle: 'Home',
          headerBackTitleVisible: false,
        }}
      />
      
      <HomeStack.Screen
        name="CropRecommendation"
        component={CropRecommendation}
        options={{
          headerShown: true,
          title: 'Crop Recommendation',
          headerBackTitle: 'Home',
          headerBackTitleVisible: false,
        }}
      />
      
      {/* Temporarily commented out due to package compatibility
      <HomeStack.Screen
        name="LocationCropRecommendation"
        component={LocationCropRecommendation}
        options={{
          headerShown: true,
          title: 'Location-Based Crops',
          headerBackTitle: 'Home',
          headerBackTitleVisible: false,
        }}
      />
      */}
    </HomeStack.Navigator>
  );
}

// ============================================================================
// COMMUNITY STACK NAVIGATOR
// ============================================================================

function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator>
      {/* Main Community Screen - No header (uses custom header) */}
      <CommunityStack.Screen
        name="Community"
        component={CommunityScreen}
        options={{ headerShown: false }}
      />
      
      {/* Community Feature Screens - With headers and back buttons */}
      <CommunityStack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          headerShown: true,
          title: 'Create Post',
          headerBackTitle: 'Community',
          headerBackTitleVisible: false,
        }}
      />
      
      <CommunityStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          headerShown: true,
          title: 'Post Details',
          headerBackTitle: 'Community',
          headerBackTitleVisible: false,
        }}
      />
      
      <CommunityStack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          headerShown: true,
          title: 'User Profile',
          headerBackTitle: 'Back',
          headerBackTitleVisible: false,
        }}
      />
    </CommunityStack.Navigator>
  );
}

// ============================================================================
// SERVICES STACK NAVIGATOR
// ============================================================================

function ServicesStackNavigator() {
  return (
    <ServicesStack.Navigator>
      {/* Main Services Screen - No header (uses custom header) */}
      <ServicesStack.Screen
        name="ServicesHome"
        component={ServicesHomeScreen}
        options={{ headerShown: false }}
      />
      
      {/* Service Feature Screens - With headers and back buttons */}
      <ServicesStack.Screen
        name="ServiceDetails"
        component={ServiceDetailsScreen}
        options={{
          headerShown: true,
          title: 'Service Details',
          headerBackTitle: 'Services',
          headerBackTitleVisible: false,
        }}
      />
      
      <ServicesStack.Screen
        name="JobDetails"
        component={JobDetailsScreen}
        options={{
          headerShown: true,
          title: 'Job Details',
          headerBackTitle: 'Services',
          headerBackTitleVisible: false,
        }}
      />
      
      <ServicesStack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{
          headerShown: true,
          title: 'Create Service Listing',
          headerBackTitle: 'Services',
          headerBackTitleVisible: false,
        }}
      />
      
      <ServicesStack.Screen
        name="CreateJobRequest"
        component={CreateJobRequestScreen}
        options={{
          headerShown: true,
          title: 'Create Job Request',
          headerBackTitle: 'Services',
          headerBackTitleVisible: false,
        }}
      />
      
      <ServicesStack.Screen
        name="MyListings"
        component={MyListingsScreen}
        options={{
          headerShown: true,
          title: 'My Listings',
          headerBackTitle: 'Services',
          headerBackTitleVisible: false,
        }}
      />
      
      <ServicesStack.Screen
        name="RateProvider"
        component={RateProviderScreen}
        options={{
          headerShown: true,
          title: 'Rate Service Provider',
          headerBackTitle: 'Back',
          headerBackTitleVisible: false,
        }}
      />
    </ServicesStack.Navigator>
  );
}

// ============================================================================
// MAIN TAB NAVIGATOR
// ============================================================================

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CommunityTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ServicesTab') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Each stack has its own headers
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityStackNavigator}
        options={{ tabBarLabel: 'Community' }}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ServicesStackNavigator}
        options={{ tabBarLabel: 'Services' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// ============================================================================
// ROOT STACK NAVIGATOR
// ============================================================================

export default function AppNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Auth Screens */}
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="Signup" component={SignupScreen} />
      
      {/* Main App (Tabs) */}
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
    </RootStack.Navigator>
  );
}

// ============================================================================
// ANDROID HARDWARE BACK BUTTON HANDLER
// ============================================================================

/**
 * Custom hook to handle Android hardware back button
 * 
 * Requirements:
 * - Must NOT block navigation (user requirement #4)
 * - Should respect navigation stack (goBack if possible)
 * - Should allow app exit if on root screen
 * 
 * Usage: Call this hook in App.tsx after NavigationContainer
 */
export function useAndroidBackHandler(
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>
) {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return; // Only for Android
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const navigation = navigationRef.current;

      if (!navigation) {
        return false; // Allow default (exit app)
      }

      // Check if we can go back in the navigation stack
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true; // Prevent default (we handled it)
      }

      // On root screen - allow app exit
      return false; // Allow default (exit app)
    });

    return () => backHandler.remove();
  }, [navigationRef]);
}

// ============================================================================
// DEEP LINK FALLBACK UTILITY
// ============================================================================

/**
 * Safe navigation with fallback for deep links
 * 
 * Problem: When PlantAnalyzer is opened directly (e.g., deep link),
 * navigation.goBack() would navigate to a blank page.
 * 
 * Solution: Check if we can go back. If not, navigate to Home tab.
 * 
 * Usage in screens:
 * ```typescript
 * import { useSafeGoBack } from '../navigation/AppNavigator';
 * 
 * const handleBack = useSafeGoBack();
 * ```
 */
export function useSafeGoBack() {
  const navigation = useNavigation();

  return () => {
    // @ts-ignore - Navigation typing is complex with nested navigators
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback: Navigate to Home tab
      // This handles deep link scenarios where there's no back stack
      // @ts-ignore
      navigation.navigate('MainTabs', {
        screen: 'HomeTab',
        params: { screen: 'Home' },
      });
    }
  };
}
