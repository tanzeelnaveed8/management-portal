

// app/api/project-manager/projects/[projectId]/feedback/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';
import { z } from 'zod';

const feedbackSchema = z.object({
     content: z.string().min(5, 'Feedback content is required'),
     stage: z.enum(['initial', 'review', 'revision', 'approval']),
     status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED']).default('PENDING'),
     rating: z.number().min(1).max(5).optional(),
     feedbackType: z.string().optional(),
     isApproved: z.boolean().default(false)
});

export async function POST(request, { params }) {
     try {
          const { projectId } = params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Verify project access
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    managerId: decoded.id
               }
          });

          if (!project) {
               return NextResponse.json(
                    { error: 'Project not found or access denied' },
                    { status: 404 }
               );
          }

          const body = await request.json();

          // Validate input
          const validation = feedbackSchema.safeParse(body);
          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid input', details: validation.error.errors },
                    { status: 400 }
               );
          }

          const data = validation.data;

          // Get previous feedback count for revision tracking
          const previousFeedback = await prisma.clientFeedback.count({
               where: {
                    projectId,
                    stage: data.stage
               }
          });

          // Create feedback
          const feedback = await prisma.clientFeedback.create({
               data: {
                    content: data.content,
                    stage: data.stage,
                    status: data.status,
                    rating: data.rating,
                    feedbackType: data.feedbackType,
                    isApproved: data.isApproved,
                    revisionCount: previousFeedback,
                    projectId,
                    createdById: decoded.id
               },
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true,
                              clientName: true
                         }
                    }
               }
          });

          // If approved, update project status if needed
          if (data.isApproved && data.stage === 'approval') {
               await prisma.project.update({
                    where: { id: projectId },
                    data: {
                         status: 'COMPLETED',
                         completedAt: new Date()
                    }
               });
          }

          // If revision requested, update task statuses if needed
          if (data.status === 'REVISION_REQUESTED') {
               await prisma.task.updateMany({
                    where: {
                         projectId,
                         status: 'REVIEW'
                    },
                    data: {
                         status: 'IN_PROGRESS',
                         reviewNotes: `Revision requested: ${data.content}`
                    }
               });
          }

          // Notify team lead
          if (project.teamLeadId) {
               await prisma.notification.create({
                    data: {
                         type: 'FEEDBACK_RECEIVED',
                         title: `Client Feedback: ${data.status}`,
                         message: data.content,
                         link: `/team-lead/projects/${projectId}`,
                         userId: project.teamLeadId,
                         metadata: {
                              projectId,
                              projectName: project.name,
                              feedbackId: feedback.id,
                              stage: data.stage,
                              status: data.status
                         }
                    }
               });
          }

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'RECORD_FEEDBACK',
                    entityType: 'project',
                    entityId: projectId,
                    details: {
                         projectName: project.name,
                         stage: data.stage,
                         status: data.status,
                         isApproved: data.isApproved,
                         revisionCount: previousFeedback
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               message: 'Feedback recorded successfully',
               feedback
          });

     } catch (error) {
          console.error('Record feedback error:', error);
          return NextResponse.json(
               { error: 'Failed to record feedback' },
               { status: 500 }
          );
     }
}