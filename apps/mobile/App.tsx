import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import PatientDashboardScreen from './src/screens/dashboard/PatientDashboardScreen';
import PrescriptionListScreen from './src/screens/prescriptions/PrescriptionListScreen';
import PrescriptionDetailScreen from './src/screens/prescriptions/PrescriptionDetailScreen';
import { theme } from './src/lib/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Dashboard"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.surfaceMuted }
          }}
        >
          <Stack.Screen name="Dashboard" component={PatientDashboardScreen} />
          <Stack.Screen name="PrescriptionList" component={PrescriptionListScreen} />
          <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
