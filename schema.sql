-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    patient_name TEXT NOT NULL,
    test_name TEXT NOT NULL,
    lab_name TEXT NOT NULL,
    report_date DATE NOT NULL,
    sample_id TEXT NOT NULL,
    age TEXT,
    gender TEXT,
    referrer TEXT,
    time TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create report_parameters table (for dynamic parameters)
CREATE TABLE IF NOT EXISTS report_parameters (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    result TEXT NOT NULL,
    unit TEXT NOT NULL,
    range TEXT NOT NULL
);

-- Insert sample data
INSERT INTO reports (patient_name, test_name, lab_name, report_date, sample_id, age, gender, referrer, time)
VALUES 
('Mr. Rahim Ali', 'Kidney Function Test (KFT)', 'Labaid Diagnostic', '2026-02-10', 'LA-110492', '45', 'Male', 'Dr. Ariful Islam', '10:30 AM'),
('Mr. Rahim Ali', 'Lipid Profile', 'Square Hospital Lab', '2026-02-02', 'SQ-883102', '45', 'Male', 'Dr. Ariful Islam', '09:15 AM');

-- Insert parameters for report 1 (KFT)
INSERT INTO report_parameters (report_id, name, result, unit, range)
VALUES 
(1, 'S. Creatinine', '1.1', 'mg/dL', '0.6 - 1.2'),
(1, 'BUN', '14', 'mg/dL', '7 - 20'),
(1, 'Uric Acid', '5.8', 'mg/dL', '3.5 - 7.2');

-- Insert parameters for report 2 (Lipid)
INSERT INTO report_parameters (report_id, name, result, unit, range)
VALUES 
(2, 'Total Cholesterol', '185', 'mg/dL', '< 200'),
(2, 'HDL Cholesterol', '42', 'mg/dL', '> 40'),
(2, 'LDL Cholesterol', '110', 'mg/dL', '< 130');
