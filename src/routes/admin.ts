import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const adminRouter = Router();

// Every route below requires a valid JWT
adminRouter.use(requireAuth);

// Helper to trigger a real-time update for all visitors
const broadcast = (req: any) => {
  const io = req.app.get('io');
  if (io) io.emit('content-updated');
};

// ---------------------------------------------------------
// 1. Featured Event & Settings
// ---------------------------------------------------------
adminRouter.put('/event', async (req, res) => {
  try {
    const existing = await prisma.featuredEvent.findFirst({ where: { isActive: true } });
    if (!existing) return res.status(404).json({ error: 'Event not found' });

    const updated = await prisma.featuredEvent.update({
      where: { id: existing.id },
      data: req.body,
    });
    broadcast(req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

adminRouter.put('/settings', async (req, res) => {
  try {
    const updated = await prisma.siteSettings.update({
      where: { id: 'global' },
      data: req.body,
    });
    broadcast(req);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ---------------------------------------------------------
// 2. Calendar (One-off Events) CRUD
// ---------------------------------------------------------
adminRouter.post('/calendar', async (req, res) => {
  try {
    const { day, title, description, type, startTime, endTime, joinUrl, registrationUrl } = req.body;
    
    // Combine day and times into full Date objects
    const startStr = `${day}T${startTime || '12:00'}:00+01:00`;
    const endStr = `${day}T${endTime || '14:00'}:00+01:00`;

    const newEntry = await prisma.calendarEntry.create({
      data: { 
        date: new Date(startStr), 
        endDate: new Date(endStr),
        title, 
        description: description || null, 
        type: type || 'special',
        joinUrl: joinUrl || null,
        registrationUrl: registrationUrl || null
      },
    });
    broadcast(req);
    res.json(newEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

adminRouter.put('/calendar/:id', async (req, res) => {
  try {
    const { day, title, description, type, startTime, endTime, joinUrl, registrationUrl } = req.body;
    
    // Fetch existing to get the day if not provided
    const existing = await prisma.calendarEntry.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const dateStr = day || existing.date.toISOString().split('T')[0];
    const startStr = `${dateStr}T${startTime || '12:00'}:00+01:00`;
    const endStr = `${dateStr}T${endTime || '14:00'}:00+01:00`;

    const updated = await prisma.calendarEntry.update({
      where: { id: req.params.id },
      data: { 
        date: new Date(startStr),
        endDate: new Date(endStr),
        title, 
        description, 
        type,
        joinUrl: joinUrl || null,
        registrationUrl: registrationUrl || null
      },
    });
    broadcast(req);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

adminRouter.delete('/calendar/:id', async (req, res) => {
  try {
    await prisma.calendarEntry.delete({ where: { id: req.params.id } });
    broadcast(req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ---------------------------------------------------------
// 3. Weekly Rhythm CRUD
// ---------------------------------------------------------
adminRouter.post('/weekly', async (req, res) => {
  try {
    const newItem = await prisma.weeklyRhythm.create({ data: req.body });
    broadcast(req);
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create weekly item' });
  }
});

adminRouter.put('/weekly/:id', async (req, res) => {
  try {
    const updated = await prisma.weeklyRhythm.update({
      where: { id: req.params.id },
      data: req.body,
    });
    broadcast(req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update weekly item' });
  }
});

adminRouter.delete('/weekly/:id', async (req, res) => {
  try {
    await prisma.weeklyRhythm.delete({ where: { id: req.params.id } });
    broadcast(req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete weekly item' });
  }
});

// ---------------------------------------------------------
// 4. Executives CRUD
// ---------------------------------------------------------
adminRouter.post('/executives', async (req, res) => {
  try {
    const newExec = await prisma.executive.create({ data: req.body });
    broadcast(req);
    res.json(newExec);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create executive' });
  }
});

adminRouter.put('/executives/:id', async (req, res) => {
  try {
    const updated = await prisma.executive.update({
      where: { id: req.params.id },
      data: req.body,
    });
    broadcast(req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update executive' });
  }
});

adminRouter.delete('/executives/:id', async (req, res) => {
  try {
    await prisma.executive.delete({ where: { id: req.params.id } });
    broadcast(req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete executive' });
  }
});

// ---------------------------------------------------------
// 5. Projects (Toggle Showcase)
// ---------------------------------------------------------
adminRouter.put('/projects/:id/toggle', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { showcased: !project.showcased },
    });
    broadcast(req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle project' });
  }
});

// ---------------------------------------------------------
// 6. Partners (Sponsors) CRUD
// ---------------------------------------------------------
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
    broadcast(req);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add partner' });
  }
});

adminRouter.put('/partners/:id', async (req, res) => {
  try {
    const updated = await prisma.partner.update({
      where: { id: req.params.id },
      data: req.body,
    });
    broadcast(req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

adminRouter.delete('/partners/:id', async (req, res) => {
  try {
    await prisma.partner.delete({ where: { id: req.params.id } });
    broadcast(req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete partner' });
  }
});

// ---------------------------------------------------------
// 7. Opportunities CRUD
// ---------------------------------------------------------
adminRouter.post('/opportunities', async (req, res) => {
  try {
    const created = await prisma.opportunity.create({ data: req.body });
    broadcast(req);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add opportunity' });
  }
});

adminRouter.put('/opportunities/:id', async (req, res) => {
  try {
    const updated = await prisma.opportunity.update({
      where: { id: req.params.id },
      data: req.body,
    });
    broadcast(req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

adminRouter.delete('/opportunities/:id', async (req, res) => {
  try {
    await prisma.opportunity.delete({ where: { id: req.params.id } });
    broadcast(req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});

// ---------------------------------------------------------
// 8. Archive Files (Google Drive links) CRUD
// ---------------------------------------------------------
adminRouter.post('/archive-files', async (req, res) => {
  try {
    const { title, course, level, year, kind, fileUrl } = req.body;
    const created = await prisma.archiveFile.create({
      data: {
        title,
        course,
        level: Number(level),
        year: Number(year),
        kind,
        fileUrl,
        sizeBytes: 0,
      },
    });
    broadcast(req);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add archive link' });
  }
});

adminRouter.put('/archive-files/:id', async (req, res) => {
  try {
    const { title, course, level, year, kind } = req.body;
    const updated = await prisma.archiveFile.update({
      where: { id: req.params.id },
      data: { title, course, level: Number(level), year: Number(year), kind },
    });
    broadcast(req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update archive link' });
  }
});

adminRouter.delete('/archive-files/:id', async (req, res) => {
  try {
    await prisma.archiveFile.delete({ where: { id: req.params.id } });
    broadcast(req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete archive link' });
  }
});

// ---------------------------------------------------------
// 9. Students CRUD (Manual & Bulk)
// ---------------------------------------------------------
adminRouter.post('/students', async (req, res) => {
  try {
    const { name, matric, email, level } = req.body;
    if (!name || !matric || !email) return res.status(400).json({ error: 'Name, matric, email required' });
    
    // Normalize matric number
    const cleanMatric = matric.trim().toUpperCase().replace(/\s+/g, '');

    const student = await prisma.student.create({
      data: { name, matric: cleanMatric, email, level: Number(level) || 100 }
    });
    res.status(201).json(student);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Matric or Email already exists' });
    res.status(500).json({ error: 'Failed to add student' });
  }
});

adminRouter.post('/students/bulk', async (req, res) => {
  try {
    const { csv } = req.body;
    const lines = csv.split('\n').filter((l: string) => l.trim().length > 0);
    const studentsData = lines.map((line: string) => {
      const [name, matric, email, level] = line.split(',').map((s: string) => s.trim());
      const cleanMatric = matric.trim().toUpperCase().replace(/\s+/g, '');
      return { name, matric: cleanMatric, email, level: Number(level) || 100 };
    });

    const result = await prisma.student.createMany({
      data: studentsData,
      skipDuplicates: true
    });

    res.json({ message: `Successfully added ${result.count} students.`, count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process CSV' });
  }
});

adminRouter.get('/students', async (req, res) => {
  try {
    const query = req.query.q ? String(req.query.q) : '';
    
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { matric: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 results for speed
    });
    
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load students' });
  }
});