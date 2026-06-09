import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Typography } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, Smartphone, Lock } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      // navigation.navigate('Dashboard');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Typography variant="h2" color="white">cXp</Typography>
            </View>
          </View>
          <Typography variant="h1" style={styles.title}>
            care<Typography variant="h1" color="#0EA5E9">X</Typography>patient
          </Typography>
          <Typography variant="body" style={styles.subtitle}>The Empathetic Expert in Healthcare</Typography>
        </View>

        <View style={styles.formCard}>
          <Typography variant="h2" style={styles.formTitle}>Welcome back</Typography>
          <Typography variant="small" style={styles.formSubtitle}>Sign in to access your health dashboard</Typography>

          <View style={styles.form}>
            <Input 
              label="Phone Number"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.passwordContainer}>
              <Input 
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Typography variant="small" color="#0EA5E9" style={styles.forgotText}>Forgot password?</Typography>
            </TouchableOpacity>

            <Button 
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => navigation.navigate('RoleSelection')}
          >
            <Typography variant="small" color="#64748B">
              Don't have an account? <Typography variant="small" color="#14B8A6" style={styles.boldText}>Sign Up</Typography>
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  logo: { 
    width: 60, 
    height: 60, 
    borderRadius: 18, 
    backgroundColor: '#14B8A6', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  title: { fontSize: 32 },
  subtitle: { marginTop: 4, color: '#94A3B8' },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: { marginBottom: 4 },
  formSubtitle: { marginBottom: 24 },
  form: { width: '100%' },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 4,
  },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 24 },
  forgotText: { fontWeight: '600' },
  footer: { marginTop: 32, alignItems: 'center' },
  signupButton: { padding: 8 },
  boldText: { fontWeight: 'bold' },
});

