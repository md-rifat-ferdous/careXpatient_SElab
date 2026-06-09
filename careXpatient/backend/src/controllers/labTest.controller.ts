import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class LabTestController {
  static async getLabTests(req: Request, res: Response) {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const where: any = {};
      if (category && category !== 'All') {
        where.category = category;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const labTests = await prisma.labTest.findMany({
        where,
        include: {
          lab: true,
        },
      });

      // The frontend expects numeric IDs or strings, since Prisma is BigInt, we must map them.
      // BigInt must be converted to string or Number.
      const formattedTests = labTests.map((test: any) => ({
        id: test.id.toString(),
        name: test.name,
        tag: test.tag || '',
        tagColor: test.tagColor || '',
        description: test.description || '',
        prerequisites: test.prerequisites || '',
        deliveryTime: test.deliveryTime || '',
        sampleType: test.sampleType || '',
        labName: test.lab?.name || 'General',
        price: test.price ? Number(test.price) : 0,
        category: test.category || 'All',
        labId: test.labId ? test.labId.toString() : null,
      }));

      res.status(200).json(formattedTests);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      res.status(500).json({ error: 'Failed to fetch lab tests' });
    }
  }
}
