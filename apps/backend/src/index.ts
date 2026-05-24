import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Mock logged-in user email
const DOCTOR_EMAIL = "doctor@carexpatient.com";

async function getOrCreateDoctor() {
  let user = await prisma.user.findUnique({
    where: { email: DOCTOR_EMAIL }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DOCTOR_EMAIL,
        name: "Dr. Sarah Jenkins",
        role: "DOCTOR"
      }
    });
  }

  return user;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get clinics
app.get('/api/schedule/clinics', async (req, res) => {
  try {
    const user = await getOrCreateDoctor();
    
    const doctorClinics = await prisma.doctorClinic.findMany({
      where: { userId: user.id },
      include: {
        clinic: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, data: doctorClinics });
  } catch (error: any) {
    console.error("Error fetching clinics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent modifications
app.get('/api/schedule/modifications', async (req, res) => {
  try {
    const user = await getOrCreateDoctor();
    
    const doctorClinics = await prisma.doctorClinic.findMany({
      where: { userId: user.id },
      select: { clinicId: true }
    });
    
    const clinicIds = doctorClinics.map(dc => dc.clinicId);

    const modifications = await prisma.scheduleModification.findMany({
      where: { clinicId: { in: clinicIds } },
      include: {
        clinic: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    });

    res.json({ success: true, data: modifications });
  } catch (error: any) {
    console.error("Error fetching modifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/schedule/clinics', async (req, res) => {
  try {
    const user = await getOrCreateDoctor();
    const { name, address, shift } = req.body;
    
    const clinic = await prisma.clinic.create({
      data: {
        name,
        address,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMv_TYSrT_3KeSZg3p4zjLr_-N3VuAHM_P7u0cwzTi9tou4pVL2vZoyJm7GN2F439-5pG6aXAJqxV5GrJBKhnobb1IlFJe8vtNM57MEVVn_o76WHPU-IB3PvxUPx1kA2-dHXtvssMjQ0Is3uF1pa5ltC7X9ivYhDBaBIMQjQ7UYNIwQBpC3gE5dGZaVnMhNsEpMVN7UQTOjVK91lHv_9_apw6FZdmjqSv0I0z9ruJzumTS39aRFwMooTXDpKvCQtr1qEQAcazWQVRk"
      }
    });

    const doctorClinic = await prisma.doctorClinic.create({
      data: {
        userId: user.id,
        clinicId: clinic.id,
        shift: shift,
        status: "Pending"
      }
    });

    res.json({ success: true, data: doctorClinic });
  } catch (error: any) {
    console.error("Error registering clinic:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/schedule/modifications', async (req, res) => {
  try {
    const { clinicId, type, description } = req.body;
    
    const modification = await prisma.scheduleModification.create({
      data: {
        clinicId,
        type,
        description,
        date: new Date(),
        status: "Pending"
      }
    });

    res.json({ success: true, data: modification });
  } catch (error: any) {
    console.error("Error adding modification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
