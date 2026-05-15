import React, { useState } from 'react';
import { View } from 'react-native';
import PrescriptionListScreen from './src/screens/prescriptions/PrescriptionListScreen';
import PrescriptionDetailScreen from './src/screens/prescriptions/PrescriptionDetailScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('list');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const mockNavigation = {
    navigate: (screen: string, params?: any) => {
      setCurrentScreen(screen);
      if (params && params.id) setSelectedId(params.id);
    },
    goBack: () => setCurrentScreen('list')
  };

  return (
    <View style={{ flex: 1 }}>
      {currentScreen === 'list' ? (
        <PrescriptionListScreen navigation={mockNavigation} />
      ) : (
        <PrescriptionDetailScreen route={{ params: { id: selectedId } }} navigation={mockNavigation} />
      )}
    </View>
  );
}
