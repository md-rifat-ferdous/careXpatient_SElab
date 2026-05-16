import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { DashboardNavigator } from './src/navigation/DashboardNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <DashboardNavigator />
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
