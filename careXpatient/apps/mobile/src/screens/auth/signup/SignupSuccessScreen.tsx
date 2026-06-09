import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Typography } from '../../../components/ui/Typography';
import { Button } from '../../../components/ui/Button';
import { CheckCircle2, Home } from 'lucide-react-native';

export default function SignupSuccessScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle2 size={80} color="#14B8A6" />
        </View>
        
        <Typography variant="h1" style={styles.title}>Registration Successful!</Typography>
        <Typography variant="body" style={styles.subtitle}>
          Welcome to careXpatient. Your account has been created successfully. 
          {'\n\n'}
          If you registered as a Doctor or Lab, our team will review your credentials within 24-48 hours.
        </Typography>

        <View style={styles.cardContainer}>
          <View style={styles.benefitItem}>
            <Typography variant="body">🏥 Book appointments easily</Typography>
          </View>
          <View style={styles.benefitItem}>
            <Typography variant="body">📋 Access your medical records</Typography>
          </View>
          <View style={styles.benefitItem}>
            <Typography variant="body">🧪 Get lab results on your phone</Typography>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Go to Login" 
          onPress={() => navigation.navigate('Login')} 
        />
        <TouchableOpacity 
          style={styles.homeLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Typography variant="small" color="#94A3B8">Back to Home</Typography>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconContainer: { marginBottom: 32 },
  title: { textAlign: 'center', marginBottom: 16 },
  subtitle: { textAlign: 'center', color: '#64748B', lineHeight: 24, marginBottom: 32 },
  cardContainer: { width: '100%', gap: 12 },
  benefitItem: { 
    backgroundColor: '#F8FAFC', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  footer: { padding: 24, gap: 16 },
  homeLink: { alignItems: 'center' },
});
