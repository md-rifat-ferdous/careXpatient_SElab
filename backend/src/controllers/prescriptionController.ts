import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getPrescriptionsByPatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    // Verify patient exists
    const patient = await prisma.patient.findFirst({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const addPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const doctorId = req.doctor?.id;
    const { medications, date, notes } = req.body;

    if (!doctorId) {
      res.status(401).json({ message: 'Unauthorized: Doctor record missing' });
      return;
    }

    // 2. Verify patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    // 3. Serialize medications (ensuring name, dosage, duration are preserved)
    console.log('[PrescriptionCreate] Attempting to create:', { patientId, doctorId, medicationsCount: medications?.length });

    const medicationsValue = typeof medications === 'string' ? medications : JSON.stringify(medications);

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        doctorId: doctorId as string,
        medications: medicationsValue,
        date: new Date(date || new Date()),
        notes: notes || ''
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    });

    console.log('[PrescriptionCreate] Success:', prescription.id);
    res.status(201).json(prescription);
  } catch (error: any) {
    console.error('[PrescriptionCreate] Error:', error);
    if (error.code === 'P2003') {
      res.status(400).json({ 
        message: 'Database relationship error: One or more IDs (Patient or Doctor) are invalid.',
        details: error.meta
      });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const updatePrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { medications, notes } = req.body;
    const doctorId = req.doctor?.id;
    
    // Ownership check
    const existing = await prisma.prescription.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Prescription not found' });
      return;
    }
    if (existing.doctorId !== doctorId) {
      res.status(403).json({ message: 'Unauthorized: You can only edit your own prescriptions' });
      return;
    }

    const medicationsValue = typeof medications === 'string' ? medications : JSON.stringify(medications);

    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        ...(medications && { medications: medicationsValue }),
        ...(notes && { notes })
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    });

    res.json(prescription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const archivePrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor?.id;

    // Ownership check
    const existing = await prisma.prescription.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Prescription not found' });
      return;
    }
    if (existing.doctorId !== doctorId) {
      res.status(403).json({ message: 'Unauthorized: You can only archive your own prescriptions' });
      return;
    }
    
    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        status: 'archived',
        archivedAt: new Date()
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    });

    res.json(prescription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
