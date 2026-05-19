import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  Image,
  Share,
  Linking
} from 'react-native';
import { theme } from '../../lib/theme';

const API_BASE = 'http://10.0.2.2:5000/api'; // Android emulator; use localhost for iOS sim

const PrescriptionDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/prescriptions/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!data) return;
    try {
      await Share.share({
        message: `Prescription from careXpatient\n\nID: ${data.prescriptionId}\nDoctor: ${data.doctor.name}\nDiagnosis: ${data.diagnosis}\nDate: ${data.issuedAt}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPDF = () => {
    Linking.openURL(`${API_BASE}/prescriptions/${id}/pdf`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Verifying medical record...</Text>
      </View>
    );
  }

  if (!data) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 40 }}>⚠️</Text>
        <Text style={styles.loadingText}>Prescription not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 15 }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Rx</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Prescription Card */}
        <View style={styles.prescriptionCard}>
          {/* Watermark */}
          <View style={styles.watermark} pointerEvents="none">
            <Text style={styles.watermarkText}>℞</Text>
          </View>

          {/* Brand + Ref */}
          <View style={styles.cardHeader}>
            <View style={styles.brandContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>cXp</Text>
              </View>
              <Text style={styles.brandName}>careXpatient</Text>
            </View>
            <View style={styles.refContainer}>
              <Text style={styles.refLabel}>PRESCRIPTION ID</Text>
              <Text style={styles.refValue}>{data.prescriptionId}</Text>
              <Text style={styles.refDate}>{data.issuedAt}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Doctor Section */}
          <View style={styles.doctorSection}>
            <Text style={styles.sectionLabel}>CONSULTING DOCTOR</Text>
            <View style={styles.doctorRow}>
              {data.doctor.avatarUrl ? (
                <Image source={{ uri: data.doctor.avatarUrl }} style={styles.doctorAvatar} />
              ) : (
                <View style={styles.doctorAvatarPlaceholder}>
                  <Text style={styles.doctorAvatarText}>{data.doctor.name?.charAt(0) || 'D'}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.doctorName}>{data.doctor.name}</Text>
                <Text style={styles.doctorQual}>{data.doctor.qualification}</Text>
                <Text style={styles.bmdcText}>BMDC: {data.doctor.bmdc}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Patient Info */}
          <View style={styles.patientGrid}>
            <View style={styles.patientItem}>
              <Text style={styles.gridLabel}>PATIENT</Text>
              <Text style={styles.gridValue}>{data.patient.name}</Text>
            </View>
            <View style={styles.patientItem}>
              <Text style={styles.gridLabel}>AGE / GENDER</Text>
              <Text style={styles.gridValue}>{data.patient.age} yrs • {data.patient.gender}</Text>
            </View>
            <View style={styles.patientItem}>
              <Text style={styles.gridLabel}>BLOOD GROUP</Text>
              <Text style={styles.gridValue}>{data.patient.bloodGroup}</Text>
            </View>
            <View style={styles.patientItem}>
              <Text style={styles.gridLabel}>PHONE</Text>
              <Text style={styles.gridValue}>{data.patient.phone || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Diagnosis */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>📋</Text>
              <Text style={styles.sectionTitle}>PRIMARY DIAGNOSIS</Text>
            </View>
            <Text style={styles.diagnosisText}>{data.diagnosis || 'General Consultation'}</Text>
          </View>

          {/* Rx Symbol */}
          <View style={styles.rxRow}>
            <Text style={styles.rxSymbol}>℞</Text>
            <View style={styles.rxLine} />
          </View>

          {/* Medications */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>💊</Text>
              <Text style={styles.sectionTitle}>MEDICATIONS</Text>
            </View>

            {data.medicines && data.medicines.length > 0 ? (
              data.medicines.map((med: any, index: number) => (
                <View key={index} style={styles.medicationCard}>
                  <View style={styles.medIndex}>
                    <Text style={styles.medIndexText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{med.medication}</Text>
                    <Text style={styles.medDosage}>{med.dosage}</Text>
                  </View>
                  <View style={styles.medMeta}>
                    <Text style={styles.medFreq}>{med.frequency}</Text>
                    <Text style={styles.medDuration}>{med.duration}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No medications prescribed.</Text>
            )}
          </View>

          {/* Advice */}
          <View style={styles.adviceBox}>
            <Text style={styles.adviceLabel}>✍️  DOCTOR'S ADVICE</Text>
            <Text style={styles.adviceText}>
              {data.adviceText || 'Take medications strictly as prescribed. Stay hydrated and rest well.'}
            </Text>
          </View>

          {/* Footer Signature */}
          <View style={styles.footer}>
            <View>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{data.doctor.name}</Text>
              <Text style={styles.signatureQual}>{data.doctor.qualification}</Text>
            </View>
            <View style={styles.verifyBadge}>
              <Text style={styles.verifyIcon}>🛡️</Text>
              <Text style={styles.verifyText}>VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.shareAction]} onPress={handleShare}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={[styles.actionText, { color: '#0D9488' }]}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.downloadAction]} onPress={handleDownloadPDF}>
            <Text style={styles.actionIcon}>📥</Text>
            <Text style={[styles.actionText, { color: '#fff' }]}>Download PDF</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceMuted },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface },
  loadingText: { marginTop: 16, fontSize: 14, color: theme.colors.textMuted, fontWeight: '600' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: theme.colors.text, fontWeight: 'bold' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  shareBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: theme.colors.primary + '10', alignItems: 'center', justifyContent: 'center',
  },
  shareIcon: { fontSize: 18 },
  scrollContent: { padding: 16, paddingBottom: 48 },
  prescriptionCard: {
    backgroundColor: theme.colors.surface, borderRadius: 28, padding: 24,
    ...theme.shadows.soft,
    borderWidth: 1, borderColor: theme.colors.borderSoft, overflow: 'hidden', position: 'relative',
  },
  watermark: {
    position: 'absolute', top: '30%', left: '15%',
    opacity: 0.025, transform: [{ rotate: '-20deg' }],
  },
  watermarkText: { fontSize: 180, fontWeight: '900', color: theme.colors.primary, fontStyle: 'italic' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  logoBox: {
    width: 34, height: 34, backgroundColor: theme.colors.primary,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  logoText: { color: theme.colors.surface, fontSize: 10, fontWeight: '900' },
  brandName: { fontSize: 17, fontWeight: '900', color: theme.colors.text },
  refContainer: { alignItems: 'flex-end' },
  refLabel: { fontSize: 8, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: 2 },
  refValue: { fontSize: 13, fontWeight: '800', color: theme.colors.text, fontFamily: 'monospace' },
  refDate: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '500', marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.borderSoft, marginVertical: 18 },
  sectionLabel: { fontSize: 9, fontWeight: '900', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: 10 },
  doctorSection: { marginBottom: 4 },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doctorAvatar: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.borderSoft },
  doctorAvatarPlaceholder: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: theme.colors.primary + '10', alignItems: 'center', justifyContent: 'center',
  },
  doctorAvatarText: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },
  doctorName: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 3 },
  doctorQual: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500', marginBottom: 2 },
  bmdcText: { fontSize: 11, color: theme.colors.primary, fontWeight: '700' },
  patientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  patientItem: { width: '47%' },
  gridLabel: { fontSize: 8, fontWeight: '900', color: theme.colors.textMuted, letterSpacing: 0.5, marginBottom: 3 },
  gridValue: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  section: { marginBottom: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { fontSize: 14, marginRight: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: theme.colors.textMuted, letterSpacing: 1 },
  diagnosisText: { fontSize: 17, fontWeight: '700', color: theme.colors.text, lineHeight: 24 },
  rxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  rxSymbol: { fontSize: 36, fontWeight: '900', color: theme.colors.primary, marginRight: 12, fontStyle: 'italic' },
  rxLine: { flex: 1, height: 1, backgroundColor: theme.colors.borderSoft },
  medicationCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: theme.colors.borderSoft,
  },
  medIndex: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  medIndexText: { fontSize: 12, fontWeight: '900', color: theme.colors.surface },
  medName: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
  medDosage: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500' },
  medMeta: { alignItems: 'flex-end' },
  medFreq: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 2 },
  medDuration: { fontSize: 12, fontWeight: '700', color: theme.colors.primary },
  emptyText: { fontSize: 14, color: theme.colors.textMuted, fontStyle: 'italic' },
  adviceBox: {
    backgroundColor: theme.colors.primary + '10', borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: theme.colors.primary + '20', marginTop: 4, marginBottom: 24,
  },
  adviceLabel: { fontSize: 10, fontWeight: '900', color: theme.colors.primary, letterSpacing: 1, marginBottom: 8 },
  adviceText: { fontSize: 14, fontWeight: '500', color: theme.colors.primaryDark, lineHeight: 21 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  signatureLine: { width: 140, height: 1, backgroundColor: theme.colors.borderSoft, marginBottom: 8 },
  signatureLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  signatureQual: { fontSize: 10, color: theme.colors.textMuted, fontWeight: '500' },
  verifyBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.text, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  verifyIcon: { fontSize: 12, marginRight: 5 },
  verifyText: { fontSize: 9, fontWeight: '900', color: theme.colors.surface, letterSpacing: 0.5 },
  actionRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  actionBtn: {
    flex: 1, height: 54, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  shareAction: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderSoft },
  downloadAction: { backgroundColor: theme.colors.primary },
  actionIcon: { fontSize: 18 },
  actionText: { fontSize: 15, fontWeight: '700' },
});

export default PrescriptionDetailScreen;
