import { Router } from 'express';
import { db } from '../../core/database/db.service';
import { trackingProviders } from '@db/schema';
import { eq, desc } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../../core/auth/auth.service';
import { logger } from '../../utils/logger';

const router = Router();

// Get all tracking providers
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const providers = await db.select().from(trackingProviders).orderBy(desc(trackingProviders.createdAt));
    res.json(providers);
  } catch (error) {
    logger.error('Error fetching tracking providers:', error);
    res.status(500).json({ error: 'Failed to fetch tracking providers' });
  }
});

// Add new tracking provider
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, type, apiKey, apiSecret, accountNumber, meterNumber, isEnabled } = req.body;
    
    // Validate required fields
    if (!name || !type || !apiKey) {
      return res.status(400).json({ error: 'Name, type, and API key are required' });
    }
    
    const [provider] = await db.insert(trackingProviders).values({
      name,
      type,
      apiKey,
      apiSecret,
      accountNumber,
      meterNumber,
      isEnabled: isEnabled ?? true,
    }).returning();
    
    res.status(201).json(provider);
  } catch (error) {
    logger.error('Error creating tracking provider:', error);
    res.status(500).json({ error: 'Failed to create tracking provider' });
  }
});

// Update tracking provider
router.patch('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const { isEnabled } = req.body;
    
    const [updated] = await db
      .update(trackingProviders)
      .set({ 
        isEnabled,
        updatedAt: new Date() 
      })
      .where(eq(trackingProviders.id, providerId))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json(updated);
  } catch (error) {
    logger.error('Error updating tracking provider:', error);
    res.status(500).json({ error: 'Failed to update tracking provider' });
  }
});

// Delete tracking provider
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    
    await db.delete(trackingProviders).where(eq(trackingProviders.id, providerId));
    
    res.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    logger.error('Error deleting tracking provider:', error);
    res.status(500).json({ error: 'Failed to delete tracking provider' });
  }
});

export default router;