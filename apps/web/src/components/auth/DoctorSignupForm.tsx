"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignupStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { FormField, Input, PasswordInput, Select, Textarea, FileUpload, StepIndicator, NavButtons } from '@/components/ui/FormElements';

const SPECIALTIES = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Endocrinologist',
  'Gastroenterologist', 'Gynecologist', 'Neurologist', 'Oncologist',
  'Ophthalmologist', 'Orthopedic Surgeon', 'Pediatrician', 'Psychiatrist',
  'Pulmonologist', 'Radiologist', 'Urologist',
];

const STEPS = ['Account', 'Credentials', 'Professional', 'Review'];

export default function DoctorSignupForm() {
  const router = useRouter();
  const { step, data, nextStep, prevStep, updateData, setStep, reset } = useSignupStore();
  const currentStep = step - 1;

  const [isLoading, setIsLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [certPreview, setCertPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (stepIndex === 0) {
      if (!data.fullName?.trim()) newErrors.fullName = 'Full name is required';
      if (!data.phone?.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^01[3-9]\d{8}$/.test(data.phone)) newErrors.phone = 'Enter a valid BD phone (01XXXXXXXXX)';
      if (!data.password) newErrors.password = 'Password is required';
      else if (data.password.length < 6) newErrors.password = 'Minimum 6 characters';
      if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    if (stepIndex === 1) {
      if (!data.bmdcNumber?.trim()) newErrors.bmdcNumber = 'BMDC registration number is required';
      if (!data.qualification?.trim()) newErrors.qualification = 'Qualification is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate(currentStep)) nextStep();
  };

  const handleFileChange = (field: string, setPreview: (s: string | null) => void) =>
    (file: File | null) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      updateData({ [field]: file });
    };

  const handleSubmit = async () => {
    if (!validate(currentStep)) return;
    setIsLoading(true);
    try {
      const payload = {
        name: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        role: 'Doctor' as const,
        nidNumber: data.nidNumber || undefined,
        bmdcNumber: data.bmdcNumber,
        qualification: data.qualification,
        specialty: data.specialty,
        experienceYears: data.experienceYears ? parseInt(data.experienceYears) : undefined,
        fee: data.fee ? parseFloat(data.fee) : undefined,
        about: data.about || undefined,
      };
      const res = await authApi.signup(payload);
      if (res.success) {
        toast('Doctor account created! Welcome to careXpatient.', 'success');
        reset();
        router.push('/signup/success');
      }
    } catch (err: any) {
      toast(err.message || 'Signup failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <button
          onClick={() => setStep(0)}
          className="flex items-center gap-1.5 text-sm text-subtle-gray hover:text-foreground transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to role selection
        </button>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Sign Up</h1>
            <p className="text-sm text-subtle-gray">Create your doctor account</p>
          </div>
        </div>
      </div>

      <StepIndicator steps={STEPS} current={currentStep} />

      {/* Step 0: Account Info */}
      {currentStep === 0 && (
        <div className="space-y-4 animate-slide-up">
          <FormField label="Full Name" error={errors.fullName} required>
            <Input
              id="doctor-fullname"
              placeholder="Dr. Enter your full name"
              value={data.fullName || ''}
              onChange={(e) => updateData({ fullName: e.target.value })}
              error={!!errors.fullName}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone Number" error={errors.phone} required>
              <Input
                id="doctor-phone"
                placeholder="01XXXXXXXXX"
                type="tel"
                value={data.phone || ''}
                onChange={(e) => updateData({ phone: e.target.value })}
                error={!!errors.phone}
              />
            </FormField>
            <FormField label="Email (Optional)">
              <Input
                id="doctor-email"
                placeholder="doctor@email.com"
                type="email"
                value={data.email || ''}
                onChange={(e) => updateData({ email: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Password" error={errors.password} required>
              <PasswordInput
                id="doctor-password"
                placeholder="Min. 6 characters"
                value={data.password || ''}
                onChange={(e) => updateData({ password: e.target.value })}
                error={!!errors.password}
              />
            </FormField>
            <FormField label="Confirm Password" error={errors.confirmPassword} required>
              <PasswordInput
                id="doctor-confirm-password"
                placeholder="Re-enter password"
                value={data.confirmPassword || ''}
                onChange={(e) => updateData({ confirmPassword: e.target.value })}
                error={!!errors.confirmPassword}
              />
            </FormField>
          </div>

          <NavButtons onNext={handleNext} />
        </div>
      )}

      {/* Step 1: BMDC & Credentials */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-slide-up">
          <FormField label="BMDC Registration Number" error={errors.bmdcNumber} required hint="Your Bangladesh Medical & Dental Council number">
            <Input
              id="doctor-bmdc"
              placeholder="e.g. A-12345"
              value={data.bmdcNumber || ''}
              onChange={(e) => updateData({ bmdcNumber: e.target.value })}
              error={!!errors.bmdcNumber}
            />
          </FormField>

          <FormField label="Qualification" error={errors.qualification} required hint="e.g. MBBS, MD, FCPS">
            <Input
              id="doctor-qualification"
              placeholder="MBBS, MD (Cardiology)"
              value={data.qualification || ''}
              onChange={(e) => updateData({ qualification: e.target.value })}
              error={!!errors.qualification}
            />
          </FormField>

          <FormField label="Primary Specialty">
            <Select
              id="doctor-specialty"
              value={data.specialty || ''}
              onChange={(e) => updateData({ specialty: e.target.value })}
              placeholder="Select specialty"
            >
              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </FormField>

          <FormField label="NID Number">
            <Input
              id="doctor-nid"
              placeholder="National ID number"
              value={data.nidNumber || ''}
              onChange={(e) => updateData({ nidNumber: e.target.value })}
            />
          </FormField>

          <FormField label="Medical Certificate / BMDC Certificate">
            <FileUpload
              label="Upload certificate"
              accept="image/*,.pdf"
              onChange={handleFileChange('certificate', setCertPreview)}
              preview={certPreview}
              hint="Image or PDF, max 10MB"
            />
          </FormField>

          <NavButtons onBack={prevStep} onNext={handleNext} />
        </div>
      )}

      {/* Step 2: Professional Info */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Years of Experience">
              <Input
                id="doctor-experience"
                type="number"
                placeholder="e.g. 10"
                min="0"
                value={data.experienceYears || ''}
                onChange={(e) => updateData({ experienceYears: e.target.value })}
              />
            </FormField>
            <FormField label="Consultation Fee (BDT)">
              <Input
                id="doctor-fee"
                type="number"
                placeholder="e.g. 800"
                min="0"
                value={data.fee || ''}
                onChange={(e) => updateData({ fee: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="About / Bio" hint="A brief description patients will see on your profile">
            <Textarea
              id="doctor-about"
              placeholder="I specialize in cardiac care with 10+ years of experience..."
              value={data.about || ''}
              onChange={(e) => updateData({ about: e.target.value })}
              className="h-28"
            />
          </FormField>

          <FormField label="Profile Photo">
            <FileUpload
              label="Upload professional photo"
              accept="image/*"
              onChange={handleFileChange('profilePhoto', setProfilePreview)}
              preview={profilePreview}
              hint="Professional headshot, JPG or PNG"
            />
          </FormField>

          <NavButtons onBack={prevStep} onNext={handleNext} />
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === 3 && (
        <div className="animate-slide-up">
          <div className="bg-muted rounded-2xl p-5 space-y-3 mb-6">
            <h3 className="font-semibold text-foreground text-sm mb-4">Review Your Information</h3>
            {[
              { label: 'Full Name', value: data.fullName },
              { label: 'Phone', value: data.phone },
              { label: 'Email', value: data.email || 'Not provided' },
              { label: 'BMDC Number', value: data.bmdcNumber },
              { label: 'Qualification', value: data.qualification },
              { label: 'Specialty', value: data.specialty || 'Not specified' },
              { label: 'Experience', value: data.experienceYears ? `${data.experienceYears} years` : 'Not provided' },
              { label: 'Consultation Fee', value: data.fee ? `BDT ${data.fee}` : 'Not provided' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-subtle-gray">{label}</span>
                <span className="font-medium text-foreground text-right max-w-[60%] truncate">{value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-subtle-gray text-center mb-4 leading-relaxed">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>

          <NavButtons
            onBack={prevStep}
            isLastStep
            isLoading={isLoading}
            nextLabel="Create Doctor Account"
            onNext={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
