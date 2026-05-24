"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Mock logged-in user email
const DOCTOR_EMAIL = "doctor@carexpatient.com";
function getOrCreateDoctor() {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield prisma.user.findUnique({
            where: { email: DOCTOR_EMAIL }
        });
        if (!user) {
            user = yield prisma.user.create({
                data: {
                    email: DOCTOR_EMAIL,
                    name: "Dr. Sarah Jenkins",
                    role: "DOCTOR"
                }
            });
        }
        return user;
    });
}
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Get clinics
app.get('/api/schedule/clinics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getOrCreateDoctor();
        const doctorClinics = yield prisma.doctorClinic.findMany({
            where: { userId: user.id },
            include: {
                clinic: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ success: true, data: doctorClinics });
    }
    catch (error) {
        console.error("Error fetching clinics:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}));
// Get recent modifications
app.get('/api/schedule/modifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getOrCreateDoctor();
        const doctorClinics = yield prisma.doctorClinic.findMany({
            where: { userId: user.id },
            select: { clinicId: true }
        });
        const clinicIds = doctorClinics.map(dc => dc.clinicId);
        const modifications = yield prisma.scheduleModification.findMany({
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
    }
    catch (error) {
        console.error("Error fetching modifications:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}));
app.post('/api/schedule/clinics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getOrCreateDoctor();
        const { name, address, shift } = req.body;
        const clinic = yield prisma.clinic.create({
            data: {
                name,
                address,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMv_TYSrT_3KeSZg3p4zjLr_-N3VuAHM_P7u0cwzTi9tou4pVL2vZoyJm7GN2F439-5pG6aXAJqxV5GrJBKhnobb1IlFJe8vtNM57MEVVn_o76WHPU-IB3PvxUPx1kA2-dHXtvssMjQ0Is3uF1pa5ltC7X9ivYhDBaBIMQjQ7UYNIwQBpC3gE5dGZaVnMhNsEpMVN7UQTOjVK91lHv_9_apw6FZdmjqSv0I0z9ruJzumTS39aRFwMooTXDpKvCQtr1qEQAcazWQVRk"
            }
        });
        const doctorClinic = yield prisma.doctorClinic.create({
            data: {
                userId: user.id,
                clinicId: clinic.id,
                shift: shift,
                status: "Pending"
            }
        });
        res.json({ success: true, data: doctorClinic });
    }
    catch (error) {
        console.error("Error registering clinic:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}));
app.post('/api/schedule/modifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clinicId, type, description } = req.body;
        const modification = yield prisma.scheduleModification.create({
            data: {
                clinicId,
                type,
                description,
                date: new Date(),
                status: "Pending"
            }
        });
        res.json({ success: true, data: modification });
    }
    catch (error) {
        console.error("Error adding modification:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}));
app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
});
