import React from 'react';

interface Prescription {
  id: number;
  prescriptionId: string;
  title: string;
  summary: string;
  issuedAt: string;
  patientName: string;
  patientPhoto: string;
  doctorName: string;
  doctorPhoto: string;
  doctorQualification: string;
  medicationCount: number;
  diagnosis: string;
  status: string;
}

interface PrescriptionListProps {
  prescriptions: Prescription[];
  loading?: boolean;
  selectedId?: number | null;
  onSelect: (id: number) => void;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({ prescriptions, loading, selectedId, onSelect }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-50 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-50 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-slate-300">receipt_long</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">No prescriptions</h3>
        <p className="text-slate-500 text-sm mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-10">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date & ID</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Diagnosis / Title</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Doctor</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prescriptions.map((p) => {
              const isSelected = selectedId === p.id;
              
              return (
                <tr 
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className={`group transition-colors cursor-pointer ${
                    isSelected ? 'bg-teal-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Date & ID */}
                  <td className="px-6 py-3.5 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-semibold text-slate-900 whitespace-nowrap">{p.issuedAt}</span>
                      <span className="text-[10px] font-mono font-medium text-slate-400">{p.prescriptionId}</span>
                    </div>
                  </td>

                  {/* Diagnosis / Title */}
                  <td className="px-6 py-3.5 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[13.5px] font-bold text-slate-900 truncate max-w-[300px]">{p.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50/50 px-1.5 py-0.5 rounded border border-teal-100/50 whitespace-nowrap">
                          <span className="material-symbols-outlined text-[13px]">pill</span>
                          {p.medicationCount} Items
                        </span>
                        <p className="text-[11.5px] text-slate-500 truncate max-w-[200px]">{p.summary}</p>
                      </div>
                    </div>
                  </td>

                  {/* Doctor */}
                  <td className="px-6 py-3.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={p.doctorPhoto || "https://images.unsplash.com/photo-1612349317150-e413f6a5b1f8?q=80&w=100&h=100&auto=format&fit=crop"} 
                        alt={p.doctorName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm hidden sm:block"
                      />
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-900 whitespace-nowrap leading-tight">{p.doctorName}</span>
                        <span className="text-[10.5px] text-slate-500 truncate max-w-[180px] leading-tight">{p.doctorQualification || 'General Physician'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3.5 align-middle text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => onSelect(p.id)}
                        className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md font-bold text-[11px] transition-colors ${
                          isSelected ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{isSelected ? 'visibility_off' : 'visibility'}</span>
                        {isSelected ? 'Close' : 'View'}
                      </button>
                      <a 
                        href={`http://localhost:5000/api/prescriptions/${p.id}/pdf`}
                        download={`prescription-${p.id}.pdf`}
                        className="flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Download PDF"
                      >
                        <span className="material-symbols-outlined text-[17px]">download</span>
                      </a>
                      <button 
                        onClick={() => onSelect(p.id)} // View it first to print
                        className="flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Print"
                      >
                        <span className="material-symbols-outlined text-[17px]">print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-3 opacity-20">receipt_long</span>
                  <p className="text-sm font-medium">No prescriptions found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrescriptionList;

