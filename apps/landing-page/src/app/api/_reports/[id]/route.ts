import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch report details
    const reportResult = await query('SELECT * FROM reports WHERE id = $1', [id]);
    
    if (reportResult.rowCount === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const reportRow = reportResult.rows[0];

    // Fetch report parameters
    const paramResult = await query('SELECT * FROM report_parameters WHERE report_id = $1', [id]);
    
    const report = {
      id: reportRow.id.toString(),
      patientName: reportRow.patient_name,
      testName: reportRow.test_name,
      labName: reportRow.lab_name,
      date: new Date(reportRow.report_date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }),
      sampleId: reportRow.sample_id,
      age: reportRow.age,
      gender: reportRow.gender,
      referrer: reportRow.referrer,
      time: reportRow.time,
      parameters: paramResult.rows.map(p => ({
        name: p.name,
        result: p.result,
        unit: p.unit,
        range: p.range
      }))
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
