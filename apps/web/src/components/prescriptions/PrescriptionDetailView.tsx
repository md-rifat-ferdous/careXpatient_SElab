"use client";

import React from 'react';
import { 
  Typography, 
  Button, 
  Badge, 
  Avatar, 
  cn 
} from '@carexpatient/ui';
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Clock, 
  Phone, 
  MapPin, 
  Mail,
  QrCode,
  FileText,
  Stethoscope
} from 'lucide-react';

interface Medicine {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionDetail {
  id: number;
  prescriptionId: string;
  issuedAt: string;
  diagnosis: string;
  adviceText: string;
  medicines: Medicine[];
  patient: {
    name: string;
    age: number;
    gender: string;
    bloodGroup: string;
    phone: string;
    avatarUrl: string;
  };
  doctor: {
    name: string;
    specialty?: string;
    qualification: string;
    bmdc: string;
    avatarUrl: string;
  };
}

interface PrescriptionDetailViewProps {
  data: PrescriptionDetail;
  onClose: () => void;
}

const PrescriptionDetailView: React.FC<PrescriptionDetailViewProps> = ({ data, onClose }) => {
  return (
    <div className="w-full bg-surface-muted/50 flex justify-center py-12 px-4 md:px-0">
      <div className="bg-surface rounded-3xl border border-border-soft shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-[900px] relative">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; margin: 0 !important; }
            .print-container { 
              border: none !important; 
              box-shadow: none !important; 
              width: 100% !important;
              max-width: none !important;
              padding: 0 !important;
            }
            .document-sheet {
              padding: 60px !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}} />

