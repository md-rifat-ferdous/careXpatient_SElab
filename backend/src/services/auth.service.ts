import * as bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateToken } from '../utils/auth';
import { UserRole } from '@prisma/client';

export class AuthService {
  static async signup(data: any) {
    const {
      phone, email, password, fullName, role,
      nidNumber, profilePhotoUrl,
      // Patient specifics
      dateOfBirth, bloodGroup, address, allergies, medicalHistory,
      // Doctor specifics
      bmdcNumber, qualification, experienceYears, fee, about,
      // Lab specifics
      labName, labAddress, labPhone
    } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      throw new Error('User with this phone number already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to create User and corresponding profile
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phone,
          email,
          password: hashedPassword,
          fullName,
          role: role as UserRole,
          nidNumber,
          profilePhotoUrl,
        },
      });

      if (role === UserRole.Patient) {
        await tx.patient.create({
          data: {
            userId: newUser.id,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            bloodGroup,
            address,
            allergies,
            medicalHistory,
          },
        });
      } else if (role === UserRole.Doctor) {
        await tx.doctor.create({
          data: {
            userId: newUser.id,
            bmdcNumber,
            qualification,
            experienceYears: experienceYears ? parseInt(experienceYears) : null,
            fee: fee ? parseFloat(fee) : null,
            about,
          },
        });
      } else if (role === UserRole.Lab) {
        await tx.lab.create({
          data: {
            userId: newUser.id,
            name: labName,
            address: labAddress,
            phone: labPhone,
          },
        });
      }

      return newUser;
    });

    // We convert BigInt to String to store in JWT and send to client
    const token = generateToken({ userId: user.id.toString(), role: user.role });

    // Exclude password before returning
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: {
        ...userWithoutPassword,
        id: user.id.toString(),
      },
      token,
    };
  }

  static async login(data: any) {
    const { phone, password } = data;

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    if (!user.password) {
      throw new Error('Invalid credentials.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials.');
    }

    const token = generateToken({ userId: user.id.toString(), role: user.role });

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: {
        ...userWithoutPassword,
        id: user.id.toString(),
      },
      token,
    };
  }
}
