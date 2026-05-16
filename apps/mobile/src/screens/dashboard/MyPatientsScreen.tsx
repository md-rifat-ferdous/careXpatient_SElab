import React from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import {
  Search as SearchRaw,
  Filter as FilterRaw,
  Plus as PlusRaw,
  ChevronRight as ChevronRightRaw
} from 'lucide-react-native';

const Search = SearchRaw as any;
const Filter = FilterRaw as any;
const Plus = PlusRaw as any;
const ChevronRight = ChevronRightRaw as any;
import { ScreenLayout } from '../../components/ScreenLayout';
import { COLORS, SPACING, RADIUS } from '../../theme/theme';

const patients = [
  { id: '1', name: 'John Doe', age: 45, gender: 'Male', lastVisit: '10 May, 2024', status: 'Regular' },
  { id: '2', name: 'Jane Smith', age: 32, gender: 'Female', lastVisit: '12 May, 2024', status: 'Follow-up' },
  { id: '3', name: 'Robert Brown', age: 58, gender: 'Male', lastVisit: '15 May, 2024', status: 'New' },
  { id: '4', name: 'Emily Davis', age: 27, gender: 'Female', lastVisit: '08 May, 2024', status: 'Regular' },
];

export const MyPatientsScreen = ({ navigation }: any) => {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PatientFolder', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientSub}>{item.age} Yrs • {item.gender}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Regular' ? '#F0FDF4' : '#EFF6FF' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Regular' ? '#16A34A' : '#2563EB' }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.lastVisit}>Last Visit: {item.lastVisit}</Text>
        <ChevronRight size={16} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout scrollable={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Patients</Text>
          <Text style={styles.subtitle}>Manage your patient records</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search patients..."
            style={styles.searchInput}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={patients}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: COLORS.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  patientInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  patientSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lastVisit: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
