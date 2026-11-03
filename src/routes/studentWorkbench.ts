import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

export const studentWorkbenchRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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

// GET /api/student/workbench
studentWorkbenchRouter.get('/', async (req, res) => {
  const studentId = (req as any).studentId;
  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    // Find the project where this student is a member, include all members
    const membership = await prisma.projectMember.findFirst({
      where: { studentId },
      include: { 
        project: {
          include: {
            members: {
              include: { student: true }
            }
          }
        } 
      }
    });

    const project = membership?.project || null;
    res.json({ student, project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load workbench' });
  }
});

// POST /api/student/workbench (Auto-save & Team Sync)
studentWorkbenchRouter.post('/', async (req, res) => {
  const studentId = (req as any).studentId;
  const { project } = req.body;

  try {
    const existingMembership = await prisma.projectMember.findFirst({
      where: { studentId },
      include: { project: true }
    });

    if (existingMembership) {
      // 1. Update the project details
      const updated = await prisma.project.update({
        where: { id: existingMembership.projectId },
        data: {
          title: project.name,
          description: project.goal,
          stage: String(project.stage),
          builder: project.builderString || 'Unknown', // We pass a flat string from frontend for the showcase card
          workbenchData: project 
        }
      });

      // 2. Sync Team Members (If the frontend sent a members array)
      if (project.members && Array.isArray(project.members)) {
        // Get current DB members
        const currentDbMembers = await prisma.projectMember.findMany({
          where: { projectId: updated.id }
        });

        const frontendMemberIds = project.members.map((m: any) => m.studentId);
        
        // Remove members that the lead deleted
        const membersToRemove = currentDbMembers.filter(m => !frontendMemberIds.includes(m.studentId) && m.role !== 'Lead');
        await prisma.projectMember.deleteMany({
          where: { id: { in: membersToRemove.map(m => m.id) } }
        });

        // Add or update current members
        for (const m of project.members) {
          await prisma.projectMember.upsert({
            where: { projectId_studentId: { projectId: updated.id, studentId: m.studentId } },
            update: { role: m.role },
            create: { projectId: updated.id, studentId: m.studentId, role: m.role }
          });
        }
      }

      return res.json(updated);
    } else {
      // Create new Project (student is the Lead)
      const created = await prisma.project.create({
        data: {
          title: project.name,
          builder: project.builderString || 'Unknown',
          description: project.goal,
          tags: [project.category || 'Other'],
          stage: String(project.stage),
          showcased: false,
          workbenchData: project,
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

// POST /api/student/workbench/join (Accept an invite link)
studentWorkbenchRouter.post('/join', async (req, res) => {
  const studentId = (req as any).studentId;
  const { projectId } = req.body;

  try {
    // Check if project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_studentId: { projectId, studentId } }
    });

    if (existing) {
      return res.json({ message: 'Already a member', projectId });
    }

    // Add to project
    await prisma.projectMember.create({
      data: { projectId, studentId, role: 'Member' }
    });

    res.json({ message: 'Joined successfully', projectId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join project' });
  }
});