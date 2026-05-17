import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class LabOrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const {
        name, phone, email, address,
        items, homeCollection, paymentMethod,
        discount = 0 // Total discount from coupon
      } = req.body;

      // Validate required fields
      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }
      if (homeCollection && !address) {
        return res.status(400).json({ error: 'Address is required for home collection' });
      }

      // Phone validation
      if (!/^01[0-9]{9}$/.test(phone)) {
        return res.status(400).json({ error: 'Invalid 11-digit phone number' });
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

      // Ensure Patient record exists
      let patient = await prisma.patient.findUnique({ where: { userId: user.id } });
      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            userId: user.id,
            address: address,
          }
        });
      }

      // GROUP ITEMS BY LAB
      const labGroups: Record<string, typeof items> = {};
      items.forEach((item: any) => {
        const groupKey = item.labId ? item.labId.toString() : 'General';
        if (!labGroups[groupKey]) labGroups[groupKey] = [];
        labGroups[groupKey].push(item);
      });

      const createdOrderIds: string[] = [];
      const labIds = Object.keys(labGroups);
      const totalSubtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);

      // We need a dummy Lab ID for 'General' if tests don't have a specific lab.
      // For now, if labId is 'General', we fetch a default Lab or create one.
      let defaultLab = await prisma.lab.findFirst();
      if (!defaultLab) {
         const labUser = await prisma.user.create({
           data: { phone: '01000000000', fullName: 'Default Lab', role: 'Lab', password: 'password' }
         });
         defaultLab = await prisma.lab.create({
           data: { name: 'General Lab', userId: labUser.id }
         });
      }

      for (let i = 0; i < labIds.length; i++) {
        const labIdStr = labIds[i];
        const groupItems = labGroups[labIdStr];
        
        const subtotal = groupItems.reduce((sum: number, item: any) => sum + item.price, 0);
        
        // Proportional discount for this lab
        const labDiscount = totalSubtotal > 0 ? (subtotal / totalSubtotal) * discount : 0;
        const discountedSubtotal = subtotal - labDiscount;
        
        const vat = Math.round(discountedSubtotal * 0.05);
        
        const orderHomeCollectionFee = homeCollection ? 150 : 0;
        const totalAmount = discountedSubtotal + vat + orderHomeCollectionFee;

        // resolve labId
        let resolvedLabId = defaultLab.id;
        if (labIdStr !== 'General') {
           resolvedLabId = BigInt(labIdStr);
        }

        const order = await prisma.labOrder.create({
          data: {
            patientId: patient.id,
            labId: resolvedLabId,
            status: 'Requested',
            subtotal,
            vat,
            homeCollectionFee: orderHomeCollectionFee,
            totalAmount,
            homeCollection,
            collectionAddress: address,
            tests: {
              create: groupItems.map((item: any) => ({
                labTestId: BigInt(item.testId),
              }))
            }
          }
        });
        createdOrderIds.push(order.id.toString());
      }

      return res.status(201).json({
        success: true,
        orderIds: createdOrderIds,
        orderId: createdOrderIds[0],
        message: labIds.length > 1 
          ? `Successfully placed ${labIds.length} separate orders.` 
          : 'Order placed successfully',
        patientName: name,
      });

    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ error: 'Failed to place order.' });
    }
  }

  static async getOrders(req: Request, res: Response) {
    try {
      const userIdStr = req.query.userId as string;
      const phone = req.query.phone as string;

      if (!userIdStr && !phone) {
        return res.status(400).json({ error: 'User ID or Phone is required' });
      }

      const whereClause: any = {};
      if (userIdStr) {
        whereClause.patient = { userId: BigInt(userIdStr) };
      } else {
        whereClause.patient = { user: { phone } };
      }

      const orders = await prisma.labOrder.findMany({
        where: whereClause,
        include: {
          tests: {
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

      // format the orders
      const formattedOrders = orders.map((order: any) => ({
        id: order.id.toString(),
        userId: order.patient.userId.toString(),
        status: order.status,
        subtotal: order.subtotal ? Number(order.subtotal) : 0,
        vat: order.vat ? Number(order.vat) : 0,
        homeCollectionFee: order.homeCollectionFee ? Number(order.homeCollectionFee) : 0,
        totalAmount: order.totalAmount ? Number(order.totalAmount) : 0,
        homeCollection: order.homeCollection,
        collectionAddress: order.collectionAddress,
        createdAt: order.createdAt,
        items: order.tests.map((ot: any) => ({
           id: `${ot.labOrderId}-${ot.labTestId}`,
           orderId: ot.labOrderId.toString(),
           labTestId: ot.labTestId.toString(),
           price: ot.labTest.price ? Number(ot.labTest.price) : 0,
           labTest: {
             id: ot.labTest.id.toString(),
             name: ot.labTest.name,
             lab: {
               id: ot.labTest.lab?.id.toString() || '',
               name: ot.labTest.lab?.name || 'General Lab',
             }
           }
        }))
      }));

      return res.status(200).json(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
}
