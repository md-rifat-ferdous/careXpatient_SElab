import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { ChevronRight, User, Stethoscope, Beaker } from 'lucide-react-native';

export default function RoleSelectionScreen({ navigation }: any) {
  const roles = [
    { 
      id: 'Patient', 
      title: 'Patient', 
      desc: 'Book appointments, view medical records & get prescriptions.',
      icon: <User size={24} color="#14B8A6" />,
      bg: '#F0FDFA',
      borderColor: '#14B8A6'
    },
    { 
      id: 'Doctor', 
      title: 'Doctor', 
      desc: 'Manage your practice, consult patients & write prescriptions.',
      icon: <Stethoscope size={24} color="#0EA5E9" />,
      bg: '#F0F9FF',
      borderColor: '#0EA5E9'
    },
    { 
      id: 'Lab', 
      title: 'Diagnostic Lab', 
      desc: 'Receive lab test orders and manage reports efficiently.',
      icon: <Beaker size={24} color="#10B981" />,
      bg: '#ECFDF5',
      borderColor: '#10B981'
    }
  ];

  const handleSelectRole = (roleId: string) => {
    navigation.navigate(`${roleId}Signup`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant="h1">Join careXpatient</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Select your account type to get started with our empathetic healthcare platform.
          </Typography>
        </View>

        <View style={styles.list}>
          {roles.map((role) => (
            <TouchableOpacity 
              key={role.id} 
              activeOpacity={0.8}
              onPress={() => handleSelectRole(role.id)}
            >
              <Card style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: role.bg }]}>
                  {role.icon}
                </View>
                <View style={styles.cardInfo}>
                  <Typography variant="h3">{role.title}</Typography>
                  <Typography variant="small" style={styles.cardDesc}>{role.desc}</Typography>
                </View>
                <ChevronRight size={20} color="#94A3B8" />
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Typography variant="small" color="#64748B" style={styles.backText}>
            Already have an account? <Typography variant="small" color="#14B8A6" style={styles.boldText}>Sign In</Typography>
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { marginTop: 40, marginBottom: 32 },
  subtitle: { marginTop: 8, lineHeight: 22 },
  list: { gap: 16 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: 'white',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: { flex: 1 },
  cardDesc: { marginTop: 2, lineHeight: 18 },
  backButton: { marginTop: 40, alignItems: 'center' },
  backText: { fontSize: 15 },
  boldText: { fontWeight: 'bold' },
});

