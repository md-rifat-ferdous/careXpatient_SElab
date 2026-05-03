export interface ReportParameter {
  name: string;
  result: string;
  unit: string;
  range: string;
}

export interface Report {
  id: string;
  testName: string;
  labName: string;
  date: string;
  time: string;
  sampleId: string;
  patientName: string;
  age: string;
  gender: string;
  referrer: string;
  parameters: ReportParameter[];
}

export const reportsData: Report[] = [
  {
    id: "1",
    testName: "Complete Blood Count (CBC)",
    labName: "Labaid Diagnostic",
    date: "Feb 10, 2026",
    time: "09:30 AM",
    sampleId: "SID-110492-X",
    patientName: "Mr. Rahim Ali",
    age: "45 Years",
    gender: "Male",
    referrer: "Self / Walk-in",
    parameters: [
      { name: "Hemoglobin (Hb)", result: "14.2", unit: "g/dL", range: "13.0 - 17.0" },
      { name: "Red Blood Cell Count", result: "4.8", unit: "mill/cmm", range: "4.5 - 5.5" },
      { name: "White Blood Cell Count", result: "7,200", unit: "/cmm", range: "4,000 - 11,000" },
      { name: "Platelet Count", result: "245", unit: "10³/µL", range: "150 - 450" },
      { name: "Hematocrit (HCT)", result: "42.5", unit: "%", range: "40 - 50" },
      { name: "MCV", result: "88.2", unit: "fL", range: "80 - 100" }
    ]
  },
  {
    id: "2",
    testName: "Lipid Profile",
    labName: "Square Hospital Lab",
    date: "Feb 02, 2026",
    time: "10:45 AM",
    sampleId: "SID-883102-L",
    patientName: "Mr. Rahim Ali",
    age: "45 Years",
    gender: "Male",
    referrer: "Dr. Ahmed Sharif",
    parameters: [
      { name: "Total Cholesterol", result: "185", unit: "mg/dL", range: "< 200" },
      { name: "Triglycerides", result: "145", unit: "mg/dL", range: "< 150" },
      { name: "HDL Cholesterol", result: "48", unit: "mg/dL", range: "> 40" },
      { name: "LDL Cholesterol", result: "115", unit: "mg/dL", range: "< 130" },
      { name: "VLDL Cholesterol", result: "22", unit: "mg/dL", range: "2 - 30" }
    ]
  },
  {
    id: "3",
    testName: "Kidney Function Test (KFT)",
    labName: "Popular Diagnostic",
    date: "Jan 15, 2026",
    time: "08:15 AM",
    sampleId: "SID-772190-K",
    patientName: "Mr. Rahim Ali",
    age: "45 Years",
    gender: "Male",
    referrer: "Self / Walk-in",
    parameters: [
      { name: "Urea", result: "32", unit: "mg/dL", range: "15 - 45" },
      { name: "Creatinine", result: "0.9", unit: "mg/dL", range: "0.6 - 1.2" },
      { name: "Uric Acid", result: "5.4", unit: "mg/dL", range: "3.5 - 7.2" },
      { name: "Sodium", result: "140", unit: "mEq/L", range: "135 - 145" },
      { name: "Potassium", result: "4.2", unit: "mEq/L", range: "3.5 - 5.1" }
    ]
  }
];
