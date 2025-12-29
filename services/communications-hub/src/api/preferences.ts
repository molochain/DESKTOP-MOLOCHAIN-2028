import { Router, Request, Response } from 'express';
import { createLogger } from '../utils/logger.js';
import { 
  getUserPreferences, 
  getUserChannelPreference, 
  upsertUserPreference 
} from '../db/operations.js';

const router = Router();
const logger = createLogger('preferences-api');

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const preferences = await getUserPreferences(userId);
    
    const channelPrefs: Record<string, { enabled: boolean; address?: string | null }> = {
      email: { enabled: true },
      sms: { enabled: true },
      whatsapp: { enabled: true },
      push: { enabled: true },
    };
    
    for (const pref of preferences) {
      channelPrefs[pref.channelType] = {
        enabled: pref.enabled,
        address: pref.address,
      };
    }
    
    res.json({ 
      userId,
      preferences: channelPrefs,
      raw: preferences,
    });
  } catch (error) {
    logger.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

router.get('/:userId/:channel', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const channel = req.params.channel;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const validChannels = ['email', 'sms', 'whatsapp', 'push'];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ 
        error: 'Invalid channel', 
        validChannels 
      });
    }
    
    const preference = await getUserChannelPreference(userId, channel);
    
    res.json({
      userId,
      channel,
      enabled: preference?.enabled ?? true,
      address: preference?.address ?? null,
      preferences: preference?.preferences ?? null,
    });
  } catch (error) {
    logger.error('Error fetching channel preference:', error);
    res.status(500).json({ error: 'Failed to fetch preference' });
  }
});

router.put('/:userId/:channel', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const channel = req.params.channel;
    const { enabled, address, preferences } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const validChannels = ['email', 'sms', 'whatsapp', 'push'];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ 
        error: 'Invalid channel', 
        validChannels 
      });
    }
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }
    
    const updated = await upsertUserPreference(
      userId,
      channel,
      enabled,
      address,
      preferences
    );
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update preference' });
    }
    
    logger.info(`User ${userId} updated ${channel} preference: enabled=${enabled}`);
    
    res.json({
      success: true,
      preference: updated,
    });
  } catch (error) {
    logger.error('Error updating preference:', error);
    res.status(500).json({ error: 'Failed to update preference' });
  }
});

router.put('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { preferences } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ 
        error: 'preferences object required',
        example: { email: true, sms: false, push: true }
      });
    }
    
    const results: Record<string, boolean> = {};
    const validChannels = ['email', 'sms', 'whatsapp', 'push'];
    
    for (const [channel, enabled] of Object.entries(preferences)) {
      if (validChannels.includes(channel) && typeof enabled === 'boolean') {
        const updated = await upsertUserPreference(userId, channel, enabled);
        results[channel] = !!updated;
      }
    }
    
    logger.info(`User ${userId} bulk updated preferences`);
    
    res.json({
      success: true,
      userId,
      updated: results,
    });
  } catch (error) {
    logger.error('Error bulk updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

router.post('/:userId/unsubscribe/:channel', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const channel = req.params.channel;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const validChannels = ['email', 'sms', 'whatsapp', 'push', 'all'];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ error: 'Invalid channel' });
    }
    
    if (channel === 'all') {
      for (const ch of ['email', 'sms', 'whatsapp', 'push']) {
        await upsertUserPreference(userId, ch, false);
      }
      logger.info(`User ${userId} unsubscribed from all channels`);
    } else {
      await upsertUserPreference(userId, channel, false);
      logger.info(`User ${userId} unsubscribed from ${channel}`);
    }
    
    res.json({
      success: true,
      message: channel === 'all' 
        ? 'Unsubscribed from all notification channels' 
        : `Unsubscribed from ${channel} notifications`,
    });
  } catch (error) {
    logger.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

export default router;
