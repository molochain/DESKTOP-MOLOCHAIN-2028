import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db';
import { serviceBookings, insertServiceBookingSchema, ServiceBooking } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { isAuthenticated } from '../core/auth/auth.service';
import { logger } from '../utils/logger';

const router = Router();

function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `BK-${timestamp}-${random}`;
}

const createBookingSchema = insertServiceBookingSchema.omit({
  bookingNumber: true,
  bookingDate: true,
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
});

router.post('/', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const validation = createBookingSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const bookingData = {
      ...validation.data,
      bookingNumber: generateBookingNumber(),
      bookingDate: new Date(),
      userId: req.user?.id || null,
    };

    const [newBooking] = await db
      .insert(serviceBookings)
      .values(bookingData)
      .returning();

    logger.info(`New booking created: ${newBooking.bookingNumber}`);
    res.status(201).json(newBooking);
  } catch (error) {
    logger.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookings = await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.userId, userId))
      .orderBy(desc(serviceBookings.createdAt));

    res.json(bookings);
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id, 10);

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const [booking] = await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    logger.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

router.patch('/:id/status', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const userId = req.user?.id;

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const [existingBooking] = await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.id, bookingId))
      .limit(1);

    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (existingBooking.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own bookings' });
    }

    const [updatedBooking] = await db
      .update(serviceBookings)
      .set({ 
        status: validation.data.status,
        updatedAt: new Date(),
      })
      .where(eq(serviceBookings.id, bookingId))
      .returning();

    logger.info(`Booking ${existingBooking.bookingNumber} status updated to ${validation.data.status}`);
    res.json(updatedBooking);
  } catch (error) {
    logger.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
