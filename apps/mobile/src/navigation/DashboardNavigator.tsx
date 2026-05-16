import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyPatientsScreen } from '../screens/dashboard/MyPatientsScreen';
import { PatientFolderScreen } from '../screens/dashboard/PatientFolderScreen';
import { ReportsScreen } from '../screens/dashboard/ReportsScreen';
import { PrescriptionsScreen } from '../screens/dashboard/PrescriptionsScreen';

const Stack = createNativeStackNavigator();

export const DashboardNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' }
      }}
    >
      <Stack.Screen name="MyPatients" component={MyPatientsScreen} />
      <Stack.Screen name="PatientFolder" component={PatientFolderScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} />
    </Stack.Navigator>
  );
};
