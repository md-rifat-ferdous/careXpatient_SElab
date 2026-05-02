import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/ui/Typography';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ChevronLeft, Check, Camera } from 'lucide-react-native';
import { useSignupStore } from '../../../store/auth.store';

const STEPS = ['Account', 'Professional', 'Verification'];

export default function DoctorSignupScreen({ navigation }: any) {
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
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('SignupSuccess');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Typography variant="h3">Doctor Sign Up</Typography>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepIndicator}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View style={[
              styles.stepCircle, 
              index <= currentStep ? styles.stepCircleActive : null,
              index < currentStep ? styles.stepCircleCompleted : null
            ]}>
              {index < currentStep ? <Check size={14} color="white" /> : <Typography variant="small" color={index === currentStep ? "white" : "#94A3B8"}>{index + 1}</Typography>}
            </View>
            <Typography variant="small" style={[styles.stepLabel, index === currentStep ? styles.stepLabelActive : null]}>{step}</Typography>
            {index < STEPS.length - 1 && <View style={[styles.stepLine, index < currentStep ? styles.stepLineActive : null]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {currentStep === 0 && (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.sectionTitle}>Account Information</Typography>
            <Input label="Dr. Full Name" placeholder="Dr. Jane Smith" value={data.fullName} onChangeText={(text) => updateData({ fullName: text })} />
            <Input label="Phone Number" placeholder="01XXXXXXXXX" keyboardType="phone-pad" value={data.phone} onChangeText={(text) => updateData({ phone: text })} />
            <Input label="Email Address" placeholder="jane@example.com" keyboardType="email-address" value={data.email} onChangeText={(text) => updateData({ email: text })} />
            <Input label="Password" placeholder="••••••••" secureTextEntry value={data.password} onChangeText={(text) => updateData({ password: text })} />
          </View>
        )}

        {currentStep === 1 && (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.sectionTitle}>Professional Details</Typography>
            <Input label="BMDC Registration Number" placeholder="e.g. A-12345" value={data.bmdcNumber} onChangeText={(text) => updateData({ bmdcNumber: text })} />
            <Input label="Specialization" placeholder="e.g. Cardiologist" value={data.specialty} onChangeText={(text) => updateData({ specialty: text })} />
            <Input label="Experience (Years)" placeholder="e.g. 10" keyboardType="numeric" value={data.experience} onChangeText={(text) => updateData({ experience: text })} />
            <Input label="Consultation Fee (BDT)" placeholder="e.g. 800" keyboardType="numeric" value={data.fee} onChangeText={(text) => updateData({ fee: text })} />
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.sectionTitle}>Identity Verification</Typography>
            <Typography variant="body" style={styles.instruction}>Please upload your BMDC certificate and a professional photo for verification.</Typography>
            
            <TouchableOpacity style={styles.uploadBox}>
              <Camera size={32} color="#94A3B8" />
              <Typography variant="body" color="#94A3B8" style={{ marginTop: 8 }}>Upload BMDC Certificate</Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBox}>
              <Camera size={32} color="#94A3B8" />
              <Typography variant="body" color="#94A3B8" style={{ marginTop: 8 }}>Upload Profile Photo</Typography>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title={currentStep === STEPS.length - 1 ? "Submit for Approval" : "Next Step"} onPress={handleNext} loading={isLoading} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: 'white' },
  backButton: { padding: 4 },
  stepIndicator: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'white', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  stepCircleActive: { borderColor: '#0EA5E9', backgroundColor: '#0EA5E9' },
  stepCircleCompleted: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' },
  stepLabel: { marginTop: 6, color: '#94A3B8', fontWeight: '500', fontSize: 12 },
  stepLabelActive: { color: '#0EA5E9' },
  stepLine: { position: 'absolute', top: 14, left: '50%', width: '100%', height: 2, backgroundColor: '#E2E8F0', zIndex: 1 },
  stepLineActive: { backgroundColor: '#0EA5E9' },
  scrollContent: { padding: 24 },
  formSection: { gap: 8 },
  sectionTitle: { marginBottom: 20 },
  instruction: { marginBottom: 16, color: '#64748B' },
  uploadBox: { height: 120, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16, backgroundColor: '#F1F5F9' },
  footer: { padding: 24, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
});
