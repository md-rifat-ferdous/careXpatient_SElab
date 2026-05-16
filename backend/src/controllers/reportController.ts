import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getReportsByPatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    // Verify patient exists
    const patient = await prisma.patient.findFirst({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    const reports = await prisma.report.findMany({
      where: { patientId },
      orderBy: { date: 'desc' }
    });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { name, labName, date, fileUrl, description } = req.body;

    // Verify patient exists
    const patient = await prisma.patient.findFirst({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    const report = await prisma.report.create({
      data: {
        patientId,
        name,
        labName,
        date: new Date(date),
        fileUrl,
        description
      }
    });

    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReportNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { doctorNotes, followUpRecommendation } = req.body;
    
    const report = await prisma.report.update({
      where: { id },
      data: {
        doctorNotes,
        followUpRecommendation
      }
    });

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
