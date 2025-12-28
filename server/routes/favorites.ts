import { Router, Request, Response } from 'express';
import { db } from '../db';
import { userFavoriteServices, insertUserFavoriteServiceSchema, services, UserFavoriteService } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../core/auth/auth.service';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const favorites = await db
      .select({
        favorite: userFavoriteServices,
        service: services,
      })
      .from(userFavoriteServices)
      .leftJoin(services, eq(userFavoriteServices.serviceId, services.id))
      .where(eq(userFavoriteServices.userId, userId));

    res.json(favorites);
  } catch (error) {
    logger.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

router.post('/', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = insertUserFavoriteServiceSchema.safeParse({
      ...req.body,
      userId,
    });

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { serviceId } = validation.data;

    const [existingFavorite] = await db
      .select()
      .from(userFavoriteServices)
      .where(
        and(
          eq(userFavoriteServices.userId, userId),
          eq(userFavoriteServices.serviceId, serviceId)
        )
      )
      .limit(1);

    if (existingFavorite) {
      return res.status(409).json({ error: 'Service is already in favorites' });
    }

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const [newFavorite] = await db
      .insert(userFavoriteServices)
      .values(validation.data)
      .returning();

    logger.info(`User ${userId} added service ${serviceId} to favorites`);
    res.status(201).json({ favorite: newFavorite, service });
  } catch (error) {
    logger.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/:serviceId', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    const { serviceId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID is required' });
    }

    const [existingFavorite] = await db
      .select()
      .from(userFavoriteServices)
      .where(
        and(
          eq(userFavoriteServices.userId, userId),
          eq(userFavoriteServices.serviceId, serviceId)
        )
      )
      .limit(1);

    if (!existingFavorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await db
      .delete(userFavoriteServices)
      .where(
        and(
          eq(userFavoriteServices.userId, userId),
          eq(userFavoriteServices.serviceId, serviceId)
        )
      );

    logger.info(`User ${userId} removed service ${serviceId} from favorites`);
    res.status(200).json({ message: 'Favorite removed successfully' });
  } catch (error) {
    logger.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

router.get('/check/:serviceId', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    const { serviceId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID is required' });
    }

    const [favorite] = await db
      .select()
      .from(userFavoriteServices)
      .where(
        and(
          eq(userFavoriteServices.userId, userId),
          eq(userFavoriteServices.serviceId, serviceId)
        )
      )
      .limit(1);

    res.json({ isFavorited: !!favorite, favorite: favorite || null });
  } catch (error) {
    logger.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

export default router;
