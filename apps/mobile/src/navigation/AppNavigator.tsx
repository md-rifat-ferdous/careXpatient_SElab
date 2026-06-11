import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PatientDashboardScreen from '../screens/dashboard/PatientDashboardScreen';
import PrescriptionListScreen from '../screens/prescriptions/PrescriptionListScreen';
import PrescriptionDetailScreen from '../screens/prescriptions/PrescriptionDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PatientDashboard" component={PatientDashboardScreen} />
      <Stack.Screen name="PrescriptionList" component={PrescriptionListScreen} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
    </Stack.Navigator>
  );
}
