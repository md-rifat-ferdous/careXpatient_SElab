import { Router } from 'express';
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

export default router;
