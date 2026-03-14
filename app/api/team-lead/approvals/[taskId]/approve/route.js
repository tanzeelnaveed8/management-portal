

import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
     try {
          const { taskId } = params;
          const { feedback, notifyPM } = await request.json();

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
                              teamLeadId: true,
                              managerId: true,
                              manager: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              }
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

          // Update task status to COMPLETED
          const updatedTask = await prisma.task.update({
               where: { id: taskId },
               data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    reviewNotes: feedback || null,
                    updatedAt: new Date()
               },
               include: {
                    project: {
                         select: {
                              name: true
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

          // Create notification for developer
          await prisma.notification.create({
               data: {
                    type: 'TASK_COMPLETED',
                    title: 'Task Approved! 🎉',
                    message: feedback
                         ? `Your task "${task.title}" has been approved. Feedback: ${feedback}`
                         : `Your task "${task.title}" has been approved. Great work!`,
                    link: `/developer/tasks/${taskId}`,
                    userId: task.assigneeId,
                    metadata: {
                         taskId,
                         taskTitle: task.title,
                         approvedBy: decoded.name,
                         feedback
                    }
               }
          });

          // Notify project manager if requested
          if (notifyPM && task.project.managerId) {
               await prisma.notification.create({
                    data: {
                         type: 'TASK_COMPLETED',
                         title: 'Task Ready for Client Review',
                         message: `Task "${task.title}" has been approved by Team Lead and is ready for client review.`,
                         link: `/project-manager/tasks/${taskId}`,
                         userId: task.project.managerId,
                         metadata: {
                              taskId,
                              taskTitle: task.title,
                              projectName: task.project.name,
                              approvedBy: decoded.name
                         }
                    }
               });
          }

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'APPROVE_TASK',
                    entityType: 'task',
                    entityId: taskId,
                    details: {
                         taskTitle: task.title,
                         projectName: task.project.name,
                         developerName: task.assignee?.name,
                         feedback,
                         notifiedPM: notifyPM
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               message: 'Task approved successfully',
               task: updatedTask
          });

     } catch (error) {
          console.error('Approve task error:', error);
          return NextResponse.json(
               { error: 'Failed to approve task' },
               { status: 500 }
          );
     }
}