"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignupStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { FormField, Input, PasswordInput, Textarea, FileUpload, StepIndicator, NavButtons } from '@/components/ui/FormElements';

const STEPS = ['Account', 'Lab Info', 'Documents', 'Review'];

export default function LabSignupForm() {
  const router = useRouter();
  const { step, data, nextStep, prevStep, updateData, setStep, reset } = useSignupStore();
  const currentStep = step - 1;

  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [tradePreview, setTradePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (stepIndex === 0) {
      if (!data.fullName?.trim()) newErrors.fullName = 'Manager/owner name is required';
      const cleanPhone = data.phone?.trim() || '';
      if (!cleanPhone) newErrors.phone = 'Phone number is required';
      else if (!/^01[3-9]\d{8}$/.test(cleanPhone)) newErrors.phone = 'Enter a valid BD phone (01XXXXXXXXX)';
      if (!data.password) newErrors.password = 'Password is required';
      else if (data.password.length < 6) newErrors.password = 'Minimum 6 characters';
      if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    if (stepIndex === 1) {
      if (!data.labName?.trim()) newErrors.labName = 'Lab name is required';
      if (!data.labAddress?.trim()) newErrors.labAddress = 'Lab address is required';
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
        fullName: data.fullName,
        phone: data.phone?.trim() || '',
        email: data.email || undefined,
        password: data.password,
        role: 'Lab' as const,
        labName: data.labName,
        labAddress: data.labAddress,
        labPhone: data.labPhone?.trim() || data.phone?.trim() || '',
      };
      const res = await authApi.signup(payload);
      if (res.success) {
        toast('Lab account created! Welcome to careXpatient.', 'success');
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
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lab Sign Up</h1>
            <p className="text-sm text-subtle-gray">Register your diagnostic lab</p>
          </div>
        </div>
      </div>

      <StepIndicator steps={STEPS} current={currentStep} />

      {/* Step 0: Account Info */}
      {currentStep === 0 && (
        <div className="space-y-4 animate-slide-up">
          <FormField label="Manager / Owner Name" error={errors.fullName} required>
            <Input
              id="lab-fullname"
              placeholder="Account manager's full name"
              value={data.fullName || ''}
              onChange={(e) => updateData({ fullName: e.target.value })}
              error={!!errors.fullName}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone Number" error={errors.phone} required>
              <Input
                id="lab-phone"
                placeholder="01XXXXXXXXX"
                type="tel"
                value={data.phone || ''}
                onChange={(e) => updateData({ phone: e.target.value })}
                error={!!errors.phone}
              />
            </FormField>
            <FormField label="Email (Optional)">
              <Input
                id="lab-email"
                placeholder="lab@email.com"
                type="email"
                value={data.email || ''}
                onChange={(e) => updateData({ email: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Password" error={errors.password} required>
              <PasswordInput
                id="lab-password"
                placeholder="Min. 6 characters"
                value={data.password || ''}
                onChange={(e) => updateData({ password: e.target.value })}
                error={!!errors.password}
              />
            </FormField>
            <FormField label="Confirm Password" error={errors.confirmPassword} required>
              <PasswordInput
                id="lab-confirm-password"
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

      {/* Step 1: Lab Info */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-slide-up">
          <FormField label="Lab Name" error={errors.labName} required>
            <Input
              id="lab-name"
              placeholder="e.g. Dhaka Diagnostic Center"
              value={data.labName || ''}
              onChange={(e) => updateData({ labName: e.target.value })}
              error={!!errors.labName}
            />
          </FormField>

          <FormField label="Lab Address" error={errors.labAddress} required>
            <Textarea
              id="lab-address"
              placeholder="Full lab address including city"
              value={data.labAddress || ''}
              onChange={(e) => updateData({ labAddress: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Lab Phone Number">
              <Input
                id="lab-lab-phone"
                placeholder="Lab contact number"
                type="tel"
                value={data.labPhone || ''}
                onChange={(e) => updateData({ labPhone: e.target.value })}
              />
            </FormField>
            <FormField label="DGHS License No.">
              <Input
                id="lab-dghs"
                placeholder="DGHS license number"
                value={data.dghsLicense || ''}
                onChange={(e) => updateData({ dghsLicense: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Lab Logo">
            <FileUpload
              label="Upload lab logo"
              accept="image/*"
              onChange={handleFileChange('labLogo', setLogoPreview)}
              preview={logoPreview}
              hint="PNG or JPG, max 5MB"
            />
          </FormField>

          <NavButtons onBack={prevStep} onNext={handleNext} />
        </div>
      )}

      {/* Step 2: Documents */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-slide-up">
          <p className="text-sm text-subtle-gray bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-start gap-2">
            <svg className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
            </svg>
            Please upload your official documents for verification. Our team will review within 2-3 business days.
          </p>

          <FormField label="DGHS License / Certificate">
            <FileUpload
              label="Upload DGHS License"
              accept="image/*,.pdf"
              onChange={handleFileChange('dghsCert', setLicensePreview)}
              preview={licensePreview}
              hint="Official DGHS license document"
            />
          </FormField>

          <FormField label="Trade License">
            <FileUpload
              label="Upload Trade License"
              accept="image/*,.pdf"
              onChange={handleFileChange('tradeLicense', setTradePreview)}
              preview={tradePreview}
              hint="Business trade license"
            />
          </FormField>

          <NavButtons onBack={prevStep} onNext={handleNext} />
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="animate-slide-up">
          <div className="bg-muted rounded-2xl p-5 space-y-3 mb-6">
            <h3 className="font-semibold text-foreground text-sm mb-4">Review Your Information</h3>
            {[
              { label: 'Manager Name', value: data.fullName },
              { label: 'Account Phone', value: data.phone },
              { label: 'Email', value: data.email || 'Not provided' },
              { label: 'Lab Name', value: data.labName },
              { label: 'Lab Address', value: data.labAddress },
              { label: 'Lab Phone', value: data.labPhone || data.phone },
              { label: 'DGHS License', value: data.dghsLicense || 'Not provided' },
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
            nextLabel="Register Lab Account"
            onNext={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
