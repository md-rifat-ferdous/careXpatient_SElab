import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import prisma from '../config/prisma';

// Helper to serialize BigInt
const serialize = (data: any) =>
  JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));

export class ChatbotController {
  static async recommendDoctor(req: Request, res: Response) {
    try {
      const { symptoms } = req.body;

      if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Symptoms description is required and must be a non-empty string.',
        });
      }

      // 1. Send symptoms to Gemini API (or fallback)
      const recommendation = await GeminiService.recommendDepartment(symptoms.trim());

      // 2. Query matching doctors belonging to the recommended specialty
      const doctors = await prisma.doctor.findMany({
        where: {
          specialties: {
            some: {
              specialty: {
                name: recommendation.department,
              },
            },
          },
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              fullName: true,
              profilePhotoUrl: true,
            },
          },
          specialties: {
            include: {
              specialty: true,
            },
          },
          clinics: {
            include: {
              clinic: true,
            },
          },
        },
      });

      // 3. Format and serialize BigInt
      const serializedDoctors = serialize(doctors);

      res.status(200).json({
        success: true,
        recommendation,
        doctors: serializedDoctors,
      });

    } catch (error: any) {
      console.error('Error in recommendDoctor controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while analyzing symptoms.',
        error: error.message,
      });
    }
  }
}
