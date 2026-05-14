'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Medicine {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionData {
  prescriptionId: string;
  issuedAt: string;
  diagnosis: string;
  adviceText: string;
  medicines: Medicine[];
  patient: {
    name: string;
    age: string;
    gender: string;
    bloodGroup: string;
  };
  doctor: {
    name: string;
    qualification: string;
    specialization: string;
    bmdc: string;
    avatarUrl: string | null;
  };
}

export default function PrescriptionPage() {
  const [data, setData] = useState<PrescriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch from /api/prescriptions/:id
    // Mocking the data for the premium dashboard demo
    setTimeout(() => {
      setData({
        prescriptionId: "RX-202405001",
        issuedAt: "14 May, 2026",
        diagnosis: "Mild Seasonal Viral Fever with respiratory congestion",
        adviceText: "Drink plenty of warm water. Avoid cold drinks. Complete the full course of antibiotics even if feeling better. Review after 7 days if symptoms persist.",
        medicines: [
          { medication: "Napa Extend (665mg)", dosage: "1 tablet", frequency: "1+0+1", duration: "5 days" },
          { medication: "Fexo 120 (120mg)", dosage: "1 tablet", frequency: "0+0+1", duration: "7 days" },
          { medication: "Monas 10 (10mg)", dosage: "1 tablet", frequency: "0+0+1", duration: "10 days" },
          { medication: "Zimax (500mg)", dosage: "1 tablet", frequency: "1+0+0", duration: "3 days" },
          { medication: "Entacyd Plus", dosage: "2 tsp", frequency: "1+1+1", duration: "5 days" }
        ],
        patient: {
          name: "Mr. Rahim Ali",
          age: "34",
          gender: "Male",
          bloodGroup: "O+"
        },
        doctor: {
          name: "Dr. Anisur Rahman",
          qualification: "MBBS, FCPS (Medicine)",
          specialization: "Specialist Physician",
          bmdc: "12456-BMDC",
          avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b1f8?q=80&w=150&h=150&auto=format&fit=crop"
        }
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
         <p className="mt-4 text-slate-500 font-medium animate-pulse">Preparing your prescription...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Page Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Prescription Details</h1>
           <p className="text-slate-500 text-sm mt-1">View and manage your digital prescription</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all">
             <span className="material-symbols-outlined text-lg">print</span>
             Print
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all shadow-md shadow-teal-100">
             <span className="material-symbols-outlined text-lg">download</span>
             Download PDF
           </button>
        </div>
      </div>

      {/* Main Prescription Card */}
      <div className="bg-white rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        
        {/* RX Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] scale-[4] rotate-[-12deg] z-0 font-serif">
          <span className="text-[120px] font-black italic">Rx</span>
        </div>

        {/* Prescription Header */}
        <div className="p-8 lg:p-12 border-b border-dashed border-slate-100 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
                 <span className="material-symbols-outlined text-teal-600 text-3xl">medical_services</span>
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">careXpatient</h2>
                  <p className="text-teal-600 font-bold text-xs uppercase tracking-[0.2em] mt-0.5">Digital Health System</p>
               </div>
            </div>
            
            <div className="text-right">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-100 mb-2">
                 <span className="material-symbols-outlined text-sm">verified</span>
                 Verified Prescription
               </div>
               <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Reference ID</p>
               <p className="text-slate-900 font-bold text-lg">{data.prescriptionId}</p>
            </div>
          </div>

          {/* Patient Info Row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                <p className="text-sm font-bold text-slate-900">{data.patient.name}</p>
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Age / Gender</p>
                <p className="text-sm font-bold text-slate-900">{data.patient.age} Yrs / {data.patient.gender}</p>
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                <p className="text-sm font-bold text-slate-900">{data.issuedAt}</p>
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                <p className="text-sm font-bold text-slate-900">{data.patient.bloodGroup}</p>
             </div>
          </div>
        </div>

        {/* Prescription Body */}
        <div className="p-8 lg:p-12 relative z-10">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-teal-50 rounded-lg">
                 <span className="material-symbols-outlined text-teal-600">description</span>
               </div>
               <h3 className="text-lg font-bold text-slate-900">Diagnosis</h3>
            </div>
            <p className="text-slate-600 leading-relaxed pl-13">
              {data.diagnosis}
            </p>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-teal-50 rounded-lg">
                 <span className="material-symbols-outlined text-teal-600">medication</span>
               </div>
               <h3 className="text-lg font-bold text-slate-900">Medicines</h3>
            </div>
            
            {/* Medicine Table */}
            <div className="overflow-x-auto pl-0 md:pl-13">
              <table className="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-2 pl-4">Medication & Strength</th>
                    <th className="pb-2">Dosage</th>
                    <th className="pb-2">Frequency</th>
                    <th className="pb-2 pr-4 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {data.medicines.map((med, idx) => (
                    <tr key={idx} className="group transition-all duration-300">
                      <td className="py-4 pl-4 bg-slate-50 group-hover:bg-teal-50/50 rounded-l-xl border-l border-y border-slate-100 group-hover:border-teal-100 transition-all">
                        <p className="font-bold text-slate-900">{med.medication}</p>
                      </td>
                      <td className="py-4 bg-slate-50 group-hover:bg-teal-50/50 border-y border-slate-100 group-hover:border-teal-100 transition-all">
                        <p className="text-slate-600 text-sm">{med.dosage}</p>
                      </td>
                      <td className="py-4 bg-slate-50 group-hover:bg-teal-50/50 border-y border-slate-100 group-hover:border-teal-100 transition-all">
                         <div className="inline-flex items-center gap-2 px-2 py-1 bg-white rounded-md border border-slate-100 group-hover:border-teal-100">
                            <span className="material-symbols-outlined text-teal-500 text-sm">schedule</span>
                            <span className="text-xs font-bold text-slate-700">{med.frequency}</span>
                         </div>
                      </td>
                      <td className="py-4 pr-4 bg-slate-50 group-hover:bg-teal-50/50 rounded-r-xl border-r border-y border-slate-100 group-hover:border-teal-100 text-right transition-all">
                        <p className="text-sm font-bold text-teal-700">{med.duration}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Notes Section */}
          <div className="mt-12 bg-emerald-50/40 rounded-[24px] p-8 border border-emerald-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-emerald-600 text-[120px]">monitor_heart</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h4 className="text-emerald-900 font-bold uppercase tracking-widest text-xs">Doctor's Advice</h4>
            </div>
            <p className="text-emerald-800/80 leading-relaxed text-[15px] font-medium relative z-10">
              {data.adviceText}
            </p>
          </div>
        </div>

        {/* Prescription Footer Area */}
        <div className="bg-slate-50/50 p-8 lg:p-12 border-t border-slate-100">
           <div className="flex flex-col md:flex-row items-start justify-between gap-12">
             {/* Doctor Signature Section */}
             <div className="flex items-center gap-5">
               <div className="relative">
                 <img 
                   src={data.doctor.avatarUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b1f8?q=80&w=150&h=150&auto=format&fit=crop"} 
                   alt={data.doctor.name} 
                   className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md shadow-slate-200"
                 />
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 border-2 border-white rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-white text-xs">verified</span>
                 </div>
               </div>
               <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Prescribed By</p>
                  <h5 className="text-lg font-bold text-slate-900">{data.doctor.name}</h5>
                  <p className="text-slate-500 text-xs font-medium">{data.doctor.qualification}</p>
                  <p className="text-slate-400 text-[10px] mt-1 font-bold">BMDC: {data.doctor.bmdc}</p>
               </div>
             </div>

             {/* Support/Verification Badge */}
             <div className="flex-1 max-w-sm">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md hover:border-teal-100 transition-all cursor-pointer group">
                   <div className="p-3 bg-teal-50 rounded-xl group-hover:bg-teal-600 transition-colors">
                     <span className="material-symbols-outlined text-teal-600 group-hover:text-white">call</span>
                   </div>
                   <div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">Support Available</h5>
                      <p className="text-xs text-slate-500 leading-normal mb-3">Questions about your medicines? Our experts are here to help.</p>
                      <button className="text-teal-600 text-xs font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all">
                        Contact Support
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                   </div>
                </div>
             </div>
           </div>
           
           <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-slate-400 font-medium">© 2026 careXpatient. All rights reserved. This is a computer-generated digital prescription.</p>
              <div className="flex items-center gap-6">
                <Link href="#" className="text-[10px] font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest">Privacy Policy</Link>
                <Link href="#" className="text-[10px] font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest">Terms of Use</Link>
                <Link href="#" className="text-[10px] font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest">Support</Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
