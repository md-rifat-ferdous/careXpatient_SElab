"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignupStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { FormField, Input, PasswordInput, Select, Textarea, FileUpload, StepIndicator, NavButtons } from '@/components/ui/FormElements';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STEPS = ['Account', 'Personal', 'Medical', 'Review'];

export default function PatientSignupForm() {
  const router = useRouter();
  const { step, data, nextStep, prevStep, updateData, setStep, reset } = useSignupStore();
  const currentStep = step - 1; // step 0 is role selection

  const [isLoading, setIsLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [nidPreview, setNidPreview] = useState(null);

  const [errors, setErrors] = useState({});

  const validate = (stepIndex) => {
    const newErrors = {};
    if (stepIndex === 0) {
      if (!data.fullName?.trim()) newErrors.fullName = 'Full name is required';
      const cleanPhone = data.phone?.trim() || '';
      if (!cleanPhone) newErrors.phone = 'Phone number is required';else
      if (!/^01[3-9]\d{8}$/.test(cleanPhone)) newErrors.phone = 'Enter a valid BD phone number (01XXXXXXXXX)';
      if (!data.password) newErrors.password = 'Password is required';else
      if (data.password.length < 6) newErrors.password = 'Minimum 6 characters';
      if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    if (stepIndex === 1) {
      if (!data.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate(currentStep)) nextStep();
  };

  const handleFileChange = (field, setPreview) =>
  (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result);
    reader.readAsDataURL(file);
    updateData({ [field]: file });
  };

  const handleSubmit = async () => {
    if (!validate(currentStep)) return;
    setIsLoading(true);
    try {
      const payload = {
        fullName: data.fullName,
        phone: data.phone?.trim() || '',
        email: data.email || undefined,
        password: data.password,
        role: 'Patient',
        nidNumber: data.nidNumber || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        bloodGroup: data.bloodGroup || undefined,
        address: data.address || undefined,
        allergies: data.allergies || undefined,
        medicalHistory: data.medicalHistory || undefined
      };
      const res = await authApi.signup(payload);
      if (res.success) {
        toast('Account created successfully! Welcome to careXpatient.', 'success');
        reset();
        router.push('/signup/success');
      }
    } catch (err) {
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
          className="flex items-center gap-1.5 text-sm text-subtle-gray hover:text-foreground transition-colors mb-4">
          
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to role selection
        </button>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patient Sign Up</h1>
            <p className="text-sm text-subtle-gray">Create your patient account</p>
          </div>
        </div>
      </div>

      <StepIndicator steps={STEPS} current={currentStep} />

      {/* Step 0: Account Info */}
      {currentStep === 0 &&
      <div className="space-y-4 animate-slide-up">
          <FormField label="Full Name" error={errors.fullName} required>
            <Input
            id="patient-fullname"
            placeholder="Enter your full name"
            value={data.fullName || ''}
            onChange={(e) => updateData({ fullName: e.target.value })}
            error={!!errors.fullName}
            leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
          
          </FormField>

          <FormField label="Phone Number" error={errors.phone} required hint="Bangladesh mobile number (e.g. 01XXXXXXXXX)">
            <Input
            id="patient-phone"
            placeholder="01XXXXXXXXX"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => updateData({ phone: e.target.value })}
            error={!!errors.phone}
            leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} />
          
          </FormField>

          <FormField label="Email (Optional)">
            <Input
            id="patient-email"
            placeholder="your@email.com"
            type="email"
            value={data.email || ''}
            onChange={(e) => updateData({ email: e.target.value })}
            leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
          
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Password" error={errors.password} required>
              <PasswordInput
              id="patient-password"
              placeholder="Min. 6 characters"
              value={data.password || ''}
              onChange={(e) => updateData({ password: e.target.value })}
              error={!!errors.password} />
            
            </FormField>
            <FormField label="Confirm Password" error={errors.confirmPassword} required>
              <PasswordInput
              id="patient-confirm-password"
              placeholder="Re-enter password"
              value={data.confirmPassword || ''}
              onChange={(e) => updateData({ confirmPassword: e.target.value })}
              error={!!errors.confirmPassword} />
            
            </FormField>
          </div>

          <NavButtons onNext={handleNext} />
        </div>
      }

      {/* Step 1: Personal Info */}
      {currentStep === 1 &&
      <div className="space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date of Birth" error={errors.dateOfBirth} required>
              <Input
              id="patient-dob"
              type="date"
              value={data.dateOfBirth || ''}
              onChange={(e) => updateData({ dateOfBirth: e.target.value })}
              error={!!errors.dateOfBirth} />
            
            </FormField>
            <FormField label="Blood Group">
              <Select
              id="patient-blood"
              value={data.bloodGroup || ''}
              onChange={(e) => updateData({ bloodGroup: e.target.value })}
              placeholder="Select">
              
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </Select>
            </FormField>
          </div>

          <FormField label="Address">
            <Textarea
            id="patient-address"
            placeholder="Your current address"
            value={data.address || ''}
            onChange={(e) => updateData({ address: e.target.value })} />
          
          </FormField>

          <FormField label="NID Number">
            <Input
            id="patient-nid"
            placeholder="National ID number"
            value={data.nidNumber || ''}
            onChange={(e) => updateData({ nidNumber: e.target.value })} />
          
          </FormField>

          <NavButtons onBack={prevStep} onNext={handleNext} />
        </div>
      }

      {/* Step 2: Medical Info */}
      {currentStep === 2 &&
      <div className="space-y-4 animate-slide-up">
          <FormField label="Known Allergies" hint="List any known allergies or write 'None'">
            <Textarea
            id="patient-allergies"
            placeholder="e.g. Penicillin, Aspirin, Pollen..."
            value={data.allergies || ''}
            onChange={(e) => updateData({ allergies: e.target.value })} />
          
          </FormField>

          <FormField label="Medical History" hint="Any chronic conditions, past surgeries, etc.">
            <Textarea
            id="patient-history"
            placeholder="e.g. Diabetes (Type 2), Appendectomy 2019..."
            value={data.medicalHistory || ''}
            onChange={(e) => updateData({ medicalHistory: e.target.value })}
            className="h-28" />
          
          </FormField>

          <FormField label="Profile Photo">
            <FileUpload
            label="Upload profile photo"
            accept="image/*"
            onChange={handleFileChange('profilePhoto', setProfilePreview)}
            preview={profilePreview}
            hint="JPG or PNG, max 5MB" />
          
          </FormField>

          <NavButtons onBack={prevStep} onNext={handleNext} />
        </div>
      }

      {/* Step 3: Review & Submit */}
      {currentStep === 3 &&
      <div className="animate-slide-up">
          <div className="bg-muted rounded-2xl p-5 space-y-3 mb-6">
            <h3 className="font-semibold text-foreground text-sm mb-4">Review Your Information</h3>
            {[
          { label: 'Full Name', value: data.fullName },
          { label: 'Phone', value: data.phone },
          { label: 'Email', value: data.email || 'Not provided' },
          { label: 'Date of Birth', value: data.dateOfBirth || 'Not provided' },
          { label: 'Blood Group', value: data.bloodGroup || 'Not provided' },
          { label: 'Address', value: data.address || 'Not provided' },
          { label: 'Allergies', value: data.allergies || 'None' }].
          map(({ label, value }) =>
          <div key={label} className="flex justify-between text-sm">
                <span className="text-subtle-gray">{label}</span>
                <span className="font-medium text-foreground text-right max-w-[60%] truncate">{value}</span>
              </div>
          )}
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
          nextLabel="Create Patient Account"
          onNext={handleSubmit} />
        
        </div>
      }
    </div>);

}