import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const adminRouter = Router();

// Every route below requires a valid JWT
adminRouter.use(requireAuth);

// 2. Update Featured Event
adminRouter.put('/event', async (req, res) => {
  try {
    const existing = await prisma.featuredEvent.findFirst({ where: { isActive: true } });
    if (!existing) return res.status(404).json({ error: 'Event not found' });

    const updated = await prisma.featuredEvent.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// 3. Update Site Settings
adminRouter.put('/settings', async (req, res) => {
  try {
    const updated = await prisma.siteSettings.update({
      where: { id: 'global' },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// 4. Calendar CRUD
adminRouter.post('/calendar', async (req, res) => {
  try {
    const { day, title, type } = req.body;
    const newEntry = await prisma.calendarEntry.create({
      data: { date: new Date(`${day}T12:00:00+01:00`), title, type: type || 'special' },
    });
    res.json(newEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

adminRouter.delete('/calendar/:id', async (req, res) => {
  try {
    await prisma.calendarEntry.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// 5. Weekly Rhythm CRUD
adminRouter.post('/weekly', async (req, res) => {
  try {
    const newItem = await prisma.weeklyRhythm.create({ data: req.body });
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

adminRouter.delete('/weekly/:id', async (req, res) => {
  try {
    await prisma.weeklyRhythm.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// 6. Executives CRUD
adminRouter.post('/executives', async (req, res) => {
  try {
    const newExec = await prisma.executive.create({ data: req.body });
    res.json(newExec);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

adminRouter.delete('/executives/:id', async (req, res) => {
  try {
    await prisma.executive.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// 7. Toggle Project Showcase
adminRouter.put('/projects/:id/toggle', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { showcased: !project.showcased },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// 8. Partners (Sponsors) CRUD
adminRouter.get('/partners', async (_req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load partners' });
  }
});

adminRouter.post('/partners', async (req, res) => {
  try {
    const { name, type, tier, logoUrl, websiteUrl, order, active } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });

    const created = await prisma.partner.create({
      data: {
        name: name.trim(),
        type: type === 'Sponsor' ? 'Sponsor' : 'Partner',
        tier: tier?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        order: Number.isFinite(order) ? order : 0,
        active: active !== false,
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error('partner create failed', error);
    res.status(500).json({ error: 'Failed to add partner' });
  }
});

adminRouter.delete('/partners/:id', async (req, res) => {
  try {
    await prisma.partner.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete partner' });
  }
});