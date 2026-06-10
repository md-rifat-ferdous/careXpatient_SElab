import React from 'react';




































const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PrescriptionDetailView = ({ data, onClose }) => {
  return (
    <div className="w-full bg-slate-50 flex justify-center py-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-[850px] relative">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            .print-content { 
              position: absolute !important; 
              left: 0 !important; 
              top: 0 !important; 
              width: 100% !important;
              margin: 0 !important;
              padding: 40px !important;
              border: none !important;
              box-shadow: none !important;
            }
          }
        ` }} />
        
        <div className="print-content relative z-10 px-10 py-12 md:px-14 md:py-14">
          
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
            
            <div className="flex items-center gap-3 mt-6 md:mt-0 no-print">
              <button
                onClick={() => window.print()}
                className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-[13px] font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print
              </button>
              <a
                href={`${API_BASE}/prescriptions/${data.id}/pdf`}
                download={`prescription-${data.prescriptionId}.pdf`}
                className="group flex items-center gap-2 px-4 py-2 bg-teal-600 rounded-lg text-white text-[13px] font-semibold hover:bg-teal-700 transition-colors shadow-sm">
                
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download
              </a>
              <button
                onClick={onClose}
                className="p-2 ml-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title="Close">
                
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 mb-8"></div>

          {/* Patient Info Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Patient Name</p>
              <p className="text-[16px] font-semibold text-slate-900 tracking-tight">{data.patient.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Age / Gender</p>
              <p className="text-[16px] font-semibold text-slate-900 tracking-tight">{data.patient.age} / {data.patient.gender || 'Not Specified'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</p>
              <p className="text-[16px] font-semibold text-slate-900 tracking-tight">{data.issuedAt}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Prescription ID</p>
              <p className="text-[16px] font-bold text-teal-600 tracking-tight">{data.prescriptionId}</p>
            </div>
          </div>

          {/* Rx Area */}
          <div className="relative min-h-[300px] mb-12">
            {/* Watermark */}
            <div className="absolute top-4 left-0 pointer-events-none select-none no-print opacity-[0.03]">
              <span className="text-[180px] font-serif italic text-teal-900 leading-none tracking-tighter">Rx</span>
            </div>

            <div className="relative z-10 w-full overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4 w-5/12 font-bold">Medication & Strength</th>
                    <th className="pb-4 w-2/12 font-bold">Dosage</th>
                    <th className="pb-4 w-3/12 font-bold">Frequency</th>
                    <th className="pb-4 text-right font-bold pr-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/80">
                  {data.medicines.map((med, idx) => {
                    return (
                      <tr key={idx}>
                        <td className="py-6 align-top">
                          <p className="text-[15px] font-semibold text-slate-900">{med.medication}</p>
                          <p className="text-slate-400 text-[13px] mt-0.5">{med.dosage}</p>
                        </td>
                        <td className="py-6 align-top">
                          <p className="text-[14px] text-slate-600 font-medium mt-0.5">1 Unit</p>
                        </td>
                        <td className="py-6 align-top">
                          <p className="text-[14px] text-slate-600 font-medium mt-0.5">{med.frequency}</p>
                        </td>
                        <td className="py-6 align-top text-right pr-2">
                          <p className="text-[14px] font-bold text-slate-900 mt-0.5">{med.duration}</p>
                        </td>
                      </tr>);

                  })}
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
              {data.adviceText || 'Take medications strictly as prescribed. Maintain a healthy diet and stay hydrated. Please return for a follow-up if symptoms persist.'}
            </p>
          </div>

          <div className="w-full h-px bg-slate-100 mb-8"></div>

          {/* Doctor Footer */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
            <div>
              <h3 className="text-[28px] font-serif italic text-slate-900 mb-2 font-bold tracking-tight">Dr. {data.doctor.name.replace('Dr. ', '')}</h3>
              <p className="text-slate-900 text-[14px] font-bold mb-0.5">{data.doctor.name}</p>
              <p className="text-slate-500 text-[13px]">{data.doctor.qualification}</p>
            </div>

            <div className="flex flex-col items-end gap-5">
              <div className="flex items-center gap-2 px-4 py-1.5 border border-teal-100 rounded-full bg-teal-50/50">
                <span className="material-symbols-outlined text-teal-600 text-[14px] font-bold">verified</span>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Verified Prescription</span>
              </div>
              <div className="flex items-center gap-4">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img
                  src={data.doctor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.doctor.name)}&background=0D9488&color=fff`}
                  className="w-[42px] h-[42px] rounded-full object-cover border border-slate-200"
                  alt="Doctor Avatar" />
                
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital ID</p>
                   <p className="text-[12px] font-mono text-slate-700 mt-0.5">MED-{data.doctor.bmdc || '982-001X'}</p>
                 </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Support Footer Banner */}
        <div className="bg-slate-50 border-t border-slate-100 px-10 py-6 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500 text-[18px]">help</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-slate-900">Questions about your medication?</p>
              <p className="text-[12px] text-slate-500">Our pharmacy support line is available 24/7.</p>
            </div>
          </div>
          <button className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Contact Support
          </button>
        </div>

      </div>
    </div>);

};

export default PrescriptionDetailView;