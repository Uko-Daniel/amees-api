import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const archiveFilesRouter = Router();
archiveFilesRouter.use(requireAuth);

archiveFilesRouter.get('/', async (_req, res) => {
  try {
    const files = await prisma.archiveFile.findMany({
      orderBy: [{ year: 'desc' }, { uploadedAt: 'desc' }],
    });
    res.json(files);
  } catch (err) {
    console.error('archive list failed', err);
    res.status(500).json({ error: 'Failed to load files' });
  }
});

archiveFilesRouter.post('/', async (req, res) => {
  try {
    const { title, course, level, year, kind, fileUrl, sample } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' });
    if (!course?.trim()) return res.status(400).json({ error: 'Course is required.' });
    if (!fileUrl?.trim()) return res.status(400).json({ error: 'File URL is required.' });

    const created = await prisma.archiveFile.create({
      data: {
        title: title.trim(),
        course: course.trim(),
        level: Number(level) || 100,
        year: Number(year) || new Date().getFullYear(),
        kind: kind || 'PDF',
        fileUrl: fileUrl.trim(),
        sizeBytes: 0,
        sample: sample === true,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('archive create failed', err);
    res.status(500).json({ error: 'Failed to add file' });
  }
});

archiveFilesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.archiveFile.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('archive delete failed', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});