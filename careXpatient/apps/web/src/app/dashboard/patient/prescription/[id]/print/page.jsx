'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';





























export default function PrescriptionPrintPage() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/prescriptions/${params.id}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error('Error fetching prescription for print:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading || !data) {
    return <div className="p-10 text-slate-500">Loading prescription...</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Printable prescription template */}
      <div className="print-content relative z-10 px-10 py-12 md:px-14 md:py-14 max-w-[850px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 relative">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-teal-600 rounded-md flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">medical_services</span>
              </div>
              <h1 className="text-[26px] font-bold text-teal-600 tracking-tight leading-none">careXpatient</h1>
            </div>
            <p className="text-slate-500 text-[13px] font-medium ml-1">Digital Prescription Management System</p>
          </div>
          
          <div className="text-right mt-6 md:mt-0">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prescription ID</p>
             <p className="text-[16px] font-mono font-bold text-slate-900">{data.prescriptionId}</p>
             <p className="text-[12px] text-slate-500 font-medium mt-1">Issued: {data.issuedAt}</p>
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 mb-8"></div>

        {/* Patient & Doctor Row */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Patient Information</h4>
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-bold text-slate-900">{data.patient.name}</p>
              <div className="flex items-center gap-4 text-[13px] text-slate-600 font-medium">
                <span>{data.patient.age} Years • {data.patient.gender}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>Blood: {data.patient.bloodGroup}</span>
              </div>
              <p className="text-[13px] text-slate-500">{data.patient.phone}</p>
            </div>
          </div>
          
          <div className="text-right">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Consulting Doctor</h4>
            <div className="flex flex-col gap-1 items-end">
              <p className="text-[16px] font-bold text-slate-900">{data.doctor.name}</p>
              <p className="text-[12px] text-slate-500 font-medium leading-tight max-w-[200px]">{data.doctor.qualification}</p>
              <p className="text-[11px] text-teal-600 font-bold mt-1 uppercase tracking-wider">{data.doctor.bmdc}</p>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-teal-600 rounded-full"></div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Primary Diagnosis</h4>
          </div>
          <p className="text-[18px] font-bold text-slate-900 leading-tight">
            {data.diagnosis}
          </p>
        </div>

        {/* Prescription Symbol */}
        <div className="flex items-center gap-3 mb-8">
           <span className="text-[42px] font-serif font-bold text-teal-600 leading-none">℞</span>
           <div className="h-px flex-1 bg-slate-100"></div>
        </div>

        {/* Medication Table */}
        <div className="mb-12">
          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Medication & Dosage</th>
                  <th className="py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Frequency</th>
                  <th className="py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right pr-2">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.medicines.map((med, idx) =>
                <tr key={idx}>
                    <td className="py-6 align-top">
                      <p className="text-[15px] font-bold text-slate-900 mb-1">{med.medication}</p>
                      <p className="text-[13px] text-slate-500 font-medium">{med.dosage}</p>
                    </td>
                    <td className="py-6 align-top text-center">
                      <div className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-lg text-slate-700 text-[13px] font-bold border border-slate-100">
                        {med.frequency}
                      </div>
                    </td>
                    <td className="py-6 align-top text-right pr-2">
                      <p className="text-[14px] font-bold text-slate-900 mt-0.5">{med.duration}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor's Notes */}
        <div className="mb-12 p-6 bg-[#f8fcfb] border border-teal-50 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-teal-600 text-[18px]">clinical_notes</span>
            <h4 className="text-[11px] font-bold text-teal-700 uppercase tracking-widest">{"Doctor's Notes"}</h4>
          </div>
          <p className="text-slate-700 text-[14px] leading-relaxed italic pr-4 pl-1">
            {data.adviceText || 'Take medications strictly as prescribed. Maintain a healthy diet and stay hydrated.'}
          </p>
        </div>

        {/* Doctor Footer */}
        <div className="flex justify-between items-end mt-20">
          <div>
            <h3 className="text-[28px] font-serif italic text-slate-900 mb-2 font-bold tracking-tight">Dr. {data.doctor.name.replace('Dr. ', '')}</h3>
            <p className="text-slate-900 text-[14px] font-bold mb-0.5">{data.doctor.name}</p>
            <p className="text-slate-500 text-[13px]">{data.doctor.qualification}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 px-4 py-1.5 border border-teal-100 rounded-full bg-teal-50/50">
              <span className="material-symbols-outlined text-teal-600 text-[14px] font-bold">verified</span>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Verified Digital Prescription</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">ID: MED-{data.doctor.bmdc || '982-001X'}</p>
          </div>
        </div>
        
      </div>
    </div>);

}