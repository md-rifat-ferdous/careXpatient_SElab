import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  User,
  FileText as FileTextRaw,
  ClipboardList as ClipboardListRaw,
  ChevronLeft as ChevronLeftRaw,
  ChevronRight as ChevronRightRaw,
  Phone as PhoneRaw,
  Mail as MailRaw,
  Activity as ActivityRaw,
  Heart as HeartRaw,
  Thermometer as ThermometerRaw
} from 'lucide-react-native';

const FileText = FileTextRaw as any;
const ClipboardList = ClipboardListRaw as any;
const ChevronLeft = ChevronLeftRaw as any;
const ChevronRight = ChevronRightRaw as any;
const Phone = PhoneRaw as any;
const Mail = MailRaw as any;
const Activity = ActivityRaw as any;
const Heart = HeartRaw as any;
const Thermometer = ThermometerRaw as any;
import { ScreenLayout } from '../../components/ScreenLayout';
import { COLORS, SPACING, RADIUS } from '../../theme/theme';

export const PatientFolderScreen = ({ navigation, route }: any) => {
  return (
    <ScreenLayout>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={20} color={COLORS.textMuted} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileId}>ID: #PT-001</Text>
          </View>
        </View>

        <View style={styles.contactInfo}>
          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Phone size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.contactText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Mail size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.contactText}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.vitalsContainer}>
        <View style={[styles.vitalCard, { borderLeftColor: '#EF4444' }]}>
          <Heart size={20} color="#EF4444" />
          <Text style={styles.vitalValue}>72</Text>
          <Text style={styles.vitalLabel}>bpm</Text>
        </View>
        <View style={[styles.vitalCard, { borderLeftColor: '#3B82F6' }]}>
          <Activity size={20} color="#3B82F6" />
          <Text style={styles.vitalValue}>120/80</Text>
          <Text style={styles.vitalLabel}>mmHg</Text>
        </View>
        <View style={[styles.vitalCard, { borderLeftColor: '#F59E0B' }]}>
          <Thermometer size={20} color="#F59E0B" />
          <Text style={styles.vitalValue}>98.6</Text>
          <Text style={styles.vitalLabel}>°F</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Records</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Reports')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#F0F9FF' }]}>
            <FileText size={20} color="#0369A1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Laboratory Reports</Text>
            <Text style={styles.menuSub}>View and download test results</Text>
          </View>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Prescriptions')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#F0FDF4' }]}>
            <ClipboardList size={20} color="#15803D" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Prescriptions</Text>
            <Text style={styles.menuSub}>Current and past prescriptions</Text>
          </View>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  profileInfo: {
    marginLeft: SPACING.md,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileId: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  contactInfo: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  contactItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  contactIcon: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    fontWeight: 'medium',
    color: COLORS.text,
  },
  vitalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  vitalLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  section: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'semibold',
    color: COLORS.text,
  },
  menuSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
