import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth.store';
import { LogOut, Calendar, Beaker, FileText, Settings } from 'lucide-react-native';

export default function PatientDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const features = [
    { title: 'Book Appointment', icon: <Calendar color="#14B8A6" />, bg: '#F0FDFA' },
    { title: 'Lab Orders', icon: <Beaker color="#0EA5E9" />, bg: '#F0F9FF' },
    { title: 'Medical Records', icon: <FileText color="#8B5CF6" />, bg: '#F5F3FF' },
    { title: 'Settings', icon: <Settings color="#64748B" />, bg: '#F8FAFC' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Typography variant="small" color="#94A3B8">Welcome back 👋</Typography>
          <Typography variant="h2">{user?.fullName || 'Patient'}</Typography>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.banner}>
          <Typography variant="h3" color="white">Health is Wealth</Typography>
          <Typography variant="small" color="white" style={{ marginTop: 4 }}>Check your latest medical reports and upcoming appointments.</Typography>
        </Card>

        <Typography variant="h3" style={styles.sectionTitle}>Quick Actions</Typography>
        <View style={styles.grid}>
          {features.map((f) => (
            <TouchableOpacity key={f.title} style={styles.gridItem}>
              <Card style={styles.actionCard}>
                <View style={[styles.iconBox, { backgroundColor: f.bg }]}>{f.icon}</View>
                <Typography variant="small" style={styles.actionLabel}>{f.title}</Typography>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.devCard}>
          <Typography variant="small" color="#B45309">🚧 Dashboard under construction</Typography>
          <Typography variant="small" color="#D97706" style={{ marginTop: 4 }}>Full features coming soon to your careXpatient mobile app.</Typography>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logoutButton: { padding: 8, borderRadius: 12, backgroundColor: '#FEF2F2' },
  content: { padding: 24 },
  banner: { 
    backgroundColor: '#14B8A6', 
    padding: 20, 
    marginBottom: 24, 
    borderWidth: 0,
    shadowColor: '#14B8A6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sectionTitle: { marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%' },
  actionCard: { alignItems: 'center', padding: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionLabel: { fontWeight: '600', textAlign: 'center' },
  devCard: { marginTop: 24, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
});
