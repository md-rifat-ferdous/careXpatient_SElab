import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { resolveLabId } from '../routes/lab/labHelper';

export class LabTestController {
  static async getLabTests(req: Request, res: Response) {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const labId = await resolveLabId(req.query);

      const where: any = {};
      if (category && category !== 'All') {
        where.category = category;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (labId) {
        where.labId = BigInt(labId);
      }

      const labTests = await prisma.labTest.findMany({
        where,
        include: {
          lab: true,
        },
      });

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

  static async createLabTest(req: Request, res: Response) {
    try {
      const { name, price, sampleType, category, deliveryTime, description, prerequisites, tag, tagColor, labId } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });

      const test = await prisma.labTest.create({
        data: {
          name,
          price: price ? Number(price) : undefined,
          sampleType,
          category: category || 'All',
          deliveryTime,
          description,
          prerequisites,
          tag,
          tagColor,
          labId: labId ? BigInt(labId) : undefined,
        },
      });

      res.status(201).json({
        id: test.id.toString(),
        name: test.name,
        price: test.price ? Number(test.price) : 0,
        sampleType: test.sampleType,
        category: test.category,
        deliveryTime: test.deliveryTime,
        description: test.description,
        prerequisites: test.prerequisites,
        tag: test.tag,
        tagColor: test.tagColor,
        labId: test.labId ? test.labId.toString() : null,
      });
    } catch (error) {
      console.error('Error creating lab test:', error);
      res.status(500).json({ error: 'Failed to create lab test' });
    }
  }

  static async updateLabTest(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);
      const { name, price, sampleType, category, deliveryTime, description, prerequisites, tag, tagColor } = req.body;

      const test = await prisma.labTest.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(price !== undefined && { price: Number(price) }),
          ...(sampleType !== undefined && { sampleType }),
          ...(category !== undefined && { category }),
          ...(deliveryTime !== undefined && { deliveryTime }),
          ...(description !== undefined && { description }),
          ...(prerequisites !== undefined && { prerequisites }),
          ...(tag !== undefined && { tag }),
          ...(tagColor !== undefined && { tagColor }),
        },
      });

      res.json({
        id: test.id.toString(),
        name: test.name,
        price: test.price ? Number(test.price) : 0,
        sampleType: test.sampleType,
        category: test.category,
        deliveryTime: test.deliveryTime,
        description: test.description,
        prerequisites: test.prerequisites,
        tag: test.tag,
        tagColor: test.tagColor,
        labId: test.labId ? test.labId.toString() : null,
      });
    } catch (error) {
      console.error('Error updating lab test:', error);
      res.status(500).json({ error: 'Failed to update lab test' });
    }
  }

  static async deleteLabTest(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);
      await prisma.labTest.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting lab test:', error);
      res.status(500).json({ error: 'Failed to delete lab test' });
    }
  }
}
