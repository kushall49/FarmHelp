/**
 * Navigation Type Definitions
 * 
 * Defines TypeScript types for all navigation routes and parameters.
 * This enables type-safe navigation with autocomplete and compile-time checks.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';

// ============================================================================
// ROOT STACK - Top level (Auth + MainTabs)
// ============================================================================

export type RootStackParamList = {
  // Auth Screens (before login)
  Login: undefined;
  Signup: undefined;
  
  // Main App (after login) - Nested Tab Navigator
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
};

// ============================================================================
// MAIN TAB NAVIGATOR - Bottom tabs (Home, Community, Profile)
// ============================================================================

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  CommunityTab: NavigatorScreenParams<CommunityStackParamList> | undefined;
  ProfileTab: undefined;
};

// ============================================================================
// HOME STACK - Home screen + feature screens
// ============================================================================

export type HomeStackParamList = {
  Home: undefined;
  PlantAnalyzer: undefined;
  Chatbot: undefined;
  CropRecommendation: undefined;
};

// ============================================================================
// COMMUNITY STACK - Community feed + posts + profiles
// ============================================================================

export type CommunityStackParamList = {
  Community: undefined;
  CreatePost: undefined;
  PostDetail: { postId: string };
  UserProfile: { userId: string };
};

// NAVIGATION PROP TYPES - For components
// ============================================================================

// Root Stack Navigation Props
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Home Stack Navigation Props
export type HomeStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

// Community Stack Navigation Props
export type CommunityStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CommunityStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

// Profile Tab Navigation Props
export type ProfileTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

// ============================================================================
// ROUTE PROP TYPES - For components receiving route params
// ============================================================================

import type { RouteProp } from '@react-navigation/native';

export type PostDetailRouteProp = RouteProp<CommunityStackParamList, 'PostDetail'>;
export type UserProfileRouteProp = RouteProp<CommunityStackParamList, 'UserProfile'>;

// ============================================================================
// HELPER TYPE FOR DEEP LINKING
// ============================================================================

export type NavigationState = {
  canGoBack: boolean;
  currentRoute?: string;
};
