import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CropRecommendation from './src/screens/CropRecommendation';
import PlantAnalyzer from './src/screens/PlantAnalyzer';
import Chatbot from './src/screens/Chatbot';
import Profile from './src/screens/Profile';
import CommunityScreen from './src/screens/CommunityScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';

// Services Marketplace Screens
import ServicesHomeScreen from './src/screens/ServicesHomeScreen';
import ServiceDetailsScreen from './src/screens/ServiceDetailsScreen';
import JobDetailsScreen from './src/screens/JobDetailsScreen';
import CreateListingScreen from './src/screens/CreateListingScreen';
import CreateJobRequestScreen from './src/screens/CreateJobRequestScreen';
import MyListingsScreen from './src/screens/MyListingsScreen';
import RateProviderScreen from './src/screens/RateProviderScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CropRecommendation" component={CropRecommendation} />
          <Stack.Screen name="PlantAnalyzer" component={PlantAnalyzer} />
          <Stack.Screen name="Chatbot" component={Chatbot} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen 
            name="Community" 
            component={CommunityScreen}
            options={{ title: 'Farm Community' }}
          />
          <Stack.Screen 
            name="CreatePost" 
            component={CreatePostScreen}
            options={{ title: 'Create Post' }}
          />
          <Stack.Screen 
            name="PostDetail" 
            component={PostDetailScreen}
            options={{ title: 'Post Details' }}
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen}
            options={{ title: 'User Profile' }}
          />
          
          {/* Services Marketplace Screens */}
          <Stack.Screen 
            name="ServicesHome" 
            component={ServicesHomeScreen}
            options={{ title: 'Services Marketplace' }}
          />
          <Stack.Screen 
            name="ServiceDetails" 
            component={ServiceDetailsScreen}
            options={{ title: 'Service Details' }}
          />
          <Stack.Screen 
            name="JobDetails" 
            component={JobDetailsScreen}
            options={{ title: 'Job Details' }}
          />
          <Stack.Screen 
            name="CreateListing" 
            component={CreateListingScreen}
            options={{ title: 'Create Service Listing' }}
          />
          <Stack.Screen 
            name="CreateJobRequest" 
            component={CreateJobRequestScreen}
            options={{ title: 'Post Job Request' }}
          />
          <Stack.Screen 
            name="MyListings" 
            component={MyListingsScreen}
            options={{ title: 'My Listings' }}
          />
          <Stack.Screen 
            name="RateProvider" 
            component={RateProviderScreen}
            options={{ title: 'Rate Provider' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
