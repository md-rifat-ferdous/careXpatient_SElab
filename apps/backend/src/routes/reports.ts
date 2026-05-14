import { Router } from 'express';
import puppeteer from 'puppeteer-core';
import prisma from '../utils/prisma';

const router = Router();

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const { search, lab, date, type, page = '1', limit = '10' } = req.query;
    console.log('--- Incoming Paginated Report Request ---');
    console.log('Query Params:', { search, lab, date, type, page, limit });

    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'Reported',
    };

    // 1. Search Filter (Test Name or Report ID)
    if (search) {
      const searchStr = String(search);
      where.OR = [
        {
          tests: {
            some: {
              labTest: {
                name: {
                  contains: searchStr,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      ];

      // If search is a number, also check LabOrder ID
      if (!isNaN(Number(searchStr))) {
        where.OR.push({
          id: BigInt(searchStr),
        });
      }
    }

    // 2. Lab Filter
    if (lab && lab !== 'All Laboratories') {
      where.lab = {
        name: {
          contains: String(lab),
          mode: 'insensitive',
        },
      };
    }

    // 3. Type (Category) Filter
    if (type && type !== 'All Types') {
      const typeStr = String(type).replace(' Work', ''); // Normalize 'Blood Work' to 'Blood'
      where.tests = {
        some: {
          labTest: {
            category: {
              contains: typeStr,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    // 4. Date Filter (Last 30 Days)
    if (date === 'Last 30 Days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = {
        gte: thirtyDaysAgo,
      };
    }

    // 5. Get Total Count for Pagination
    const totalCount = await prisma.labOrder.count({ where });

    // 6. Get Paginated Data
    const labOrders = await prisma.labOrder.findMany({
      where,
      include: {
        lab: true,
        tests: {
          include: {
            labTest: true,
          },
        },
        labResults: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: skip,
      take: limitNum,
    });

    // Format the response
    const formattedReports = labOrders.map((order) => {
      const title = order.tests.length > 0 
        ? order.tests.map(t => t.labTest.name).join(', ') 
        : 'Medical Report';

      const fileUrl = order.labResults.length > 0 
        ? order.labResults[0].fileUrl 
        : null;

      return {
        id: Number(order.id),
        title: title,
        labName: order.lab.name,
        date: order.createdAt.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }),
        status: order.status,
        fileUrl: fileUrl
      };
    });

    res.json({
      data: formattedReports,
      total: totalCount,
      page: pageNum,
      limit: limitNum
    });
  } catch (error: any) {
    console.error('--- API Error: GET /api/reports ---');
    console.error('Full Error Object:', error);
    
    res.status(500).json({ 
      error: 'Failed to load reports', 
      details: error.message 
    });
  }
});

// GET /api/reports/:id/pdf — Generate PDF using Puppeteer
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.emulateMediaType('screen');

    await page.goto(`http://localhost:3000/reports/${id}`, {
      waitUntil: 'domcontentloaded', 
    });

    // Wait for the report data to load (the header will be present regardless of parameter count)
    // We add a tiny delay to ensure fonts and Tailwind styles fully paint
    await page.waitForSelector('h2.border-teal-600', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${id}.pdf`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error: any) {
    console.error('GET /api/reports/:id/pdf error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

// GET /api/reports/:id — Single report detail
router.get('/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);

    const order = await prisma.labOrder.findUnique({
      where: { id },
      include: {
        lab: true,
        tests: {
          include: { labTest: true },
        },
        labResults: true,
        patient: {
          include: { user: true },
        },
        parameters: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const formatted = {
      id: Number(order.id),
      status: order.status,
      createdAt: order.createdAt.toLocaleDateString('en-US', {
        day: '2-digit', month: 'long', year: 'numeric',
      }),
      labName: order.lab.name,
      labAddress: order.lab.address || 'Dhaka, Bangladesh',
      labPhone: order.lab.phone || 'N/A',
      patientName: order.patient.user.fullName || 'Patient',
      tests: order.tests.map(t => ({
        name: t.labTest.name,
        category: t.labTest.category,
        sampleType: t.labTest.sampleType || 'N/A',
        description: t.labTest.description || '',
        prerequisites: t.labTest.prerequisites || '',
        deliveryTime: t.labTest.deliveryTime || 'N/A',
        price: t.labTest.price ? Number(t.labTest.price) : null,
      })),
      results: order.labResults.map(r => ({
        summary: r.resultSummary || 'Results available',
        fileUrl: r.fileUrl || null,
        uploadedBy: r.uploadedBy || 'Lab Staff',
      })),
      parameters: order.parameters.map(p => ({
        parameter_name: p.parameterName,
        value: p.value,
        unit: p.unit || '-',
        reference_range: p.referenceRange || '-',
      })),
      fileUrl: order.labResults.length > 0 ? order.labResults[0].fileUrl : null,
    };

    res.json(formatted);
  } catch (error: any) {
    console.error('GET /api/reports/:id error:', error);
    res.status(500).json({ error: 'Failed to load report', details: error.message });
  }
});

export default router;
