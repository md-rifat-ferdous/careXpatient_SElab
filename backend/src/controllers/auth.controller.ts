import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { z } from 'zod';

const signupSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['Patient', 'Doctor', 'Lab', 'Nurse', 'Admin']),
  nidNumber: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  // Patient fields
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  // Doctor fields
  bmdcNumber: z.string().optional(),
  qualification: z.string().optional(),
  experienceYears: z.union([z.string(), z.number()]).optional(),
  fee: z.union([z.string(), z.number()]).optional(),
  about: z.string().optional(),
  // Lab fields
  labName: z.string().optional(),
  labAddress: z.string().optional(),
  labPhone: z.string().optional(),
});

const loginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const parsedData = signupSchema.parse(req.body);
      const result = await AuthService.signup(parsedData);
      
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const parsedData = loginSchema.parse(req.body);
      const result = await AuthService.login(parsedData);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      res.status(401).json({ success: false, message: error.message });
    }
  }

  static async sendOtp(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required.' });
      }

      const otp = OtpService.generateOtp(phone);
      console.log(`[OTP] Generated OTP for ${phone}: ${otp}`);

      res.json({ success: true, message: 'OTP sent successfully.' });
    } catch (error: any) {
      console.error('[OTP] Error sending OTP:', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
      }

      const result = OtpService.verifyOtp(phone, otp);
      if (!result.valid) {
        return res.status(400).json({ success: false, message: result.reason });
      }

      res.json({ success: true, message: 'OTP verified successfully.' });
    } catch (error: any) {
      console.error('[OTP] Error verifying OTP:', error);
      res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
    }
  }
}
