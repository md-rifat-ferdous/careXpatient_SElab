import { z } from 'zod';

export const loginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupRoleSchema = z.object({
  role: z.enum(['Patient', 'Doctor', 'Lab']),
});

export const signupBasicInfoSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const patientDetailsSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export const doctorDetailsSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  bmdcNumber: z.string().min(4, 'BMDC Registration Number is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  experienceYears: z.string().optional(),
  fee: z.string().optional(),
  about: z.string().optional(),
});

export const labDetailsSchema = z.object({
  fullName: z.string().min(2, 'Admin name is required'),
  labName: z.string().min(2, 'Lab name is required'),
  labAddress: z.string().min(5, 'Lab address is required'),
  labPhone: z.string().min(10, 'Lab phone is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupBasicInfoInput = z.infer<typeof signupBasicInfoSchema>;
export type PatientDetailsInput = z.infer<typeof patientDetailsSchema>;
export type DoctorDetailsInput = z.infer<typeof doctorDetailsSchema>;
export type LabDetailsInput = z.infer<typeof labDetailsSchema>;
