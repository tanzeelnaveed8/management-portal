

// app/api/team-lead/tasks/[taskId]/approve/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
     try {
          const { taskId } = await params;
          const token = request.cookies.get('accessToken')?.value;
          const { notes } = await request.json();

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Verify task exists and team lead has access
          const task = await prisma.task.findUnique({
               where: { id: taskId },
               include: {
                    project: {
                         select: {
                              teamLeadId: true,
                              managerId: true,
                              id: true
                         }
                    },
                    assignee: {
                         select: {
                              id: true,
                              name: true
                         }
                    }
               }
          });

          if (!task) {
               return NextResponse.json({ error: 'Task not found' }, { status: 404 });
          }

          // Check access
          if (task.project.teamLeadId !== decoded.id && task.project.managerId !== decoded.id) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Update task status
          const updatedTask = await prisma.task.update({
               where: { id: taskId },
               data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    reviewNotes: notes,
                    reviewRequested: false
               },
               include: {
                    assignee: true,
                    project: true
               }
          });

          // Update project completed task count
          await prisma.project.update({
               where: { id: task.projectId },
               data: {
                    completedTaskCount: { increment: 1 }
               }
          });

          // Create notification for developer
          if (task.assigneeId) {
               await prisma.notification.create({
                    data: {
                         type: 'TASK_COMPLETED',
                         title: 'Task Approved',
                         message: `Your task "${task.title}" has been approved by Team Lead`,
                         userId: task.assigneeId,
                         link: `/developer/tasks/${task.id}`,
                         metadata: {
                              taskId: task.id,
                              approvedBy: decoded.name,
                              notes
                         }
                    }
               });
          }

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'APPROVE_TASK',
                    entityType: 'task',
                    entityId: task.id,
                    userId: decoded.id,
                    details: {
                         taskTitle: task.title,
                         projectId: task.projectId,
                         notes
                    }
               }
          });

          return NextResponse.json({
               message: 'Task approved successfully',
               task: updatedTask
          });

     } catch (error) {
          console.error('Task approval error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}