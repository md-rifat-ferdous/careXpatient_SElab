import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const labTests = await prisma.labTest.findMany({
      where,
      include: {
        lab: true,
      },
    });

    const formattedTests = labTests.map(test => ({
      id: test.id,
      name: test.name,
      tag: test.tag,
      tagColor: test.tagColor,
      description: test.description,
      prerequisites: test.prerequisites,
      deliveryTime: test.deliveryTime,
      sampleType: test.sampleType,
      labName: test.lab.name,
      price: test.price,
      category: test.category,
    }));

    return NextResponse.json(formattedTests);
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    return NextResponse.json({ error: 'Failed to fetch lab tests' }, { status: 500 });
  }
}
