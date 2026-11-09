import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export const studentWorkbenchRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware to authenticate student
studentWorkbenchRouter.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).studentId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Safely read the JSON blob
const readWb = (project: any) =>
  project?.workbenchData && typeof project.workbenchData === 'object'
    ? project.workbenchData
    : {};

// GET /api/student/workbench (Fetch ALL projects for this student)
studentWorkbenchRouter.get('/', async (req, res) => {
  const studentId = (req as any).studentId;
  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const memberships = await prisma.projectMember.findMany({
      where: { studentId },
      include: {
        project: {
          include: {
            members: {
              include: {
                student: { select: { id: true, name: true, matric: true } }
              }
            }
          }
        }
      }
    });

    const projects = memberships.map(m => ({
      ...m.project,
      myRole: m.role,
      members: m.project.members
    }));

    res.json({ student, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load workbench' });
  }
});

// POST /api/student/workbench (Auto-save & Create)
studentWorkbenchRouter.post('/', async (req, res) => {
  const studentId = (req as any).studentId;
  const { project, studentName } = req.body;
  const wbData = { ...(project || {}) };

  // Invite tokens are server-managed ONLY. Strip any client value so a stale
  // browser (which may still hold a token that was already burned by a join)
  // cannot resurrect it via auto-save.
  delete wbData.inviteToken;
  delete wbData.inviteTokenIssuedAt;

  try {
    if (project.id) {
      // 1. UPDATE EXISTING PROJECT
      const dbProject = await prisma.project.findUnique({
        where: { id: project.id },
        select: { workbenchData: true }
      });
      if (!dbProject) return res.status(404).json({ error: 'Project not found' });

      const dbWb = readWb(dbProject);
      // Preserve the server's invite state verbatim.
      const merged = {
        ...wbData,
        inviteToken: dbWb.inviteToken ?? null,
        inviteTokenIssuedAt: dbWb.inviteTokenIssuedAt ?? null,
      };

      const updated = await prisma.project.update({
        where: { id: project.id },
        data: {
          title: wbData.name,
          description: wbData.goal,
          stage: String(wbData.stage),
          builder: studentName || 'Unknown',
          workbenchData: merged,
        }
      });

      // Sync team members
      if (wbData.members && Array.isArray(wbData.members)) {
        const currentDbMembers = await prisma.projectMember.findMany({
          where: { projectId: updated.id }
        });

        const frontendMemberIds = wbData.members
          .map((m: any) => m.studentId)
          .filter(Boolean);

        // Remove members that the lead deleted
        const membersToRemove = currentDbMembers.filter(
          m => !frontendMemberIds.includes(m.studentId) && m.role !== 'Lead'
        );
        if (membersToRemove.length > 0) {
          await prisma.projectMember.deleteMany({
            where: { id: { in: membersToRemove.map(m => m.id) } }
          });
        }

        // Add or update current members
        for (const m of wbData.members) {
          if (!m.studentId) continue;
          await prisma.projectMember.upsert({
            where: { projectId_studentId: { projectId: updated.id, studentId: m.studentId } },
            update: { role: m.role },
            create: { projectId: updated.id, studentId: m.studentId, role: m.role }
          });
        }
      }

      return res.json(updated);
    } else {
      // 2. CREATE NEW PROJECT
      const created = await prisma.project.create({
        data: {
          title: wbData.name,
          builder: studentName || 'Unknown',
          description: wbData.goal,
          tags: [wbData.category || 'Other'],
          stage: String(wbData.stage),
          showcased: false,
          workbenchData: { ...wbData, inviteToken: null, inviteTokenIssuedAt: null },
          members: {
            create: { studentId: studentId, role: 'Lead' }
          }
        }
      });
      return res.json(created);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// POST /api/student/workbench/:id/invite — generate a fresh single-use token
studentWorkbenchRouter.post('/:id/invite', async (req, res) => {
  const studentId = (req as any).studentId;
  const projectId = req.params.id;

  try {
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_studentId: { projectId, studentId } }
    });
    if (!membership) return res.status(404).json({ error: 'Project not found' });
    if (membership.role !== 'Lead') {
      return res.status(403).json({ error: 'Only the project lead can generate invite links' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workbenchData: true }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const token = randomUUID();
    const wb = readWb(project);
    const nextWb = { ...wb, inviteToken: token, inviteTokenIssuedAt: Date.now() };

    await prisma.project.update({
      where: { id: projectId },
      data: { workbenchData: nextWb }
    });

    res.json({ inviteToken: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate invite' });
  }
});

// DELETE /api/student/workbench/:id — lead only, requires no other teammates
studentWorkbenchRouter.delete('/:id', async (req, res) => {
  const studentId = (req as any).studentId;
  const projectId = req.params.id;

  try {
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_studentId: { projectId, studentId } }
    });
    if (!membership) {
      return res.status(404).json({ error: 'Project not found or you are not a member' });
    }

    if (membership.role !== 'Lead') {
      return res.status(403).json({
        error: 'Only the project lead can delete a project. Use the leave endpoint to leave.'
      });
    }

    const memberCount = await prisma.projectMember.count({ where: { projectId } });
    if (memberCount > 1) {
      return res.status(400).json({
        error: 'Remove all teammates before deleting this project.'
      });
    }

    await prisma.project.delete({ where: { id: projectId } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/student/workbench/:id/leave — non-lead members leave
studentWorkbenchRouter.post('/:id/leave', async (req, res) => {
  const studentId = (req as any).studentId;
  const projectId = req.params.id;

  try {
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_studentId: { projectId, studentId } }
    });
    if (!membership) {
      return res.status(404).json({ error: 'Not a member of this project' });
    }

    if (membership.role === 'Lead') {
      return res.status(400).json({
        error: 'The lead cannot leave. Delete the project or transfer leadership first.'
      });
    }

    await prisma.projectMember.delete({ where: { id: membership.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to leave project' });
  }
});

// POST /api/student/workbench/join — validate + burn single-use invite
studentWorkbenchRouter.post('/join', async (req, res) => {
  const studentId = (req as any).studentId;
  const { projectId, inviteToken } = req.body;

  if (!projectId) return res.status(400).json({ error: 'Missing projectId' });

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, workbenchData: true }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_studentId: { projectId, studentId } }
    });
    if (existing) {
      return res.json({ message: 'Already a member', projectId });
    }

    const wb = readWb(project);
    const expected = wb.inviteToken;
    if (!expected || !inviteToken || inviteToken !== expected) {
      return res.status(400).json({ error: 'Invalid or already-used invite link' });
    }

    await prisma.projectMember.create({
      data: { projectId, studentId, role: 'Member' }
    });

    // Burn the token. Bumping issuedAt makes any in-flight stale auto-save from
    // a lead's browser clearly older than the DB state (which we preserve).
    await prisma.project.update({
      where: { id: projectId },
      data: {
        workbenchData: { ...wb, inviteToken: null, inviteTokenIssuedAt: Date.now() }
      }
    });

    res.json({ message: 'Joined successfully', projectId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to join project' });
  }
});

// GET /api/student/workbench/high-score
studentWorkbenchRouter.get('/high-score', async (req, res) => {
  const studentId = (req as any).studentId;
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { runnerHighScore: true }
    });
    res.json({ score: student?.runnerHighScore || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load score' });
  }
});

// POST /api/student/workbench/high-score
studentWorkbenchRouter.post('/high-score', async (req, res) => {
  const studentId = (req as any).studentId;
  const { score } = req.body;

  if (typeof score !== 'number') return res.status(400).json({ error: 'Invalid score' });

  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student && score > student.runnerHighScore) {
      await prisma.student.update({
        where: { id: studentId },
        data: { runnerHighScore: score }
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save score' });
  }
});