import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlantAnalyzer from './screens/PlantAnalyzer';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PlantAnalyzer">
        <Stack.Screen 
          name="PlantAnalyzer" 
          component={PlantAnalyzer}
          options={{ title: 'Plant Health Analyzer' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
