import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { sponsorEnquiryRouter } from './sponsorEnquiry.js';

export const publicRouter = Router();

publicRouter.use('/sponsor-enquiry', sponsorEnquiryRouter);

// Helper for impact stats (e.g., 17 -> 20+)
const roundUpToTen = (num: number) => num === 0 ? '0+' : `${Math.ceil(num / 10) * 10}+`;

// ---------------------------------------------------------------- search
publicRouter.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return res.json({ query: '', results: [] });

  const term = q.slice(0, 100);

  try {
    const [projects, archive, events, tiers] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { builder: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { id: true, title: true, builder: true, description: true, showcased: true },
      }),
      prisma.archiveFile.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { course: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { id: true, title: true, course: true, level: true, year: true, kind: true, fileUrl: true },
      }),
      prisma.calendarEntry.findMany({
        where: { title: { contains: term, mode: 'insensitive' } },
        take: 5,
        select: { id: true, title: true, date: true, type: true },
      }),
      prisma.sponsorTier.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { price: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, price: true, features: true },
      }),
    ]);

    const results = [
      ...projects.map((p) => ({
        type: 'project' as const,
        id: p.id,
        title: p.title,
        subtitle: `By ${p.builder}`,
        description: p.description,
        href: `/project/${p.id}`,
        meta: p.showcased ? 'Showcased' : undefined,
      })),
      ...archive.map((f) => ({
        type: 'archive' as const,
        id: f.id,
        title: f.title,
        subtitle: `${f.course} · ${f.level}L · ${f.year}`,
        description: f.kind,
        href: f.fileUrl ?? null,
        meta: f.fileUrl ? 'Download' : 'Sample',
      })),
      ...events.map((e) => ({
        type: 'event' as const,
        id: e.id,
        title: e.title,
        subtitle: e.date.toISOString().split('T')[0],
        description: e.type,
        href: '/calendar',
        meta: undefined,
      })),
      ...tiers.map((t) => ({
        type: 'sponsor-tier' as const,
        id: t.id,
        title: t.name,
        subtitle: t.price,
        description: t.features.join(' · '),
        href: '/sponsors',
        meta: undefined,
      })),
    ];

    res.json({ query: term, results });
  } catch (error) {
    console.error('search failed', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ---------------------------------------------------------------- content
publicRouter.get('/content', async (_req, res) => {
  try {
    const featured = await prisma.featuredEvent.findFirst({ where: { isActive: true } });
    const weekly = await prisma.weeklyRhythm.findMany();
    const calendarEntries = await prisma.calendarEntry.findMany();
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
    const projectsData = await prisma.project.findMany();
    const executiveData = await prisma.executive.findMany({ orderBy: { order: 'asc' } });
    const partners = await prisma.partner.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    const sponsorTiers = await prisma.sponsorTier.findMany();
    const archiveFiles = await prisma.archiveFile.findMany({
      orderBy: [{ year: 'desc' }, { uploadedAt: 'desc' }],
    });
    
    // New Queries for Phase 1
    const opportunities = await prisma.opportunity.findMany({ orderBy: { endDate: 'asc' } });
    const studentCount = await prisma.student.count();
    const showcasedCount = await prisma.project.count({ where: { showcased: true } });

    if (!settings) throw new Error('Site settings not found in database');

    const content = {
      featured: featured
        ? {
            ...featured,
            start: featured.start.toISOString(),
            end: featured.end.toISOString(),
          }
        : null,
      weekly,
      calendarEntries: calendarEntries.map((c) => ({
        ...c,
        day: c.date.toISOString().split('T')[0],
      })),
      projects: {
        ...(settings.exhibition as any),
        projects: projectsData,
      },
      about: {
        ...(settings.about as any),
        executive: executiveData,
      },
      sponsorTiers,
      partners,
      activeMarquee: settings.activeMarquee || 'caution',
      archive: settings.archive,
      archiveFiles,
      quickLinks: settings.quickLinks,
      upcoming: settings.upcoming,
      opportunities, // Real DB opportunities
      footer: settings.footer,
      pages: settings.pages,
      sponsorPitch: settings.sponsorPitch || { title: 'Partner with AMEES', text: '', cta: '' },

      membershipFormUrl: settings.membershipFormUrl ?? '',
      projectSubmissionUrl: settings.projectSubmissionUrl ?? '',
      eventRegistrationFormUrl: settings.eventRegistrationFormUrl ?? '',
      eventRegistrationEventFieldId: settings.eventRegistrationEventFieldId ?? '',

      // Impact Stats
      impact: {
        members: roundUpToTen(studentCount || 150),
        projects: roundUpToTen(showcasedCount || 24),
      },

      calendarMilestones: [],
      calendarNote: '',
    };

    res.json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load content' });
  }
});