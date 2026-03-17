import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ServicesHomeScreen from '../screens/ServicesHomeScreen';
import Profile from '../screens/Profile';
import PlantAnalyzer from '../screens/PlantAnalyzer';
import CropRecommendation from '../screens/CropRecommendation';
import Chatbot from '../screens/Chatbot';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreateListing from '../screens/CreateListing';

export type RootStackParamList = {
  MainTabs: undefined;
  PlantAnalyzer: undefined;
  CropRecommendation: undefined;
  Chatbot: undefined;
  PostDetail: { postId: string };
  CreateListing: undefined;
};

type TabParamList = {
  Home: undefined;
  Community: undefined;
  Services: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#1B5E20',
        tabBarInactiveTintColor: '#90A4AE',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8F0E9',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconWrapper : styles.inactiveIconWrapper}>
              <Text style={styles.tabIcon}>🏠</Text>
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconWrapper : styles.inactiveIconWrapper}>
              <Text style={styles.tabIcon}>👥</Text>
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesHomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconWrapper : styles.inactiveIconWrapper}>
              <Text style={styles.tabIcon}>🛠️</Text>
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconWrapper : styles.inactiveIconWrapper}>
              <Text style={styles.tabIcon}>👤</Text>
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="PlantAnalyzer" component={PlantAnalyzer} />
      <Stack.Screen name="CropRecommendation" component={CropRecommendation} />
      <Stack.Screen name="Chatbot" component={Chatbot} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreateListing" component={CreateListing} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  activeIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
    marginTop: 2,
  },
});
