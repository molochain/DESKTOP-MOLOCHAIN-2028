import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { contentAssets } from '@db/schema';
import { eq } from 'drizzle-orm';
import { Client } from '@replit/object-storage';
import { isAuthenticated } from '../core/auth/auth.service';

const router = Router();
const storage = new Client();

// Get branding assets (logo, favicon)
router.get('/assets', isAuthenticated, async (req, res) => {
  try {
    const assets = await db.query.contentAssets.findMany({
      where: eq(contentAssets.active, true),
    });

    const brandingAssets = {
      logo: assets.find(asset => asset.type === 'logo') || null,
      banner: assets.find(asset => asset.type === 'favicon') || null,
    };

    res.json(brandingAssets);
  } catch (error) {
    // Error fetching branding assets - handled by error response
    res.status(500).json({ message: 'Failed to fetch branding assets' });
  }
});

// Get the current theme
router.get('/theme', isAuthenticated, async (req, res) => {
  try {
    const themeFilePath = path.resolve(process.cwd(), 'theme.json');
    
    if (!fs.existsSync(themeFilePath)) {
      return res.status(404).json({ message: 'Theme file not found' });
    }
    
    const themeContent = fs.readFileSync(themeFilePath, 'utf-8');
    const theme = JSON.parse(themeContent);
    
    res.json(theme);
  } catch (error) {
    // Error reading theme file - handled by error response
    res.status(500).json({ message: 'Failed to read theme file' });
  }
});

// Update the theme
router.put('/theme', isAuthenticated, async (req, res) => {
  try {
    const { variant, primary, appearance, radius } = req.body;
    
    if (!variant || !primary || !appearance || radius === undefined) {
      return res.status(400).json({ message: 'Missing required theme properties' });
    }
    
    const themeData = {
      variant,
      primary,
      appearance,
      radius: parseFloat(radius),
    };
    
    const themeFilePath = path.resolve(process.cwd(), 'theme.json');
    fs.writeFileSync(themeFilePath, JSON.stringify(themeData, null, 2));
    
    res.json(themeData);
  } catch (error) {
    // Error updating theme - handled by error response
    res.status(500).json({ message: 'Failed to update theme' });
  }
});

// Set a specific asset as active (e.g., logo or favicon)
router.post('/asset/:type/set', async (req, res) => {
  try {
    const { type } = req.params;
    const { assetId } = req.body;
    
    if (!assetId) {
      return res.status(400).json({ message: 'Asset ID is required' });
    }
    
    // First, deactivate all assets of this type
    await db
      .update(contentAssets)
      .set({ active: false })
      .where(eq(contentAssets.type, type));
    
    // Then activate the requested asset
    await db
      .update(contentAssets)
      .set({ active: true })
      .where(eq(contentAssets.id, assetId));
    
    res.json({ message: `${type} asset updated successfully` });
  } catch (error) {
    // Error updating asset - handled by error response
    res.status(500).json({ message: `Failed to update ${req.params.type} asset` });
  }
});

export default router;