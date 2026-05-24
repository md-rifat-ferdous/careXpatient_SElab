import React from "react";
import Image from "next/image";
import { SideNavBar as Sidebar } from "../../components/layout/Sidebar";
import { 
  Card, 
  CardContent, 
  cn
} from "@my-clinic/ui";
import { 
  Printer, 
  Download, 
  Share2, 
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Pill,
  ClipboardList,
  Search,
  Bell
} from "lucide-react";
import Link from "next/link";
import { getLatestPrescription } from "@/app/actions/prescriptions";
import { PrescriptionActionBar } from "./PrescriptionActionBar";

export const dynamic = 'force-dynamic';

export default async function PrescriptionPage() {
  const response = await getLatestPrescription();
  const prescription = response.success && response.data ? response.data : null;

  if (!prescription) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-on-surface-variant font-medium">No prescription found.</p>
        </main>
      </div>
    );
  }

  const patient = prescription.patient;
  const doctor = prescription.user;
  const clinic = prescription.clinic;
  const medicines = prescription.medicines;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* TopNavBar */}
        <header className="flex justify-between items-center h-16 w-full px-6 bg-surface border-b border-border-soft sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-body-md text-[14px] leading-[20px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search prescriptions..."
                type="text"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors relative">
              <Bell className="text-on-surface-variant" size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-alert-critical rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-border-soft mx-2"></div>
            <Image
              alt={doctor.name}
              className="w-8 h-8 rounded-full border border-primary-container object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXFCwa8ostA1oJZv82ekk4hjd-qgsJXFzUeosYHBreqFGc7HtuQFdyEy0MvbJKiMAGTWL2v_vlEzVWBd7P4tJfnjaCNVYe5KOAbe6GgOjbHUvO53uGfD9uQwrPaDBedVnE84ud6g11S6vTuMdZNSbSM5uIggy6MFV-oixzNbi9UAA9Oq74qpOYN13ZmtBddPyWYGdmt7VuaoAk9IA7rjpWn0gwPWbtLRyolOxEak1WMoxGuybX3msfj7pbxlw-h3owVHQT9C2GdIRd"
              width={32}
              height={32}
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 space-y-8 max-w-5xl mx-auto w-full print:p-0 print:m-0 print:max-w-none">
          {/* Action Bar delegated to client component */}
          <PrescriptionActionBar />

          {/* Prescription Document */}
          <Card className="shadow-2xl border-border-soft overflow-hidden bg-surface-container-lowest text-on-surface print:shadow-none print:border-none">
            {/* Header / Letterhead */}
            <div className="p-10 border-b-4 border-primary bg-primary/5 flex justify-between items-start">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
                    <Stethoscope size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary leading-tight">MY CLINIC</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">Professional Medical Services</p>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-lg font-bold text-on-surface">{doctor.name}</p>
                  <p className="text-[13px] font-medium text-on-surface-variant">Chief of Surgery & Consultant Surgeon</p>
                  <p className="text-[11px] font-semibold text-primary/70 uppercase tracking-wider">BMDC Reg No: B-20931-BMDC</p>
                </div>
              </div>

              <div className="text-right space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-success-standard/10 text-success-standard rounded-full border border-success-standard/20 shadow-sm">
                  <ShieldCheck size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Verified Document</span>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-[13px] font-bold text-on-surface uppercase tracking-tight">Rx ID: <span className="font-data-mono">#PRE-{prescription.id.slice(-8).toUpperCase()}</span></p>
                  <p className="text-[12px] font-medium text-on-surface-variant">Date: {new Date(prescription.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-12 space-y-16">
              {/* Patient Profile Banner */}
              <div className="grid grid-cols-4 gap-12 p-8 bg-surface-container-low rounded-[2rem] border border-border-soft/50 shadow-inner">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Patient Name</p>
                  <p className="text-[16px] font-bold text-on-surface">{patient.name}</p>
                </div>
                <div className="space-y-1.5 border-l border-border-soft/30 pl-12">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Age / Gender</p>
                  <p className="text-[16px] font-bold text-on-surface">{patient.age}Y / {patient.gender}</p>
                </div>
                <div className="space-y-1.5 border-l border-border-soft/30 pl-12">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Vital Signs</p>
                  <p className="text-[16px] font-bold text-on-surface">{patient.weight || '--'} / {patient.bp || '--'}</p>
                </div>
                <div className="space-y-1.5 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Clinic Location</p>
                  <p className="text-[16px] font-bold text-primary">{clinic.name}</p>
                </div>
              </div>

              <div className="flex gap-16">
                {/* Side Info Pane */}
                <div className="w-[30%] space-y-12 border-r border-border-soft pr-16">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ClipboardList size={18} />
                      </div>
                      <h4 className="font-bold uppercase text-[11px] tracking-[0.1em]">Chief Complaints</h4>
                    </div>
                    <ul className="space-y-3 pl-2">
                      {prescription.chiefComplaints?.split('\n').map((complaint, i) => (
                        <li key={i} className="flex items-start gap-3 text-[14px] leading-relaxed font-medium text-on-surface-variant">
                          <span className="mt-2 w-1.5 h-1.5 bg-primary/40 rounded-full shrink-0" />
                          {complaint}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar size={18} />
                      </div>
                      <h4 className="font-bold uppercase text-[11px] tracking-[0.1em]">Clinical History</h4>
                    </div>
                    <p className="text-[14px] text-on-surface-variant/80 leading-relaxed italic font-medium pl-2 border-l-2 border-primary/10">
                      "{prescription.clinicalHistory}"
                    </p>
                  </div>
                </div>

                {/* Prescription Body */}
                <div className="flex-1 space-y-10">
                  <div className="flex items-center gap-4 text-primary">
                    <div className="text-4xl font-serif italic font-black text-primary/90">Rx</div>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                  </div>

                  {/* Medication List */}
                  <div className="space-y-1">
                    {medicines.map((med, i) => (
                      <div key={i} className="flex justify-between items-start py-6 border-b border-border-soft/30 hover:bg-surface-container-low/30 transition-colors group px-4 rounded-xl">
                        <div className="space-y-1.5">
                          <p className="text-[17px] font-bold text-on-surface group-hover:text-primary transition-colors">{med.name}</p>
                          <div className="flex gap-4">
                            <span className="text-[12px] font-black text-primary uppercase tracking-widest">{med.dosage}</span>
                            <span className="text-[12px] font-bold text-on-surface-variant/60">— {med.duration}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1.5">
                          <p className="text-[13px] font-semibold text-secondary uppercase tracking-tight bg-secondary/5 px-3 py-1 rounded-full border border-secondary/10 inline-block">
                            {med.instruction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Doctor Notes Area */}
                  <div className="p-8 bg-surface-container-low rounded-[1.5rem] border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Pill size={80} />
                    </div>
                    <div className="relative space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Doctor's Special Advice</p>
                      </div>
                      <p className="text-[15px] text-on-surface leading-relaxed font-medium">
                        {prescription.doctorNotes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Block */}
              <div className="flex justify-between items-end pt-16 border-t border-border-soft">
                <div className="flex gap-6 items-center">
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-border-soft shadow-inner">
                    <div className="w-20 h-20 bg-on-surface/5 rounded-lg flex items-center justify-center border border-dashed border-border-soft">
                      <span className="text-[10px] font-bold text-on-surface-variant/40">QR CODE</span>
                    </div>
                  </div>
                  <div className="max-w-[200px] space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface">Digital ID Verified</p>
                    <p className="text-[10px] text-on-surface-variant/60 leading-relaxed font-medium">
                      Scan to verify this prescription directly from MY CLINIC's secure database.
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-6">
                  <div className="space-y-1">
                    <div className="font-serif italic text-3xl text-primary/60 px-8 pb-3 border-b-2 border-primary/20">
                      {doctor.name}
                    </div>
                    <div className="pt-3 space-y-1">
                      <p className="text-[15px] font-bold text-on-surface">{doctor.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">E-Signature Certified</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Premium Footer */}
            <div className="bg-on-surface p-5 text-center">
              <p className="text-[10px] text-on-primary/60 font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-3">
                <ShieldCheck size={14} className="text-success-standard" />
                This is a computer generated document • No physical signature required • {clinic.address}
              </p>
            </div>
          </Card>
          
          <div className="h-12 print:hidden" />
        </div>
      </main>
    </div>
  );
}
