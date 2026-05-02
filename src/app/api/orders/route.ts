import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name, phone, email, address,
      items, homeCollection, paymentMethod,
      discount = 0 // Total discount from coupon
    } = body;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (homeCollection && !address) {
      return NextResponse.json({ error: 'Address is required for home collection' }, { status: 400 });
    }

    // Phone validation
    if (!/^01[0-9]{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid 11-digit phone number' }, { status: 400 });
    }

    // Find or create guest user
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          fullName: name,
          password: 'guest-hashed-password',
          role: 'Patient',
        }
      });
    }

    // GROUP ITEMS BY LAB
    const labGroups: Record<string, typeof items> = {};
    items.forEach((item: any) => {
      const groupKey = item.labName || 'General';
      if (!labGroups[groupKey]) labGroups[groupKey] = [];
      labGroups[groupKey].push(item);
    });

    const createdOrderIds: string[] = [];
    const labNames = Object.keys(labGroups);
    const totalSubtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);

    // Create separate orders for each lab
    for (let i = 0; i < labNames.length; i++) {
      const labName = labNames[i];
      const groupItems = labGroups[labName];
      
      const subtotal = groupItems.reduce((sum: number, item: any) => sum + item.price, 0);
      
      // Proportional discount for this lab
      const labDiscount = totalSubtotal > 0 ? (subtotal / totalSubtotal) * discount : 0;
      const discountedSubtotal = subtotal - labDiscount;
      
      const vat = Math.round(discountedSubtotal * 0.05);
      
      // PER-LAB HOME COLLECTION FEE (৳150 per lab as per new spec)
      const orderHomeCollectionFee = homeCollection ? 150 : 0;
      
      const totalAmount = discountedSubtotal + vat + orderHomeCollectionFee;

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: 'Pending',
          subtotal,
          vat,
          homeCollectionFee: orderHomeCollectionFee,
          totalAmount,
          homeCollection,
          collectionAddress: address,
          items: {
            create: groupItems.map((item: any) => ({
              labTestId: item.testId,
              price: item.price,
            }))
          }
        }
      });
      createdOrderIds.push(order.id);
    }

    return NextResponse.json({
      success: true,
      orderIds: createdOrderIds,
      orderId: createdOrderIds[0],
      message: labNames.length > 1 
        ? `Successfully placed ${labNames.length} separate orders.` 
        : 'Order placed successfully',
      patientName: name,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to place order.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone');

    if (!userId && !phone) {
      return NextResponse.json({ error: 'User ID or Phone is required' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: userId ? { userId } : { user: { phone } },
      include: {
        items: {
          include: {
            labTest: {
              include: {
                lab: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
