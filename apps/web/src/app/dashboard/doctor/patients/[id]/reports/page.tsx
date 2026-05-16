"use client";

import React, { useState } from 'react';
import { Calendar, Building2, Droplets, Activity, Heart, Dna, TestTubes, ArrowRight, ChevronLeft, ChevronRight, Plus, Download, MessageSquare, Stethoscope, Save } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FormField, Input } from '@/components/ui/FormElements';
import { toast } from '@/components/ui/Toast';

export default function PatientReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = React.use(params);
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const reportTypeImages: Record<string, string> = {
    mri: "/medical/mri/mri-1.jpg",
    xray: "/medical/xray/xray-1.jpg",
    cbc: "/medical/blood/blood-1.jpg",
    blood: "/medical/blood/blood-1.jpg"
  };

  const getReportImageUrl = (report: any) => {
    const name = report.name.toLowerCase();
    if (name.includes('mri')) return reportTypeImages.mri;
    if (name.includes('x-ray')) return reportTypeImages.xray;
    if (name.includes('cbc')) return reportTypeImages.cbc;
    if (name.includes('blood')) return reportTypeImages.blood;
    return null;
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { fetchApi } = await import('@/lib/api');
      const data = await fetchApi(`/reports/patient/${patientId}`);
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, [patientId]);

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setDoctorNotes(report.doctorNotes || '');
    setFollowUp(report.followUpRecommendation || '');
    setIsDetailOpen(true);
  };

  const handleSaveDoctorNotes = async () => {
    try {
      setIsSaving(true);
      const { fetchApi } = await import('@/lib/api');
      await fetchApi(`/reports/${selectedReport.id}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({
          doctorNotes,
          followUpRecommendation: followUp
        })
      });
      toast('Assessment saved successfully', 'success');
      fetchReports();
    } catch (err) {
      toast('Failed to save notes', 'error');
    } finally {
      setIsSaving(false);
    }
  };


  const itemsPerPage = 6;
  const totalPages = Math.ceil(reports.length / itemsPerPage) || 1;
  const displayedReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrev = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNext = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  if (loading) return <div className="py-20 text-center animate-pulse text-primary font-bold">Loading reports...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-text">Medical Reports</h2>
      </div>

      {reports.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 text-text-muted">No reports found for this patient.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedReports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => handleViewReport(report)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-blue-500`}>
                <Activity size={20} />
              </div>
              
              <h3 className="text-base font-bold text-text mb-3 leading-snug flex-1">{report.name}</h3>
              
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Building2 size={14} className="text-gray-400" />
                  <span>{report.labName || 'Internal Lab'}</span>
                </div>
              </div>

              <button 
                onClick={() => handleViewReport(report)}
                className="w-full py-2.5 px-4 bg-teal-50 text-teal-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-teal-100 transition-colors mt-auto"
              >
                View Full Report
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {reports.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-6 mt-8">
          <p className="text-sm text-text-muted">
            Showing <span className="font-bold text-text">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, reports.length)}</span> of <span className="font-bold text-text">{reports.length}</span> reports
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button 
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors ${
                  currentPage === idx + 1 ? 'bg-teal-700 text-white' : 'text-text-muted hover:bg-gray-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}



      {/* Report Detail Modal */}
      <Modal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        title={`${selectedReport?.name || 'Medical Report'}`}
      >
        {selectedReport && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Report Date</p>
                <div className="flex items-center gap-2 text-sm font-bold text-text">
                  <Calendar size={16} className="text-teal-600" />
                  {new Date(selectedReport.date).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Testing Facility</p>
                <div className="flex items-center gap-2 text-sm font-bold text-text justify-end">
                  <Building2 size={16} className="text-teal-600" />
                  {selectedReport.labName || 'CareX Central Lab'}
                </div>
              </div>
            </div>

            {/* Dynamic Content Based on Report Name */}
            {/* Dynamic Content Based on Report Type */}
            {selectedReport.name.toLowerCase().includes('blood') || selectedReport.name.toLowerCase().includes('cbc') ? (
              <div className="space-y-4">
                <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase">Parameter</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase">Result</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase">Reference Range</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      <tr>
                        <td className="px-4 py-4 font-bold text-text">Hemoglobin</td>
                        <td className="px-4 py-4 font-black text-teal-700">14.2 g/dL</td>
                        <td className="px-4 py-4 text-text-muted italic">13.5 - 17.5 g/dL</td>
                        <td className="px-4 py-4 text-right"><span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-md">NORMAL</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4 font-bold text-text">White Blood Cells (WBC)</td>
                        <td className="px-4 py-4 font-black text-orange-600">11.8 K/uL</td>
                        <td className="px-4 py-4 text-text-muted italic">4.5 - 11.0 K/uL</td>
                        <td className="px-4 py-4 text-right"><span className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-md">HIGH</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4 font-bold text-text">Platelets</td>
                        <td className="px-4 py-4 font-black text-teal-700">245 K/uL</td>
                        <td className="px-4 py-4 text-text-muted italic">150 - 450 K/uL</td>
                        <td className="px-4 py-4 text-right"><span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-md">NORMAL</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4 font-bold text-text">Glucose (Fasting)</td>
                        <td className="px-4 py-4 font-black text-teal-700">92 mg/dL</td>
                        <td className="px-4 py-4 text-text-muted italic">70 - 100 mg/dL</td>
                        <td className="px-4 py-4 text-right"><span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-md">NORMAL</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4 font-bold text-text">Total Cholesterol</td>
                        <td className="px-4 py-4 font-black text-red-600">215 mg/dL</td>
                        <td className="px-4 py-4 text-text-muted italic">{"<"} 200 mg/dL</td>
                        <td className="px-4 py-4 text-right"><span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-md">HIGH</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Scan Image Preview */}
                {/* PACS Style Scan Viewer */}
                {(() => {
                  const name = selectedReport.name.toLowerCase();
                  const isXray = name.includes('x-ray');
                  const isMri = name.includes('mri');
                  
                  const reportUrl = getReportImageUrl(selectedReport);
                  
                  // For X-Ray, show a single large realistic scan
                  if (isXray) {
                    return (
                      <div className="bg-black p-4 rounded-xl border border-gray-800 shadow-xl space-y-4">
                        <div className="relative aspect-[4/5] md:aspect-square overflow-hidden bg-gray-900 border border-gray-800">
                          <img 
                            src="https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?auto=format&fit=crop&q=80&w=1000"
                            alt="Chest X-Ray"
                            className="w-full h-full object-contain filter grayscale contrast-125 brightness-90"
                          />
                          <div className="absolute top-4 left-4 text-[10px] text-white/40 font-mono space-y-1">
                            <p>POSTEROANTERIOR (PA)</p>
                            <p>kVp: 120  mAs: 4.0</p>
                          </div>
                          <div className="absolute bottom-4 right-4 text-[10px] text-white/40 font-mono text-right">
                            <p>DICOM_VER_3.0</p>
                            <p>BUREAU_ID: DX-772</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-2 text-[8px] font-mono text-gray-500">
                          <p>UID: {selectedReport.id.slice(0, 12).toUpperCase()}</p>
                          <p>DATE: {new Date(selectedReport.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  }

                  // For MRI, keep the grid viewer
                  if (!isMri) return null;

                  const mriSlices = [
                    "https://upload.wikimedia.org/wikipedia/commons/7/7a/MRI_Brain_T2_Axial_%2818%29.jpg",
                    "https://upload.wikimedia.org/wikipedia/commons/0/03/MRI_Brain_T2_Cor_%2815%29.jpg",
                    "https://upload.wikimedia.org/wikipedia/commons/c/c5/MRI_brain_sagittal_section.jpg",
                    "https://upload.wikimedia.org/wikipedia/commons/d/da/MRI_Brain_T1_Axial_%289%29.jpg"
                  ];

                  return (
                    <div className="bg-black p-4 rounded-xl border border-gray-800 shadow-xl space-y-4">
                      {/* Grid of Scans or Lab Image */}
                      <div className="grid grid-cols-2 gap-1 bg-gray-900 border border-gray-100">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="relative aspect-square overflow-hidden bg-black border-[0.5px] border-gray-800">
                            {isMri ? (
                              <img 
                                src={mriSlices[i-1]}
                                alt={`MRI Slice ${i}`}
                                className="w-full h-full object-cover filter grayscale contrast-125 brightness-100"
                                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                              />
                            ) : reportUrl ? (
                              <img 
                                src={reportUrl}
                                alt={`Report Image ${i}`}
                                className={`w-full h-full object-cover ${isXray ? 'filter grayscale contrast-125 brightness-90' : ''}`}
                                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                              />
                            ) : null}
                            
                            {/* Standard PACS Overlays */}
                            <div className="absolute top-2 left-2 text-[7px] text-white/50 font-mono">
                              {isXray ? (i === 1 ? 'PA' : i === 2 ? 'LAT' : 'OBL') : (i === 1 ? 'AXIAL' : i === 2 ? 'CORONAL' : i === 3 ? 'SAGITTAL' : 'AXIAL_T1')}
                            </div>
                            <div className="absolute top-2 right-2 text-[7px] text-white/50 font-mono">
                              TR: {isXray ? 'N/A' : (i % 2 === 0 ? '2000' : '2200')} TE: {isXray ? 'N/A' : '30'}
                            </div>
                            <div className="absolute bottom-2 left-2 text-[7px] text-white/50 font-mono uppercase">
                              {selectedReport.name.split(' ')[0]}
                            </div>
                            <div className="absolute bottom-2 right-2 text-[7px] text-white/50 font-mono">
                              L: 400 W: 1500
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-4 px-2 py-3 border-t border-gray-800 text-[8px] font-mono text-gray-400">
                        <div className="space-y-1">
                          <p>SCAN ID: {selectedReport.id.slice(0, 8).toUpperCase()}</p>
                          <p>PATIENT ID: {patientId.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="space-y-1">
                          <p>ACCESSION: ACC-99210</p>
                          <p>STATION: DX-04</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p>DATE: {new Date(selectedReport.date).toLocaleDateString()}</p>
                          <p>SERIES: 102</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-2">Findings</h4>
                    <p className="text-sm text-text leading-relaxed">
                      {selectedReport.description || 'The scan was performed using standard protocols. All visualized structures appear within normal anatomical limits. No acute abnormalities, masses, or significant fluid collections are identified.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-2">Radiology Impression</h4>
                    <div className="p-4 bg-teal-50/30 border border-teal-100/50 rounded-xl">
                      <p className="text-sm font-bold text-teal-900 italic leading-relaxed">
                        {selectedReport.impression || 'No significant pathology detected in the visualized areas. Recommend clinical correlation.'}
                      </p>
                    </div>
                  </div>

                  {/* Doctor's Assessment Section */}
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Stethoscope size={16} />
                      <h4 className="text-sm font-black uppercase tracking-tight">Doctor's Clinical Assessment</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField label="Doctor Notes / Clinical Commentary">
                        <textarea 
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="Add your clinical observations or notes here..."
                          className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </FormField>

                      <FormField label="Follow-up Recommendations">
                        <Input 
                          value={followUp}
                          onChange={(e) => setFollowUp(e.target.value)}
                          placeholder="e.g. Schedule follow-up scan in 6 months"
                        />
                      </FormField>

                      <button 
                        onClick={handleSaveDoctorNotes}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : (
                          <>
                            <Save size={16} />
                            Save Clinical Assessment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-50 mt-8">
              <button className="px-5 py-2.5 rounded-xl font-bold text-text-muted hover:bg-gray-50 transition-colors text-xs flex items-center gap-2 border border-gray-100">
                <Download size={14} />
                Download PDF
              </button>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="cx-btn-primary px-8"
              >
                Close Report
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
