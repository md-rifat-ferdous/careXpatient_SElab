import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/ui/Typography';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ChevronLeft, Check, UploadCloud } from 'lucide-react-native';
import { useSignupStore } from '../../../store/auth.store';

const STEPS = ['Account', 'Lab Details', 'Verification'];

export default function LabSignupScreen({ navigation }: any) {
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
        <Typography variant="h3">Lab Registration</Typography>
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
            <Typography variant="h2" style={styles.sectionTitle}>Account Manager</Typography>
            <Input label="Manager Full Name" placeholder="John Doe" value={data.fullName} onChangeText={(text) => updateData({ fullName: text })} />
            <Input label="Business Phone" placeholder="01XXXXXXXXX" keyboardType="phone-pad" value={data.phone} onChangeText={(text) => updateData({ phone: text })} />
            <Input label="Business Email" placeholder="lab@example.com" keyboardType="email-address" value={data.email} onChangeText={(text) => updateData({ email: text })} />
            <Input label="Password" placeholder="••••••••" secureTextEntry value={data.password} onChangeText={(text) => updateData({ password: text })} />
          </View>
        )}

        {currentStep === 1 && (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.sectionTitle}>Lab Information</Typography>
            <Input label="Lab Name" placeholder="e.g. Modern Diagnostic Center" value={data.labName} onChangeText={(text) => updateData({ labName: text })} />
            <Input label="Lab Address" placeholder="Street, Area, City" multiline value={data.address} onChangeText={(text) => updateData({ address: text })} />
            <Input label="DGHS License No." placeholder="e.g. 12345678" value={data.licenseNo} onChangeText={(text) => updateData({ licenseNo: text })} />
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.sectionTitle}>Document Upload</Typography>
            <Typography variant="body" style={styles.instruction}>Please upload your Trade License and DGHS Approval documents.</Typography>
            
            <TouchableOpacity style={styles.uploadBox}>
              <UploadCloud size={32} color="#10B981" />
              <Typography variant="body" color="#10B981" style={{ marginTop: 8 }}>Upload Trade License</Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBox}>
              <UploadCloud size={32} color="#10B981" />
              <Typography variant="body" color="#10B981" style={{ marginTop: 8 }}>Upload DGHS Approval</Typography>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title={currentStep === STEPS.length - 1 ? "Register Lab" : "Next Step"} onPress={handleNext} loading={isLoading} style={{ backgroundColor: '#10B981' }} />
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
  stepCircleActive: { borderColor: '#10B981', backgroundColor: '#10B981' },
  stepCircleCompleted: { backgroundColor: '#10B981', borderColor: '#10B981' },
  stepLabel: { marginTop: 6, color: '#94A3B8', fontWeight: '500', fontSize: 12 },
  stepLabelActive: { color: '#10B981' },
  stepLine: { position: 'absolute', top: 14, left: '50%', width: '100%', height: 2, backgroundColor: '#E2E8F0', zIndex: 1 },
  stepLineActive: { backgroundColor: '#10B981' },
  scrollContent: { padding: 24 },
  formSection: { gap: 8 },
  sectionTitle: { marginBottom: 20 },
  instruction: { marginBottom: 16, color: '#64748B' },
  uploadBox: { height: 120, borderStyle: 'dashed', borderWidth: 2, borderColor: '#10B981', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16, backgroundColor: '#F0FDF4' },
  footer: { padding: 24, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
});
