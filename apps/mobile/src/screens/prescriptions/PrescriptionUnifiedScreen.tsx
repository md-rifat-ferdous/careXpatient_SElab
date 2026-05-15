import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';

const { width } = Dimensions.get('window');

const PrescriptionUnifiedScreen = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch List
  const fetchList = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions?search=${search}`);
      const result = await response.json();
      if (result.success) setPrescriptions(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Detail
  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions/${id}`);
      const result = await response.json();
      if (result.success) {
        setSelectedPrescription(result.data);
        setView('detail');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') fetchList();
  }, [search, view]);

  // Redraw List View
  const renderListItem = ({ item }: any) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => fetchDetail(item.id)}
      style={styles.listItem}
    >
      <View style={styles.listCard}>
        <View style={styles.listCardLeft}>
          <View style={styles.rxCircle}>
            <Text style={styles.rxCircleText}>Rx</Text>
          </View>
        </View>
        <View style={styles.listCardBody}>
          <Text style={styles.listId}>#{item.prescriptionId || `RX-${item.id}`}</Text>
          <Text style={styles.listDoctor}>{item.consultation?.appointment?.doctor?.user?.fullName || 'Dr. Specialist'}</Text>
          <Text style={styles.listDate}>{item.issuedAt ? new Date(item.issuedAt).toLocaleDateString() : 'N/A'}</Text>
        </View>
        <View style={styles.listCardRight}>
          <Text style={styles.listArrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Redraw Detail View (The "Web-like" Rx view)
  const DetailView = () => {
    if (detailLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Loading Digital Rx...</Text>
        </View>
      );
    }

    if (!selectedPrescription) return null;

    const data = selectedPrescription;
    // Mock medicines parsing if string
    const medicines = data.medicinesText ? data.medicinesText.split('\n').map((m: string) => {
       const parts = m.split('-'); // simple parsing
       return { 
         name: parts[0]?.trim() || m, 
         dosage: parts[1]?.trim() || '1 Unit',
         freq: parts[2]?.trim() || '1-0-1',
         dur: parts[3]?.trim() || '7 Days'
       };
    }) : [];

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
        <View style={styles.rxPaper}>
          {/* Header */}
          <View style={styles.rxHeader}>
            <View>
              <View style={styles.rxBrand}>
                <View style={styles.brandDot} />
                <Text style={styles.brandTitle}>careXpatient</Text>
              </View>
              <Text style={styles.brandSub}>Digital Health Platform</Text>
            </View>
            <View style={styles.rxIdBox}>
              <Text style={styles.rxIdLabel}>ID</Text>
              <Text style={styles.rxIdValue}>{data.prescriptionId}</Text>
            </View>
          </View>

          <View style={styles.rxDivider} />

          {/* Patient Grid */}
          <View style={styles.rxGrid}>
            <View style={styles.gridBox}>
              <Text style={styles.gridLabel}>PATIENT</Text>
              <Text style={styles.gridValue}>{data.consultation.appointment.patient.user.fullName}</Text>
            </View>
            <View style={styles.gridBox}>
              <Text style={styles.gridLabel}>DATE</Text>
              <Text style={styles.gridValue}>{new Date(data.issuedAt).toLocaleDateString()}</Text>
            </View>
          </View>

          {/* Rx Body */}
          <View style={styles.rxContent}>
            <Text style={styles.watermark}>Rx</Text>
            
            <View style={styles.contentHeader}>
              <Text style={[styles.th, { flex: 2 }]}>MEDICATION</Text>
              <Text style={[styles.th, { flex: 1 }]}>FREQ</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>DUR</Text>
            </View>

            {medicines.map((med: any, index: number) => (
              <View key={index} style={styles.tr}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDose}>{med.dosage}</Text>
                </View>
                <Text style={[styles.td, { flex: 1 }]}>{med.freq}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{med.dur}</Text>
              </View>
            ))}
          </View>

          {/* Advice */}
          <View style={styles.rxAdvice}>
            <Text style={styles.adviceTitle}>ADVICE</Text>
            <Text style={styles.adviceText}>{data.adviceText || 'Drink plenty of water.'}</Text>
          </View>

          <View style={styles.rxDivider} />

          {/* Doctor Footer */}
          <View style={styles.rxFooter}>
            <View>
              <Text style={styles.docName}>Dr. {data.consultation.appointment.doctor.user.fullName.replace('Dr. ', '')}</Text>
              <Text style={styles.docInfo}>{data.consultation.appointment.doctor.qualification}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0D9488' }]}>
            <Text style={styles.actionBtnText}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' }]}
            onPress={() => setView('list')}
          >
            <Text style={[styles.actionBtnText, { color: '#64748B' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.mainHeader}>
        {view === 'detail' && (
          <TouchableOpacity onPress={() => setView('list')} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {view === 'list' ? 'My Prescriptions' : 'Prescription Detail'}
        </Text>
        {view === 'list' && (
          <TouchableOpacity style={styles.profileBtn}>
            <View style={styles.profileIndicator} />
          </TouchableOpacity>
        )}
      </View>

      {view === 'list' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBox}>
            <TextInput 
              style={styles.searchInput}
              placeholder="Search prescriptions..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#0D9488" />
            </View>
          ) : (
            <FlatList 
              data={prescriptions}
              renderItem={renderListItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      ) : (
        <DetailView />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#0F172A',
  },
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0D9488',
  },
  searchBox: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listItem: {
    marginBottom: 12,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rxCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rxCircleText: {
    color: '#0D9488',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listCardBody: {
    flex: 1,
    marginLeft: 16,
  },
  listId: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 2,
  },
  listDoctor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  listDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  listArrow: {
    fontSize: 20,
    color: '#CBD5E1',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  detailScroll: {
    padding: 20,
    paddingBottom: 60,
  },
  rxPaper: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    minHeight: 500,
  },
  rxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  rxBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 10,
    height: 10,
    backgroundColor: '#0D9488',
    borderRadius: 5,
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0D9488',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  rxIdBox: {
    alignItems: 'flex-end',
  },
  rxIdLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  rxIdValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  rxDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  rxGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  gridBox: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  rxContent: {
    position: 'relative',
    marginBottom: 24,
    minHeight: 200,
  },
  watermark: {
    position: 'absolute',
    top: 40,
    left: 0,
    fontSize: 120,
    fontWeight: 'bold',
    color: '#F0FDFA',
    fontStyle: 'italic',
    zIndex: 0,
  },
  contentHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 10,
    zIndex: 1,
  },
  th: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    zIndex: 1,
  },
  td: {
    fontSize: 12,
    color: '#475569',
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  medDose: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  rxAdvice: {
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 24,
  },
  adviceTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 6,
  },
  adviceText: {
    fontSize: 13,
    color: '#0F766E',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  rxFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  docName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    fontStyle: 'italic',
  },
  docInfo: {
    fontSize: 11,
    color: '#64748B',
  },
  verifiedBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PrescriptionUnifiedScreen;
