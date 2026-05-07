'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Doctor } from '../../types/doctor';
import { bookAppointment } from '../../services/doctor.service';
import { useAuthStore } from '../../store/auth.store';
import { slots } from '../../data/doctors';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATIC_OTP = '1234';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

type DrawerStep = 'form' | 'otp' | 'success';

export default function BookingDrawer({ isOpen, onClose, doctor }: BookingDrawerProps) {
  const { user } = useAuthStore();
  const [consultationType, setConsultationType] = useState<'Online' | 'In-person'>('Online');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP state
  const [step, setStep] = useState<DrawerStep>('form');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Pre-fill user info
  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user, isOpen]);

  // Generate some available dates (today + next 3 days)
  const availableDates = [0, 1, 2, 3].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  });

  const slotsForDate = selectedDate ? slots([true, true, false, true, true, false, true, true]) : [];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    if (!phone.trim()) e.phone = 'Phone number is required.';
    if (!selectedDate) e.date = 'Please select a date.';
    if (!selectedSlot) e.slot = 'Please select a time slot.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirmForm = () => {
    if (!validate()) return;
    setOtp(['', '', '', '']);
    setOtpError('');
    setStep('otp');
    setTimeout(() => otpRefs[0].current?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError('');
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (!doctor || !user) return;
    const entered = otp.join('');
    if (entered.length < 4) { setOtpError('Please enter the 4-digit OTP.'); return; }
    setIsVerifying(true);
    
    // In a real app, this would verify with backend
    setTimeout(async () => {
      if (entered === STATIC_OTP) {
        try {
          await bookAppointment({
            doctorId: doctor.id,
            patientId: user.id.toString(),
            type: consultationType === 'Online' ? 'Online' : 'In-person',
            date: selectedDate,
            timeSlot: selectedSlot,
          });
          setStep('success');
        } catch (err: any) {
          setOtpError(err.message || 'Failed to book appointment. Please try again.');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setIsVerifying(false);
        setOtpError('Invalid OTP. Please try again. (Hint: 1234)');
        setOtp(['', '', '', '']);
        otpRefs[0].current?.focus();
      }
    }, 900);
  };

  const handleClose = () => {
    setStep('form');
    setSelectedDate('');
    setSelectedSlot('');
    setErrors({});
    setOtp(['', '', '', '']);
    setOtpError('');
    setConsultationType('Online');
    onClose();
  };

  if (!isOpen || !doctor) return null;

  return (
    <>
      <div onClick={handleClose} className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-40" />

      <aside className={`fixed right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center mb-6 ring-8 ring-teal-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">Appointment Confirmed!</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">Your appointment has been successfully booked. You'll receive a confirmation on your phone.</p>

            <div className="w-full bg-gradient-to-br from-teal-50 to-slate-50 border border-teal-100 rounded-2xl p-5 text-left mb-8 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-teal-100">
                <img src={doctor.user.profilePhotoUrl || ''} alt={doctor.user.fullName} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">{doctor.user.fullName}</p>
                  <p className="text-xs text-teal-600">{doctor.specialties[0]?.specialty.name}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Patient</span><span className="font-semibold text-slate-700">{fullName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Date</span><span className="font-semibold text-slate-700">{formatDate(selectedDate)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Time</span><span className="font-semibold text-slate-700">{selectedSlot}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Type</span><span className="font-semibold text-slate-700">{consultationType}</span></div>
              <div className="flex justify-between items-center pt-3 border-t border-teal-100">
                <span className="font-bold text-slate-700">Consultation Fee</span>
                <span className="text-2xl font-black text-teal-600">৳{doctor.fee}</span>
              </div>
            </div>
            <button onClick={handleClose} className="w-full py-3.5 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20">
              Done
            </button>
          </div>
        )}

        {step === 'otp' && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <button onClick={() => setStep('form')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
              <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5a2 2 0 0 1 1.99-2H6.5a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-1">OTP Verification</h2>
              <p className="text-sm text-slate-400 text-center mb-2">OTP has been sent to your phone number</p>
              <p className="text-sm font-bold text-slate-700 mb-8">{phone}</p>

              <div className="flex gap-3 mb-4">
                {otp.map((digit, i) => (
                  <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-14 h-14 text-center text-2xl font-black border-2 rounded-xl outline-none transition-all ${otpError ? 'border-red-400 bg-red-50 text-red-600' : digit ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-teal-400 focus:bg-white'}`}
                  />
                ))}
              </div>

              {otpError && <p className="text-red-500 text-sm font-medium mb-4">{otpError}</p>}
              <button onClick={handleVerifyOtp} disabled={isVerifying}
                className="w-full py-3.5 bg-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-600 active:scale-[0.98] transition-all disabled:opacity-60">
                {isVerifying ? 'Verifying...' : 'Verify & Confirm'}
              </button>
            </div>
          </>
        )}

        {step === 'form' && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Book Appointment</h2>
              </div>
              <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <img src={doctor.user.profilePhotoUrl || ''} alt={doctor.user.fullName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">{doctor.user.fullName}</p>
                  <p className="text-xs text-teal-600 font-semibold">{doctor.specialties[0]?.specialty.name}</p>
                  <p className="text-xs text-slate-400">{doctor.qualification}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Consultation Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  {(['Online', 'In-person'] as const).map((t) => (
                    <button key={t} onClick={() => setConsultationType(t)}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${consultationType === t ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}>
                      {t === 'Online' ? '🎥 Online' : '🏥 In-person'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Date</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableDates.map((date) => {
                    const d = new Date(date + 'T00:00:00');
                    const isSelected = selectedDate === date;
                    return (
                      <button key={date} onClick={() => { setSelectedDate(date); setSelectedSlot(''); setErrors((e) => ({ ...e, date: '' })); }}
                        className={`flex flex-col items-center py-2.5 rounded-xl border text-xs font-semibold transition-all ${isSelected ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-100' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300'}`}>
                        <span className={`text-[10px] uppercase ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>{DAYS[d.getDay()]}</span>
                        <span className="text-base font-black mt-0.5">{d.getDate()}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>{MONTHS[d.getMonth()]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Time</label>
                  <div className="grid grid-cols-4 gap-2">
                    {slotsForDate.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button key={slot.id} disabled={!slot.available}
                          onClick={() => { setSelectedSlot(slot.time); setErrors((e) => ({ ...e, slot: '' })); }}
                          className={`py-2 rounded-lg text-xs font-semibold border transition-all ${!slot.available ? 'bg-slate-50 text-slate-300 border-slate-100' : isSelected ? 'bg-teal-500 text-white border-teal-500' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'}`}>
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase">Patient Information</label>
                <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-teal-400 transition-all" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-teal-400 transition-all" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100">
              <button onClick={handleConfirmForm} className="w-full py-3.5 bg-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-600 active:scale-[0.98] transition-all">
                Confirm Appointment
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
