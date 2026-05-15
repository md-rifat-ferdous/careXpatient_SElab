-- Drop tables if they exist
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS appointment_requests CASCADE;

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    appointment_time VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'confirmed', -- 'completed', 'confirmed', 'cancelled'
    is_online BOOLEAN DEFAULT false,
    duration VARCHAR(50),
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointment Requests table
CREATE TABLE appointment_requests (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    request_date VARCHAR(50) NOT NULL,
    request_time VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO appointments (patient_name, type, appointment_time, status, is_online, duration)
VALUES 
('J. Smith', 'Checkup', '09:00 AM', 'completed', false, '30 min'),
('Marcus Johnson', 'Video Consultation', '11:30 AM', 'confirmed', true, '45 min');

INSERT INTO appointments (patient_name, type, appointment_time, status, is_online, duration, room)
VALUES 
('Sarah Williams', 'In person', '02:00 PM', 'confirmed', false, '60 min', 'Room 302');

INSERT INTO appointment_requests (patient_name, type, request_date, request_time)
VALUES 
('Michael Chang', 'Post-op checkup', 'Today', '10:30 AM'),
('Emily Roberts', 'Routine checkup', 'Tomorrow', '11:15 AM');
