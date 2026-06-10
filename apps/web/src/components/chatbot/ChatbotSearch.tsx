'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth.store';
import { Doctor } from '../../types/doctor';
import ChatbotBookingDrawer from './ChatbotBookingDrawer';

type BotState = 'input' | 'loading' | 'result';

interface ChatbotResponse {
  success: boolean;
  recommendation: {
    department: string;
    confidence: number;
    reason: string;
  };
  doctors: Doctor[];
}

function ChatbotSearchInner() {
  const { user, isAuthenticated } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [symptoms, setSymptoms] = useState('');
  const [botState, setBotState] = useState<BotState>('input');
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ChatbotResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Booking drawer
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Login modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState('');

  // Loading animation simulation messages
  const LOADING_MESSAGES = [
    'Analyzing symptoms with Gemini AI...',
    'Matching conditions with medical databases...',
    'Locating the most relevant hospital departments...',
    'Fetching details of verified specialists...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (botState === 'loading') {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 900);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [botState]);

  useEffect(() => {
    const bookDoctorId = searchParams.get('bookDoctorId');
    if (bookDoctorId && isAuthenticated && user?.role === 'Patient') {
      const fetchDoctorAndOpenDrawer = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/doctors/profile/${bookDoctorId}`);
          if (!response.ok) throw new Error('Doctor not found');
          const doctorData = await response.json();
          setSelectedDoctor(doctorData);
          setIsDrawerOpen(true);
          
          // Clear query params so refreshing the page doesn't keep opening the drawer
          router.replace('/');
        } catch (err) {
          console.error('Error auto-opening doctor booking:', err);
        }
      };
      
      fetchDoctorAndOpenDrawer();
    }
  }, [searchParams, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setBotState('loading');
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/recommend-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations. Please check server connection.');
      }

      const data: ChatbotResponse = await response.json();
      if (data.success) {
        setResult(data);
        setBotState('result');
      } else {
        throw new Error('Incomplete data response from backend service.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setBotState('input');
    }
  };

  const handleBookNow = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    if (!isAuthenticated) {
      setLoginErrorMsg('Please log in as a patient to schedule an appointment with this doctor.');
      setIsLoginModalOpen(true);
      return;
    }

    if (user?.role !== 'Patient') {
      setLoginErrorMsg('Only accounts with the Patient role can schedule doctor appointments.');
      setIsLoginModalOpen(true);
      return;
    }

    setIsDrawerOpen(true);
  };

  const resetChatbot = () => {
    setSymptoms('');
    setResult(null);
    setBotState('input');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-teal-500/5 border border-slate-100 p-8 lg:p-10 relative overflow-hidden transition-all duration-500 min-h-[350px] flex flex-col justify-center">
        
        {/* Background glowing decorations */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-50 rounded-full blur-3xl -z-10 opacity-60"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-sky-50 rounded-full blur-3xl -z-10 opacity-60"></div>

        {botState === 'input' && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-100/50 text-teal-600 text-xs font-black uppercase tracking-widest mb-3">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                AI Triage Assistant
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                Describe symptoms to find the right care.
              </h2>
              <p className="text-sm md:text-base text-slate-400 font-bold mt-1">
                Describe how you are feeling (e.g., chest pain, baby fever) and Gemini will recommend a specialist.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Type your symptoms here in detail... (e.g., 'I have had a throbbing headache and dizziness since this morning, and light makes my eyes hurt.')"
                className="w-full h-32 px-5 py-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 text-[15px] font-medium outline-none focus:ring-4 focus:ring-teal-100 focus:bg-white focus:border-teal-400 transition-all placeholder:text-slate-300 resize-none"
                required
              />
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span> {errorMsg}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!symptoms.trim()}
                className="w-full md:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold text-base shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:scale-100 cursor-pointer"
              >
                Ask AI Assistant
              </button>
            </div>
          </form>
        )}

        {botState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center animate-in fade-in">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-3.5 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 text-xl font-black">AI</div>
            </div>
            
            <div className="space-y-2 max-w-sm">
              <h4 className="font-extrabold text-slate-800 text-lg">Consulting AI Doctor</h4>
              <p className="text-sm font-bold text-slate-400 h-6 transition-all duration-300">
                {LOADING_MESSAGES[loadingStep]}
              </p>
            </div>
          </div>
        )}

        {botState === 'result' && result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
            
            {/* Top diagnostic card */}
            <div className="bg-gradient-to-br from-teal-500/10 to-sky-500/5 border border-teal-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-6 relative">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🩺</span>
                  <div>
                    <span className="text-[10px] font-black text-teal-600 bg-teal-100/70 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Recommended Department</span>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{result.recommendation.department}</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-semibold pr-2">
                  {result.recommendation.reason}
                </p>
              </div>

              {/* Confidence Circle */}
              <div className="flex items-center gap-4 bg-white/70 border border-teal-100/50 p-4 rounded-2xl shrink-0 self-stretch justify-center md:justify-start">
                <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-teal-50">
                  <span className="text-base font-black text-teal-600">{result.recommendation.confidence}%</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Confidence</h4>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">Gemini AI Model Match</p>
                </div>
              </div>
            </div>

            {/* Doctors Section */}
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-lg">Matching Specialists Available</h4>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">Showing verified & highly rated doctors in {result.recommendation.department}</p>
                </div>
                <button onClick={resetChatbot} className="text-xs font-black text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wider underline cursor-pointer">
                  Start New Inquiry
                </button>
              </div>

              {result.doctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.doctors.map((doctor) => (
                    <div key={doctor.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                      
                      <div>
                        {/* Avatar & Header */}
                        <div className="flex items-start gap-4">
                          <img
                            src={doctor.user.profilePhotoUrl || 'https://via.placeholder.com/150'}
                            alt={doctor.user.fullName}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100"
                          />
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-800 text-sm group-hover:text-teal-600 transition-colors">{doctor.user.fullName}</h5>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{doctor.specialties[0]?.specialty.name}</p>
                            
                            {/* Stars Rating */}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-yellow-400 text-xs">★</span>
                              <span className="text-xs font-extrabold text-slate-700">{parseFloat(doctor.rating).toFixed(1)}</span>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <span className="text-[10px] text-slate-400 font-bold">{doctor.reviewCount} reviews</span>
                            </div>
                          </div>
                        </div>

                        {/* Qualifications & Experience */}
                        <div className="mt-4 space-y-2 text-xs font-semibold text-slate-500">
                          <p className="text-[11px] bg-slate-50 border border-slate-100 rounded-lg p-2 leading-relaxed italic text-slate-600">
                            {doctor.qualification}
                          </p>
                          <div className="flex justify-between border-b border-slate-50 pb-2 pt-1">
                            <span>Experience</span>
                            <span className="text-slate-700 font-bold">{doctor.experienceYears} Years</span>
                          </div>
                        </div>

                        {/* Clinics & Schedules */}
                        <div className="mt-3.5 space-y-2">
                          <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locations & Shift Times</h6>
                          {doctor.clinics && doctor.clinics.length > 0 ? (
                            doctor.clinics.map((dc: any) => (
                              <div key={dc.clinic.id} className="bg-slate-50/50 border border-slate-100/50 rounded-xl p-2.5 flex items-start gap-2">
                                <span className="text-sm shrink-0">🏥</span>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-700">{dc.clinic.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold leading-none">{dc.shift || 'Schedule shift pending'}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-slate-400 font-bold flex items-center gap-1">
                              <span>🎥</span> Online Consultation Only
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-6 flex justify-between items-center gap-3 pt-3 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Consultation Fee</p>
                          <p className="text-lg font-black text-teal-600 mt-1">৳{parseFloat(doctor.fee).toFixed(0)}</p>
                        </div>
                        <button
                          onClick={() => handleBookNow(doctor)}
                          className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                        >
                          Book Now
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 border border-dashed border-slate-200 bg-slate-50/30 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-4xl mb-3">🧑‍⚕️</span>
                  <h5 className="font-extrabold text-slate-800">No matching specialists found</h5>
                  <p className="text-xs text-slate-400 max-w-xs mt-1 font-bold">
                    We currently do not have registered doctors in the recommended {result.recommendation.department} department. We suggest consulting a general practitioner.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Login Requirement Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 z-10 animate-in fade-in slide-in-from-bottom-8">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              ✕
            </button>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">🔐</div>
              <h3 className="text-xl font-black text-slate-800">Patient Login Required</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {loginErrorMsg}
              </p>
              
              <div className="flex flex-col gap-2 pt-4">
                <Link
                  href={`/login?redirectTo=/?bookDoctorId=${selectedDoctor?.id}`}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-sm transition-all text-center block"
                >
                  Go to Login
                </Link>
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Booking Drawer */}
      <ChatbotBookingDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
      />
    </div>
  );
}

export default function ChatbotSearch() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-bold text-sm">Loading AI assistant...</div>}>
      <ChatbotSearchInner />
    </Suspense>
  );
}
