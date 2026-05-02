import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/ui/Typography';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useSignupStore } from '../../../store/auth.store';

const STEPS = ['Account', 'Personal', 'Medical'];

export default function PatientSignupScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const { data, updateData } = useSignupStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSignup();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSignup = () => {
    setIsLoading(true);
    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('SignupSuccess');
    }, 2000);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={step} style={styles.stepItem}>
          <View style={[
            styles.stepCircle, 
            index <= currentStep ? styles.stepCircleActive : null,
            index < currentStep ? styles.stepCircleCompleted : null
          ]}>
            {index < currentStep ? (
              <Check size={14} color="white" />
            ) : (
              <Typography variant="small" color={index === currentStep ? "white" : "#94A3B8"} style={styles.stepNumber}>
                {index + 1}
              </Typography>
            )}
          </View>
          <Typography variant="small" style={[styles.stepLabel, index === currentStep ? styles.stepLabelActive : null]}>
            {step}
          </Typography>
          {index < STEPS.length - 1 && (
            <View style={[styles.stepLine, index < currentStep ? styles.stepLineActive : null]} />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Typography variant="h3">Patient Sign Up</Typography>
        <View style={{ width: 24 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {currentStep === 0 && (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.sectionTitle}>Account Information</Typography>
            <Input 
              label="Full Name"
              placeholder="Enter your full name"
              value={data.fullName}
              onChangeText={(text) => updateData({ fullName: text })}
            />
            <Input 
              label="Phone Number"
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
              value={data.phone}
              onChangeText={(text) => updateData({ phone: text })}
            />
            <Input 
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={data.password}
              onChangeText={(text) => updateData({ password: text })}
            />
            <Input 
              label="Confirm Password"
              placeholder="••••••••"
              secureTextEntry
            />
          </View>
        )}

        {currentStep === 1 && (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.sectionTitle}>Personal Details</Typography>
            <Input 
              label="Date of Birth"
              placeholder="DD/MM/YYYY"
              value={data.dob}
              onChangeText={(text) => updateData({ dob: text })}
            />
            <Input 
              label="Blood Group"
              placeholder="e.g. A+"
              value={data.bloodGroup}
              onChangeText={(text) => updateData({ bloodGroup: text })}
            />
            <Input 
              label="NID Number (Optional)"
              placeholder="National ID number"
              value={data.nid}
              onChangeText={(text) => updateData({ nid: text })}
            />
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.sectionTitle}>Medical History</Typography>
            <Input 
              label="Known Allergies"
              placeholder="e.g. Peanuts, Penicillin"
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
              value={data.allergies}
              onChangeText={(text) => updateData({ allergies: text })}
            />
            <Input 
              label="Chronic Conditions"
              placeholder="e.g. Diabetes, Hypertension"
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
              value={data.chronicConditions}
              onChangeText={(text) => updateData({ chronicConditions: text })}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={currentStep === STEPS.length - 1 ? "Complete Registration" : "Next Step"}
          onPress={handleNext}
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  navBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  backButton: { padding: 4 },
  stepIndicator: { 
    flexDirection: 'row', 
    paddingHorizontal: 24, 
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepCircle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: 'white', 
    borderWidth: 2, 
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepCircleActive: { borderColor: '#14B8A6', backgroundColor: '#14B8A6' },
  stepCircleCompleted: { backgroundColor: '#14B8A6', borderColor: '#14B8A6' },
  stepNumber: { fontWeight: 'bold' },
  stepLabel: { marginTop: 6, color: '#94A3B8', fontWeight: '500', fontSize: 12 },
  stepLabelActive: { color: '#14B8A6' },
  stepLine: { 
    position: 'absolute', 
    top: 14, 
    left: '50%', 
    width: '100%', 
    height: 2, 
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepLineActive: { backgroundColor: '#14B8A6' },
  scrollContent: { padding: 24 },
  formSection: { gap: 8 },
  sectionTitle: { marginBottom: 20 },
  footer: { 
    padding: 24, 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0' 
  },
});
