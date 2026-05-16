import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {
  FileText as FileTextRaw,
  Download as DownloadRaw,
  ChevronLeft as ChevronLeftRaw,
  Calendar as CalendarRaw,
  Building2 as Building2Raw
} from 'lucide-react-native';

const FileText = FileTextRaw as any;
const Download = DownloadRaw as any;
const ChevronLeft = ChevronLeftRaw as any;
const Calendar = CalendarRaw as any;
const Building2 = Building2Raw as any;
import { ScreenLayout } from '../../components/ScreenLayout';
import { COLORS, SPACING, RADIUS } from '../../theme/theme';

const reports = [
  { id: '1', name: 'Complete Blood Count (CBC)', date: '12 May, 2024', lab: 'Central Diagnostic Lab', status: 'Final' },
  { id: '2', name: 'Lipid Profile', date: '10 May, 2024', lab: 'Bio-Chem Lab Services', status: 'Final' },
  { id: '3', name: 'Chest X-Ray', date: '15 Jan, 2024', lab: 'City Medical Center', status: 'Archived' },
];

export const ReportsScreen = ({ navigation }: any) => {
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.iconContainer}>
          <FileText size={24} color={COLORS.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.infoRow}>
            <Calendar size={12} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{item.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Building2 size={12} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{item.lab}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Final' ? '#F0FDF4' : '#F8FAFC' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Final' ? '#16A34A' : '#64748B' }]}>{item.status}</Text>
        </View>
        <TouchableOpacity style={styles.downloadButton}>
          <Download size={18} color={COLORS.primary} />
          <Text style={styles.downloadText}>Download</Text>
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

      <Text style={styles.title}>Medical Reports</Text>

      <FlatList
        data={reports}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
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
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadText: {
    fontSize: 12,
    fontWeight: 'semibold',
    color: COLORS.primary,
  },
});
