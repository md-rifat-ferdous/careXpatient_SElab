import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  TextInput,
  StatusBar,
  Image,
  RefreshControl
} from 'react-native';
import { theme } from '../../lib/theme';

const API_BASE = 'http://10.0.2.2:5000/api'; // Android emulator; use localhost for iOS sim

const PrescriptionListScreen = ({ navigation }: any) => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPrescriptions = useCallback(async (currentPage = 1, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        page: String(currentPage),
        limit: '10'
      }).toString();

      const res = await fetch(`${API_BASE}/prescriptions?${query}`);
      const result = await res.json();
      if (result.success) {
        setPrescriptions(result.data);
        setTotalPages(result.pagination.totalPages);
        setPage(currentPage);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPrescriptions(1);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrescriptions(1, true);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return { bg: theme.colors.primary + '10', text: theme.colors.primary, dot: theme.colors.primary };
    if (status === 'Issued') return { bg: '#FFF7ED', text: '#EA580C', dot: '#EA580C' };
    return { bg: theme.colors.alertInfo + '10', text: theme.colors.alertInfo, dot: theme.colors.alertInfo };
  };

  const renderItem = ({ item }: any) => {
    const statusColors = getStatusColor(item.status);
    return (
      <TouchableOpacity 
        activeOpacity={0.75}
        onPress={() => navigation.navigate('PrescriptionDetail', { id: item.id })}
        style={styles.card}
      >
        {/* Card Top Row */}
        <View style={styles.cardTop}>
          {/* Rx Icon */}
          <View style={styles.rxIcon}>
            <Text style={styles.rxText}>℞</Text>
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardId}>{item.prescriptionId}</Text>
            <Text style={styles.diagnosisText} numberOfLines={1}>
              {item.diagnosis || 'General Consultation'}
            </Text>
            <Text style={styles.dateText}>{item.issuedAt}</Text>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColors.dot }]} />
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Doctor Row */}
        <View style={styles.doctorRow}>
          {item.doctorPhoto ? (
            <Image source={{ uri: item.doctorPhoto }} style={styles.doctorAvatar} />
          ) : (
            <View style={styles.doctorAvatarPlaceholder}>
              <Text style={styles.doctorAvatarText}>
                {item.doctorName?.charAt(0) || 'D'}
              </Text>
            </View>
          )}
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{item.doctorName}</Text>
            <Text style={styles.doctorQual} numberOfLines={1}>
              {item.doctorQualification || 'Consultant'}
            </Text>
          </View>
          <View style={styles.medCount}>
            <Text style={styles.medCountNum}>{item.medicationCount}</Text>
            <Text style={styles.medCountLabel}>meds</Text>
          </View>
          <View style={styles.arrowBtn}>
            <Text style={styles.arrowText}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={page === 1}
          onPress={() => fetchPrescriptions(page - 1)}
          style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
        >
          <Text style={styles.pageBtnText}>‹ Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
        <TouchableOpacity
          disabled={page === totalPages}
          onPress={() => fetchPrescriptions(page + 1)}
          style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
        >
          <Text style={styles.pageBtnText}>Next ›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>careXpatient</Text>
          <Text style={styles.title}>Prescriptions</Text>
          <Text style={styles.subtitle}>Your digital health records</Text>
        </View>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>K</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search diagnosis, doctor, RX-ID..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#94A3B8', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Fetching secure records...</Text>
        </View>
      ) : prescriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No Prescriptions Found</Text>
          <Text style={styles.emptyText}>
            Your digital prescriptions will appear here after your consultation.
          </Text>
        </View>
      ) : (
        <FlatList 
          data={prescriptions}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#0D9488']}
              tintColor="#0D9488"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceMuted },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  brand: { fontSize: 12, fontWeight: '800', color: theme.colors.primary, letterSpacing: 1, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '500', marginTop: 2 },
  profileCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  profileInitial: { fontSize: 18, fontWeight: '900', color: theme.colors.surface },
  searchSection: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted, borderRadius: 14,
    paddingHorizontal: 16, height: 50,
    borderWidth: 1, borderColor: theme.colors.borderSoft,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', color: theme.colors.text },
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: 20,
    marginBottom: 14, padding: 18,
    borderWidth: 1, borderColor: theme.colors.borderSoft,
    ...theme.shadows.soft,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  rxIcon: {
    width: 44, height: 44, backgroundColor: theme.colors.primary + '10',
    borderRadius: 13, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.colors.primary + '20', marginRight: 12,
  },
  rxText: { fontSize: 22, fontWeight: '900', color: theme.colors.primary, fontStyle: 'italic' },
  cardInfo: { flex: 1 },
  cardId: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: 3 },
  diagnosisText: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 3 },
  dateText: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText: { fontSize: 10, fontWeight: '800' },
  divider: { height: 1, backgroundColor: theme.colors.borderSoft, marginBottom: 14 },
  doctorRow: { flexDirection: 'row', alignItems: 'center' },
  doctorAvatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  doctorAvatarPlaceholder: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: theme.colors.borderSoft, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  doctorAvatarText: { fontSize: 14, fontWeight: '800', color: theme.colors.textMuted },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  doctorQual: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '500' },
  medCount: { alignItems: 'center', marginRight: 12 },
  medCountNum: { fontSize: 16, fontWeight: '900', color: theme.colors.primary },
  medCountLabel: { fontSize: 9, color: theme.colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  arrowBtn: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: theme.colors.primary + '10', alignItems: 'center', justifyContent: 'center',
  },
  arrowText: { fontSize: 20, color: theme.colors.primary, fontWeight: '900' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: theme.colors.textMuted, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  emptyText: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 14, lineHeight: 21 },
  pagination: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 16,
  },
  pageBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: theme.colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: theme.colors.borderSoft,
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageBtnText: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  pageInfo: { fontSize: 14, fontWeight: '600', color: theme.colors.textMuted },
});

export default PrescriptionListScreen;
