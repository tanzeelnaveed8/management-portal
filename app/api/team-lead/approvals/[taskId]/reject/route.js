
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
     try {
          const { taskId } = params;
          const { feedback, revisionPriority } = await request.json();

          if (!feedback) {
               return NextResponse.json(
                    { error: 'Feedback is required when requesting changes' },
                    { status: 400 }
               );
          }

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

          // Get task with all relations
          const task = await prisma.task.findUnique({
               where: { id: taskId },
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true,
                              teamLeadId: true
                         }
                    },
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    }
               }
          });

          if (!task) {
               return NextResponse.json(
                    { error: 'Task not found' },
                    { status: 404 }
               );
          }

          // Verify team lead has access
          if (task.project.teamLeadId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Update task status back to IN_PROGRESS with feedback
          const updatedTask = await prisma.task.update({
               where: { id: taskId },
               data: {
                    status: 'IN_PROGRESS',
                    reviewNotes: feedback,
                    reviewRequested: false,
                    priority: revisionPriority || task.priority, // Optionally bump priority
                    updatedAt: new Date()
               }
          });

          // Create notification for developer
          await prisma.notification.create({
               data: {
                    type: 'TASK_REVIEW',
                    title: 'Changes Requested on Your Task',
                    message: `Changes requested for "${task.title}". Feedback: ${feedback}`,
                    link: `/developer/tasks/${taskId}`,
                    userId: task.assigneeId,
                    metadata: {
                         taskId,
                         taskTitle: task.title,
                         feedback,
                         requestedBy: decoded.name,
                         priority: revisionPriority
                    }
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'REJECT_TASK',
                    entityType: 'task',
                    entityId: taskId,
                    details: {
                         taskTitle: task.title,
                         developerName: task.assignee?.name,
                         feedback,
                         revisionPriority
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               message: 'Changes requested successfully',
               task: updatedTask
          });

     } catch (error) {
          console.error('Reject task error:', error);
          return NextResponse.json(
               { error: 'Failed to request changes' },
               { status: 500 }
          );
     }
}