import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import PatientSignupScreen from '../screens/auth/signup/PatientSignupScreen';
import DoctorSignupScreen from '../screens/auth/signup/DoctorSignupScreen';
import LabSignupScreen from '../screens/auth/signup/LabSignupScreen';
import SignupSuccessScreen from '../screens/auth/signup/SignupSuccessScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="PatientSignup" component={PatientSignupScreen} />
      <Stack.Screen name="DoctorSignup" component={DoctorSignupScreen} />
      <Stack.Screen name="LabSignup" component={LabSignupScreen} />
      <Stack.Screen name="SignupSuccess" component={SignupSuccessScreen} />
    </Stack.Navigator>
  );
}

