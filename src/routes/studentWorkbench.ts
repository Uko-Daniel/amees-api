import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

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

    // Map the memberships to return a clean list of projects with their role
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
  
  const wbData = project;

  try {
    if (project.id) {
      // 1. UPDATE EXISTING PROJECT
      const updated = await prisma.project.update({
        where: { id: project.id },
        data: {
          title: wbData.name,
          description: wbData.goal,
          stage: String(wbData.stage),
          builder: studentName || 'Unknown',
          workbenchData: wbData 
        }
      });

      // Sync team members
      if (wbData.members && Array.isArray(wbData.members)) {
        const currentDbMembers = await prisma.projectMember.findMany({
          where: { projectId: updated.id }
        });

        const frontendMemberIds = wbData.members.map((m: any) => m.studentId);
        
        // Remove members that the lead deleted
        const membersToRemove = currentDbMembers.filter(m => !frontendMemberIds.includes(m.studentId) && m.role !== 'Lead');
        if (membersToRemove.length > 0) {
          await prisma.projectMember.deleteMany({
            where: { id: { in: membersToRemove.map(m => m.id) } }
          });
        }

        // Add or update current members
        for (const m of wbData.members) {
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
          workbenchData: wbData,
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

// DELETE /api/student/workbench/:id (Delete project or leave team)
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

    if (membership.role === 'Lead') {
      // If Lead, delete the entire project and cascade members
      await prisma.project.delete({ where: { id: projectId } });
    } else {
      // If Member, just remove them from the team
      await prisma.projectMember.delete({ where: { id: membership.id } });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/student/workbench/join (Accept an invite link)
studentWorkbenchRouter.post('/join', async (req, res) => {
  const studentId = (req as any).studentId;
  const { projectId } = req.body;

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_studentId: { projectId, studentId } }
    });

    if (existing) {
      return res.json({ message: 'Already a member', projectId });
    }

    await prisma.projectMember.create({
      data: { projectId, studentId, role: 'Member' }
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