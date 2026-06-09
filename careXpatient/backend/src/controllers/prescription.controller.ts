import { Request, Response } from 'express';
import puppeteer from 'puppeteer-core';
import * as prescriptionService from '../services/prescription.service';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prescriptionService.findAllDoctors();
    const serializedData = JSON.parse(JSON.stringify(doctors, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    res.json({ success: true, data: serializedData });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPrescriptions = async (req: Request, res: Response) => {
  try {
    const { 
      doctorName, 
      status, 
      date,
      start_date, 
      end_date, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;

    let startDateStr = start_date as string;
    let endDateStr = end_date as string;

    // Handle specific single date selection from the UI picker
    if (date && typeof date === 'string') {
      startDateStr = `${date}T00:00:00.000Z`;
      endDateStr = `${date}T23:59:59.999Z`;
    }

    const filters = {
      doctorName: doctorName as string,
      status: status as string,
      startDate: startDateStr,
      endDate: endDateStr,
      search: search as string,
    };

    const pagination = {
      page: Number(page),
      limit: Number(limit),
    };

    const result = await prescriptionService.findPrescriptions(filters, pagination);
    
    // Format the response to be more frontend-friendly
    const formattedPrescriptions = result.prescriptions.map((p: any) => ({
      id: p.id,
      prescriptionId: `RX-${String(p.id).padStart(6, '0')}`,
      title: p.title || 'General Consultation',
      summary: p.summary || 'General checkup and prescription.',
      issuedAt: p.issuedAt.toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }),
      patientName: p.consultation.appointment.patient.user.fullName,
      patientPhoto: p.consultation.appointment.patient.user.profilePhotoUrl,
      doctorName: p.consultation.appointment.doctor.user.fullName,
      doctorPhoto: p.consultation.appointment.doctor.user.profilePhotoUrl,
      doctorQualification: p.consultation.appointment.doctor.qualification,
      medicationCount: p.medicinesText ? p.medicinesText.split(/\|\||\n/).filter((l: string) => l.trim()).length : 0,
      diagnosis: p.diagnosis,
      status: p.consultation.appointment.status === 'Completed' ? 'Completed' : (p.consultation.appointment.status === 'Pending' ? 'Issued' : 'Verified')
    }));

    // Handle BigInt serialization explicitly
    const serializedData = JSON.parse(JSON.stringify(formattedPrescriptions, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({
      success: true,
      data: serializedData,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      }
    });
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPrescriptionDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prescription = await prescriptionService.findPrescriptionById(Number(id));

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Helper to calculate age
    const calculateAge = (dob: Date | null) => {
      if (!dob) return 25; // Default if not found
      const diff = Date.now() - dob.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    // Helper to parse medicines_text
    const parseMedicines = (text: string | null) => {
      if (!text) return [];
      // Support both || and newline as separators
      const lines = text.split(/\|\||\n/).filter(l => l.trim());
      return lines.map(line => {
        const parts = line.split('|').map(s => s.trim());
        if (parts.length < 4) return null;
        const [medication, dosage, frequency, duration] = parts;
        return { medication, dosage, frequency, duration };
      }).filter(m => m !== null);
    };

    const formattedDetail = {
      id: prescription.id,
      prescriptionId: `RX-${String(prescription.id).padStart(6, '0')}`,
      issuedAt: prescription.issuedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      diagnosis: prescription.diagnosis,
      adviceText: prescription.adviceText,
      medicines: parseMedicines(prescription.medicinesText),
      patient: {
        name: prescription.consultation.appointment.patient.user.fullName,
        age: calculateAge(prescription.consultation.appointment.patient.dateOfBirth),
        gender: 'Not Specified',
        bloodGroup: prescription.consultation.appointment.patient.bloodGroup || 'N/A',
        phone: prescription.consultation.appointment.patient.user.phone,
        avatarUrl: prescription.consultation.appointment.patient.user.profilePhotoUrl
      },
      doctor: {
        name: prescription.consultation.appointment.doctor.user.fullName,
        qualification: prescription.consultation.appointment.doctor.qualification,
        bmdc: prescription.consultation.appointment.doctor.bmdcNumber,
        avatarUrl: prescription.consultation.appointment.doctor.user.profilePhotoUrl
      }
    };

    // Handle BigInt serialization explicitly
    const serializedData = JSON.parse(JSON.stringify(formattedDetail, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({
      success: true,
      data: serializedData
    });
  } catch (error: any) {
    console.error('Error fetching prescription detail:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const downloadPrescriptionPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

    console.log(`Launching Puppeteer with browser path: ${executablePath}`);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.emulateMediaType('screen');

    // Navigate to the print page on the web app (port 3000)
    await page.goto(`http://localhost:3000/dashboard/patient/prescription/${id}/print`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the prescription content to be rendered
    await page.waitForSelector('.print-content', { timeout: 15000 });
    
    // Add a small delay for any animations or fonts
    await new Promise(r => setTimeout(r, 500));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${id}.pdf`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error: any) {
    console.error('Error generating prescription PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF', details: error.message });
  }
};
