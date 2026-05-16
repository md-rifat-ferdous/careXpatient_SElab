import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {
  ClipboardList as ClipboardListRaw,
  Download as DownloadRaw,
  Printer as PrinterRaw,
  ChevronLeft as ChevronLeftRaw,
  Calendar as CalendarRaw,
  Pill as PillRaw
} from 'lucide-react-native';

const ClipboardList = ClipboardListRaw as any;
const Download = DownloadRaw as any;
const Printer = PrinterRaw as any;
const ChevronLeft = ChevronLeftRaw as any;
const Calendar = CalendarRaw as any;
const Pill = PillRaw as any;
import { ScreenLayout } from '../../components/ScreenLayout';
import { COLORS, SPACING, RADIUS } from '../../theme/theme';

const prescriptions = [
  { id: '1', date: '10 May, 2024', doctor: 'Dr. Sarah Johnson', meds: ['Atenolol 25mg', 'Atorvastatin 10mg'], status: 'Active' },
  { id: '2', date: '15 Jan, 2024', doctor: 'Dr. Sarah Johnson', meds: ['Paracetamol 500mg'], status: 'Completed' },
];

export const PrescriptionsScreen = ({ navigation }: any) => {
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <ClipboardList size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.pxTitle}>Prescription #{item.id}</Text>
          <Text style={styles.date}>{item.date} • {item.doctor}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#F0FDFA' : '#F8FAFC' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Active' ? '#0D9488' : '#64748B' }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.medsList}>
        {item.meds.map((med: string, i: number) => (
          <View key={i} style={styles.medItem}>
            <Pill size={12} color={COLORS.textMuted} />
            <Text style={styles.medText}>{med}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Printer size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Download size={18} color={COLORS.primary} />
          <Text style={styles.actionText}>Download PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenLayout scrollable={false}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={20} color={COLORS.textMuted} />
        <Text style={styles.backText}>Patient Folder</Text>
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Prescriptions</Text>
        <TouchableOpacity style={styles.newButton}>
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={prescriptions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  backText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  newButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  newButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  pxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  medsList: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  medText: {
    fontSize: 11,
    color: COLORS.text,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