        {/* Action Toolbar - No Print */}
        <div className="no-print bg-white/80 backdrop-blur-md border-b border-border-soft px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <Typography variant="body" className="font-bold">Digital Prescription</Typography>
              <Typography variant="small" className="text-[10px] text-text-muted">{data.prescriptionId}</Typography>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.print()} className="gap-2 rounded-xl">
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
            <div className="w-px h-8 bg-border-soft mx-2" />
            <button onClick={onClose} className="p-2 hover:bg-surface-muted rounded-full transition-colors">
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        </div>
        
        {/* Document Sheet */}
        <div className="document-sheet bg-white px-10 py-12 md:px-20 md:py-16">
          
          {/* Clinic Branding Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Typography variant="h2" className="text-2xl font-black text-primary tracking-tighter leading-none">careXpatient</Typography>
                  <Typography variant="small" className="text-[10px] font-bold text-primary-dark tracking-[0.2em] uppercase">Healthcare Ecosystem</Typography>
                </div>
              </div>
              <div className="space-y-1 text-text-muted text-xs font-medium">
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> House 12, Road 4, Banani, Dhaka-1213</div>
                <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> +880 1234-567890 · <Mail className="w-3 h-3" /> support@carexpatient.com</div>
              </div>
            </div>

            <div className="flex flex-col items-end text-right space-y-4">
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-4 items-center">
                <div className="text-right">
                  <Typography variant="small" className="font-bold text-[9px] uppercase tracking-widest text-primary-dark">Digitally Verified By</Typography>
                  <Typography variant="body" className="font-black text-primary leading-tight">Dr. {data.doctor.name.replace('Dr. ', '')}</Typography>
                  <Typography variant="small" className="text-[10px] text-text-muted">{data.doctor.specialty || 'Cardiology Specialist'}</Typography>
                </div>
                <div className="w-16 h-16 bg-white rounded-xl border border-primary/10 flex items-center justify-center p-1">
                  <QrCode className="w-full h-full text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-bold tracking-widest px-3 py-1 rounded-full border-border-soft bg-surface-muted/50">
                  BMDC REG: {data.doctor.bmdc}
                </Badge>
              </div>
            </div>
          </div>

          {/* Patient Details Bar */}
          <div className="bg-surface-muted/30 border-y border-border-soft/50 py-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="px-4">
              <Typography variant="small" className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Patient</Typography>
              <Typography variant="body" className="font-black text-base">{data.patient.name}</Typography>
              <Typography variant="small" className="text-xs text-text-muted">{data.patient.age}Y · {data.patient.gender} · {data.patient.bloodGroup || 'O+'}</Typography>
            </div>
            <div className="px-4 border-l border-border-soft/50">
              <Typography variant="small" className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Issued On</Typography>
              <Typography variant="body" className="font-black text-base">{data.issuedAt}</Typography>
              <Typography variant="small" className="text-xs text-text-muted">Digital Consultation</Typography>
            </div>
            <div className="px-4 border-l border-border-soft/50">
              <Typography variant="small" className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Diagnosis</Typography>
              <Typography variant="body" className="font-black text-base line-clamp-1">{data.diagnosis}</Typography>
              <Typography variant="small" className="text-xs text-text-muted">Primary Assessment</Typography>
            </div>
            <div className="px-4 border-l border-border-soft/50">
              <Typography variant="small" className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Ref Number</Typography>
              <Typography variant="body" className="font-black text-base text-primary">{data.prescriptionId}</Typography>
              <Typography variant="small" className="text-xs text-text-muted">CX-PRX-2026</Typography>
            </div>
          </div>

          {/* Rx Icon & Main Content */}
          <div className="flex gap-12 min-h-[400px]">
            {/* Rx Sidebar */}
            <div className="w-16 flex flex-col items-center pt-2">
              <Typography className="text-7xl font-serif italic text-primary/10 select-none leading-none">Rx</Typography>
              <div className="w-px h-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent mt-4" />
            </div>

            {/* Medications Table */}
            <div className="flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border-soft">
                    <th className="pb-4 w-1/2">Medication Schedule</th>
                    <th className="pb-4 w-1/4">Frequency</th>
                    <th className="pb-4 w-1/4 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft/50">
                  {data.medicines.map((med, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-8">
                        <div className="space-y-1">
                          <Typography variant="body" className="font-black text-lg group-hover:text-primary transition-colors">{med.medication}</Typography>
                          <Typography variant="small" className="text-sm font-bold text-text-muted uppercase tracking-wide">{med.dosage}</Typography>
                          {med.instructions && (
                            <Typography variant="small" className="text-xs text-primary italic mt-2 block opacity-80">
                              * {med.instructions}
                            </Typography>
                          )}
                        </div>
                      </td>
                      <td className="py-8 align-top">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit text-[10px] font-bold py-1 bg-surface-muted/50 border-border-soft">
                            {med.frequency}
                          </Badge>
                          <Typography variant="small" className="text-[10px] text-text-muted font-medium ml-1">After Meals</Typography>
                        </div>
                      </td>
                      <td className="py-8 align-top text-right">
                        <Typography variant="body" className="font-black text-primary">{med.duration}</Typography>
                        <Typography variant="small" className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Full Course</Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Advice Section */}
              <div className="mt-16 p-8 bg-primary/[0.02] border-l-4 border-primary rounded-r-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <Typography variant="small" className="font-black text-primary uppercase tracking-[0.2em] text-[10px]">Medical Advice & Notes</Typography>
                </div>
                <Typography variant="body" className="text-base text-text-muted leading-relaxed italic">
                  {data.adviceText || 'Maintain a light diet, avoid processed sugars, and stay hydrated. Monitor your blood pressure twice daily for the next week. If symptoms persist or worsen, please consult immediately.'}
                </Typography>
              </div>
            </div>
          </div>

          {/* Signature & Footer */}
          <div className="mt-24 pt-12 border-t border-border-soft flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="space-y-6 max-w-sm">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-muted/30">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <Typography variant="small" className="font-bold text-[10px] uppercase tracking-widest text-text-muted">Pharmacy Support</Typography>
                  <Typography variant="body" className="font-bold">+880 9612-445566</Typography>
                </div>
              </div>
              <Typography variant="small" className="text-[10px] text-text-muted leading-relaxed">
                This is a computer-generated digital prescription verified via careXpatient Secure Healthcare Network. No physical signature required.
              </Typography>
            </div>

            <div className="text-right space-y-4">
              <div className="space-y-1">
                <Typography className="text-4xl font-serif italic text-primary/80 font-black tracking-tighter">Dr. {data.doctor.name.replace('Dr. ', '')}</Typography>
                <div className="h-px w-full bg-border-soft" />
                <Typography variant="body" className="font-black text-sm">{data.doctor.name}</Typography>
                <Typography variant="small" className="text-xs text-text-muted">{data.doctor.qualification}</Typography>
              </div>
              <div className="flex justify-end gap-2">
                <Badge variant="primary" className="text-[8px] font-bold py-0.5 rounded-md uppercase tracking-widest shadow-md shadow-primary/20">CX-Verified</Badge>
                <Badge variant="outline" className="text-[8px] font-bold py-0.5 rounded-md uppercase tracking-widest bg-white">ID: DR-99238</Badge>
              </div>
            </div>
          </div>
          
        </div>

        {/* Global Support Footer - No Print */}
        <div className="no-print bg-primary-dark p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="body" className="text-white font-bold">Have questions about this prescription?</Typography>
              <Typography variant="small" className="text-white/60">Our medical experts are available 24/7 for consultation.</Typography>
            </div>
          </div>
          <Button className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-6 rounded-xl">
            Talk to a Pharmacist
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PrescriptionDetailView;
