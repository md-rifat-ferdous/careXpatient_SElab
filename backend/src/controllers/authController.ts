import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { generateToken } from '../utils/jwt';

export const registerDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      email, 
      password, 
      name, 
      phone,
      specialty, 
      bmdcNumber, 
      qualification, 
      nidNumber, 
      experienceYears, 
      fee, 
      about 
    } = req.body;

    console.log('Registering doctor with body:', req.body);

    if (email) {
      const doctorExists = await prisma.doctor.findUnique({ where: { email } });
      if (doctorExists) {
        res.status(400).json({ message: 'Doctor with this email already exists' });
        return;
      }
    }

    if (phone) {
      const doctorExists = await prisma.doctor.findUnique({ where: { phone } });
      if (doctorExists) {
        res.status(400).json({ message: 'Doctor with this phone number already exists' });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctor = await prisma.doctor.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        specialty,
        bmdcNumber,
        qualification,
        nidNumber,
        experienceYears,
        fee,
        about
      }
    });

    res.status(201).json({
      success: true,
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      token: generateToken(doctor.id, doctor.email)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const loginDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email: identifier, password } = req.body;
    console.log('[LoginDebug] Attempting login for:', identifier);

    const doctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!doctor) {
      console.log('[LoginDebug] No doctor found with identifier:', identifier);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    console.log('[LoginDebug] Password match:', isMatch);

    if (isMatch) {
      const token = generateToken(doctor.id, doctor.email || doctor.phone || '');
      console.log('[LoginDebug] Login successful. Doctor ID:', doctor.id);
      console.log('[LoginDebug] Generated Token Payload:', { id: doctor.id, email: doctor.email });

      res.json({
        success: true,
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error: any) {
    console.error('[LoginDebug] Error:', error);
    res.status(500).json({ message: error.message });
  }
};
