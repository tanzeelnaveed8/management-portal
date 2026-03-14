

// app/api/team-lead/report-issues/submit/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

import { z } from 'zod';

// Validation schema
const issueSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  milestoneId: z.string().optional(),
  taskId: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  impact: z.string().optional(),
  suggestedResolution: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

export async function POST(request) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'TEAM_LEAD') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = issueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { projectId, milestoneId, taskId, urgency, subject, description, impact, suggestedResolution, attachments } = validation.data;

    // Verify project access and get project details
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        teamLeadId: decoded.id
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    if (!project.manager) {
      return NextResponse.json(
        { error: 'No project manager assigned to this project' },
        { status: 400 }
      );
    }

    // Create issue report as a notification to PM
    const notification = await prisma.notification.create({
      data: {
        type: 'SYSTEM_ALERT',
        title: `[${urgency}] Issue Report: ${subject}`,
        message: description,
        link: `/project-manager/issues/${projectId}`,
        userId: project.manager.id,
        metadata: {
          projectId,
          projectName: project.name,
          milestoneId,
          taskId,
          urgency,
          subject,
          description,
          impact,
          suggestedResolution,
          attachments,
          reportedBy: decoded.id,
          reportedByName: decoded.name,
          reportedAt: new Date().toISOString()
        }
      }
    });

    // Create activity log
    const activityLog = await prisma.activityLog.create({
      data: {
        action: 'REPORT_ISSUE',
        entityType: 'project',
        entityId: projectId,
        details: {
          urgency,
          subject,
          description: description.substring(0, 100) + '...',
          milestoneId,
          taskId,
          notifiedPM: project.manager.name,
          pmId: project.manager.id
        },
        userId: decoded.id
      }
    });

    // If task is specified, update its status to BLOCKED if urgency is HIGH or CRITICAL
    if (taskId && (urgency === 'HIGH' || urgency === 'CRITICAL')) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'BLOCKED',
          reviewNotes: `BLOCKED: ${subject} - ${description.substring(0, 200)}`
        }
      });
    }

    // If milestone is specified and urgency is CRITICAL, mark milestone as delayed
    if (milestoneId && urgency === 'CRITICAL') {
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: 'DELAYED',
          isDelayed: true
        }
      });
    }

    // Create a thread/comment for the issue (optional - can be used for discussion)
    if (taskId) {
      await prisma.comment.create({
        data: {
          content: `🚨 **ISSUE REPORTED** - ${urgency}\n\n**Subject:** ${subject}\n\n**Description:** ${description}\n\n${impact ? `**Impact:** ${impact}\n\n` : ''}${suggestedResolution ? `**Suggested Resolution:** ${suggestedResolution}` : ''}`,
          taskId,
          authorId: decoded.id
        }});
    }

    return NextResponse.json({
      success: true,
      message: 'Issue reported successfully',
      data: {
        notificationId: notification.id,
        activityId: activityLog.id,
        urgency,
        reportedTo: project.manager.name
      }
    });

  } catch (error) {
    console.error('Report issue error:', error);
    return NextResponse.json(
      { error: 'Failed to report issue' },
      { status: 500 }
    );
  }
}