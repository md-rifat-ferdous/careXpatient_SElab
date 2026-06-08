import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth.store';
import { LogOut, Calendar, Beaker, FileText, Settings, ArrowRight } from 'lucide-react-native';
import { theme } from '../../lib/theme';

export default function PatientDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const features = [
    { title: 'Book Appointment', icon: <Calendar color={theme.colors.primary} />, bg: theme.colors.primary + '10', href: 'Appointments' },
    { title: 'Lab Orders', icon: <Beaker color={theme.colors.alertInfo} />, bg: theme.colors.alertInfo + '10' },
    { title: 'Medical Records', icon: <FileText color={theme.colors.primary} />, bg: theme.colors.primary + '10', href: 'PrescriptionList' },
    { title: 'Settings', icon: <Settings color={theme.colors.textMuted} />, bg: theme.colors.surfaceMuted },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Typography variant="small" color={theme.colors.textMuted}>Welcome back 👋</Typography>
          <Typography variant="h2">{user?.fullName || 'Rahim Ali'}</Typography>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} color={theme.colors.alertCritical} />
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
            <TouchableOpacity 
              key={f.title} 
              style={styles.gridItem}
              onPress={() => f.href && navigation.navigate(f.href)}
            >
              <Card style={styles.actionCard}>
                <View style={[styles.iconBox, { backgroundColor: f.bg }]}>{f.icon}</View>
                <Typography variant="small" style={styles.actionLabel}>{f.title}</Typography>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.devCard}>
          <Typography variant="small" color={theme.colors.textMuted}>🚧 Dashboard under construction</Typography>
          <Typography variant="small" color={theme.colors.textMuted} style={{ marginTop: 4 }}>Full features coming soon to your careXpatient mobile app.</Typography>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceMuted },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  logoutButton: { padding: 8, borderRadius: 12, backgroundColor: theme.colors.alertCritical + '10' },
  content: { padding: 24 },
  banner: { 
    backgroundColor: theme.colors.primary, 
    padding: 20, 
    marginBottom: 24, 
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sectionTitle: { marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%' },
  actionCard: { alignItems: 'center', padding: 16, ...theme.shadows.soft },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionLabel: { fontWeight: '600', textAlign: 'center' },
  devCard: { marginTop: 24, backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.borderSoft },
});
