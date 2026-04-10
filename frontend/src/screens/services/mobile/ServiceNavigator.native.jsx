import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ServicesHome from '../web/ServicesHome';
import CustomerHome from './CustomerHome.native';
import SearchingScreen from './SearchingScreen.native';
import OperatorFoundScreen from './OperatorFoundScreen.native';
import JobActiveScreen from './JobActiveScreen.native';
import JobCompleteScreen from './JobCompleteScreen.native';
import OperatorHome from './OperatorHome.native';
import NavigateToFarmerScreen from './NavigateToFarmerScreen.native';
import OperatorJobActiveScreen from './OperatorJobActiveScreen.native';

const Stack = createNativeStackNavigator();

export default function ServiceNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1A1A2E' }
      }}
      initialRouteName="ServicesHome"
    >
      <Stack.Screen name="ServicesHome" component={ServicesHome} />
      <Stack.Screen name="CustomerHome" component={CustomerHome} />
      <Stack.Screen name="SearchingScreen" component={SearchingScreen} />
      <Stack.Screen name="OperatorFoundScreen" component={OperatorFoundScreen} />
      <Stack.Screen name="JobActiveScreen" component={JobActiveScreen} />
      <Stack.Screen name="JobCompleteScreen" component={JobCompleteScreen} />
      <Stack.Screen name="OperatorHome" component={OperatorHome} />
      <Stack.Screen name="NavigateToFarmerScreen" component={NavigateToFarmerScreen} />
      <Stack.Screen name="OperatorJobActiveScreen" component={OperatorJobActiveScreen} />
    </Stack.Navigator>
  );
}
