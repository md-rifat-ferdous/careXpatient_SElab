import { Router } from 'express';
import prisma from '../config/prisma';
import {
  getDoctorAppointments,
  getDoctorStats,
  getDoctorPatients,
  getDoctorPatientDetail,
} from '../controllers/doctor.controller';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime12h(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function parseSlotDescription(description?: string | null) {
  if (!description) return null;
  const match = description.match(/\[(\d{2}:\d{2})\|(\d{2}:\d{2})\]\s*(.+?)(?:\s*\|\s*Note:\s*(.+))?$/);
  if (!match) return null;
  return { startTime: match[1], endTime: match[2] };
}

function mergeTimeRanges(ranges: { startMinutes: number; endMinutes: number }[]) {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.startMinutes - b.startMinutes);
  const merged: typeof ranges = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i].startMinutes <= last.endMinutes) {
      last.endMinutes = Math.max(last.endMinutes, sorted[i].endMinutes);
    } else {
      merged.push(sorted[i]);
    }
  }
  return merged;
}

// ─── Doctor Listing & Discovery ───────────────────────────────────────────────

// GET /api/doctors — Fetch all doctors with optional filters
router.get('/', async (req, res) => {
  try {
    const { specialty, experience, feeMax, ratingMin, sortBy } = req.query;

    const where: any = { deletedAt: null };

    if (experience) {
      where.experienceYears = { gte: parseInt(experience as string, 10) };
    }

    if (feeMax) {
      where.fee = { lte: parseFloat(feeMax as string) };
    }

    if (ratingMin) {
      where.rating = { gte: parseFloat(ratingMin as string) };
    }

    if (specialty && specialty !== 'All' && specialty !== 'All Specialties') {
      where.specialties = {
        some: { specialty: { name: specialty as string } },
      };
    }

    let orderBy: any = {};
    if (sortBy === 'rating')      orderBy = { rating: 'desc' };
    else if (sortBy === 'fee_asc') orderBy = { fee: 'asc' };
    else if (sortBy === 'experience') orderBy = { experienceYears: 'desc' };
    else orderBy = { createdAt: 'desc' };

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: { select: { fullName: true, profilePhotoUrl: true } },
        specialties: { include: { specialty: true } },
      },
      orderBy,
    });

    const serialized = JSON.parse(JSON.stringify(doctors, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(serialized);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/doctors/specialties — Fetch all available specialties
router.get('/specialties', async (req, res) => {
  try {
    const specialties = await prisma.specialty.findMany();
    res.json(specialties);
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/doctors/profile/:id — Fetch a single doctor profile by Doctor ID
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: { select: { fullName: true, profilePhotoUrl: true } },
        specialties: { include: { specialty: true } },
        clinics: { include: { clinic: true } }
      }
    });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    const serialized = JSON.parse(JSON.stringify(doctor, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    res.json(serialized);
  } catch (error) {
    console.error('Error fetching doctor by id:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Doctor — Available Slots ─────────────────────────────────────────────────

// GET /api/doctors/:id/slots?date=YYYY-MM-DD — Fetch available time slots for a doctor on a given date
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'date query parameter is required (YYYY-MM-DD).' });
    }

    const dateStr = date as string;
    const queryDate = new Date(dateStr + 'T00:00:00');
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[queryDate.getDay()];

    const dayStart = new Date(dateStr + 'T00:00:00');
    const dayEnd = new Date(dateStr + 'T23:59:59.999');

    // ── Fetch doctor's clinic shifts ──────────────────────────────────────
    const doctorClinics = await prisma.doctorClinic.findMany({
      where: { doctorId: BigInt(id) },
      include: { clinic: true },
    });

    // ── Fetch schedule modifications for this date ────────────────────────
    const modifications = await prisma.scheduleModification.findMany({
      where: {
        doctorId: BigInt(id),
        date: { gte: dayStart, lte: dayEnd },
        status: 'Active',
      },
    });

    // ── Check holidays/leave ──────────────────────────────────────────────
    const isHolidayOrLeave = modifications.some(
      (m) => m.type === 'Holiday' || m.type === 'Leave'
    );
    if (isHolidayOrLeave) {
      return res.json({ success: true, data: [] });
    }

    // ── Collect cancelled clinic IDs ──────────────────────────────────────
    const cancelledClinicIds = new Set(
      modifications
        .filter((m) => m.type === 'Cancel Slot')
        .map((m) => m.clinicId.toString())
    );

    // ── Build time ranges from regular shifts ─────────────────────────────
    const timeRanges: { startMinutes: number; endMinutes: number }[] = [];

    for (const dc of doctorClinics) {
      if (!dc.shift) continue;
      if (cancelledClinicIds.has(dc.clinicId.toString())) continue;

      const [daysPart, timePart] = dc.shift.split('|').map((s) => s.trim());
      if (!daysPart || !timePart) continue;

      const days = daysPart.split(',').map((d) => d.trim().toUpperCase());
      if (!days.includes(dayName.toUpperCase())) continue;

      const [startStr, endStr] = timePart.split('-').map((s) => s.trim());
      if (!startStr || !endStr) continue;

      const startMinutes = parseTimeToMinutes(startStr);
      const endMinutes = parseTimeToMinutes(endStr);
      if (startMinutes >= endMinutes) continue;

      timeRanges.push({ startMinutes, endMinutes });
    }

    // ── Add custom Slot modifications ─────────────────────────────────────
    for (const mod of modifications) {
      if (mod.type !== 'Slot') continue;
      const parsed = parseSlotDescription(mod.description);
      if (!parsed) continue;
      timeRanges.push({
        startMinutes: parseTimeToMinutes(parsed.startTime),
        endMinutes: parseTimeToMinutes(parsed.endTime),
      });
    }

    // ── Add Replacement Schedule modifications ────────────────────────────
    for (const mod of modifications) {
      if (mod.type !== 'Replacement Schedule') continue;
      const parsed = parseSlotDescription(mod.description);
      if (!parsed) continue;
      timeRanges.push({
        startMinutes: parseTimeToMinutes(parsed.startTime),
        endMinutes: parseTimeToMinutes(parsed.endTime),
      });
    }

    // ── Merge overlapping ranges and generate 30-min slots ───────────────
    const mergedRanges = mergeTimeRanges(timeRanges);

    const allSlots: { time: string; timeMinutes: number }[] = [];
    for (const range of mergedRanges) {
      for (let m = range.startMinutes; m < range.endMinutes; m += 30) {
        allSlots.push({
          time: minutesToTime12h(m),
          timeMinutes: m,
        });
      }
    }

    // ── Fetch existing appointments for this date ────────────────────────
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: BigInt(id),
        date: queryDate,
        status: { notIn: ['Cancelled', 'Rejected'] },
      },
      select: { timeSlot: true },
    });

    const bookedMinutes = new Set<number>();
    for (const apt of existingAppointments) {
      const h = apt.timeSlot.getHours();
      const m = apt.timeSlot.getMinutes();
      bookedMinutes.add(h * 60 + m);
    }

    // ── Build response ────────────────────────────────────────────────────
    const result = allSlots.map((slot, i) => ({
      id: String(i),
      time: slot.time,
      available: !bookedMinutes.has(slot.timeMinutes),
    }));

    const serialized = JSON.parse(JSON.stringify(result, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Error fetching doctor slots:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ─── Doctor Portal — Appointment Management ───────────────────────────────────

// GET /api/doctors/:userId/appointments — Fetch appointments for the logged-in doctor
router.get('/:userId/appointments', getDoctorAppointments);

// GET /api/doctors/:userId/stats — Fetch appointment status counts for the dashboard
router.get('/:userId/stats', getDoctorStats);

// GET /api/doctors/:userId/patients — List distinct patients who have had appointments with this doctor
router.get('/:userId/patients', getDoctorPatients);

// GET /api/doctors/:userId/patients/:patientId — Fetch patient profile + shared appointment history
router.get('/:userId/patients/:patientId', getDoctorPatientDetail);

export default router;
