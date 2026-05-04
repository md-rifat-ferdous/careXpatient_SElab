import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM reports ORDER BY report_date DESC');
    
    // Map database fields to frontend fields if necessary
    const reports = result.rows.map(row => ({
      id: row.id.toString(),
      patientName: row.patient_name,
      testName: row.test_name,
      labName: row.lab_name,
      date: new Date(row.report_date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }),
      sampleId: row.sample_id,
      age: row.age,
      gender: row.gender,
      referrer: row.referrer,
      time: row.time
    }));

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
