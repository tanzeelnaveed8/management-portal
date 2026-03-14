// app/api/team-lead/tasks/[taskId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { taskId } = await params;
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
                    { error: 'Access denied. Only Team Leads can view tasks.' },
                    { status: 403 }
               );
          }

          // Fetch task with all related data
          const task = await prisma.task.findUnique({
               where: { id: taskId },
               include: {
                    project: {
                         include: {
                              manager: {
                                   select: {
                                        id: true,
                                        name: true,
                                        email: true
                                   }
                              }
                         }
                    },
                    milestone: true,
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true,
                              jobTitle: true
                         }
                    },
                    createdBy: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    comments: {
                         orderBy: {
                              createdAt: 'desc'
                         },
                         include: {
                              author: {
                                   select: {
                                        id: true,
                                        name: true,
                                        role: true,
                                        avatar: true
                                   }
                              },
                              replies: {
                                   include: {
                                        author: {
                                             select: {
                                                  id: true,
                                                  name: true,
                                                  avatar: true
                                             }
                                        }
                                   }
                              }
                         }
                    },
                    attachments: {
                         orderBy: {
                              uploadedAt: 'desc'
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

          // Verify this team lead has access to this task's project
          if (task.project.teamLeadId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Access denied. You are not the team lead for this project.' },
                    { status: 403 }
               );
          }

          // Calculate additional metrics
          const now = new Date();
          const taskWithMeta = {
               ...task,
               isOverdue: task.deadline && new Date(task.deadline) < now && task.status !== 'COMPLETED',
               daysUntilDeadline: task.deadline
                    ? Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24))
                    : null,
               progress: task.estimatedHours && task.actualHours
                    ? Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100))
                    : 0
          };

          return NextResponse.json({ task: taskWithMeta });

     } catch (error) {
          console.error('Team Lead Task Details API Error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to fetch task details' },
               { status: 500 }
          );
     }
}

export async function PATCH(request, { params }) {
     try {
          const { taskId } = await params;
          const token = request.cookies.get('accessToken')?.value;
          const body = await request.json();

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'TEAM_LEAD') {
               return NextResponse.json(
                    { error: 'Access denied. Only Team Leads can update tasks.' },
                    { status: 403 }
               );
          }

          // Verify task belongs to team lead's project
          const existingTask = await prisma.task.findUnique({
               where: { id: taskId },
               include: {
                    project: {
                         select: {
                              teamLeadId: true,
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

          if (!existingTask || existingTask.project.teamLeadId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Access denied. Task not found or you do not have permission.' },
                    { status: 403 }
               );
          }

          const { status, reviewApproved, reviewNotes, estimatedHours, actualHours, priority, deadline } = body;

          // Prepare update data
          const updateData = {};

          if (status) updateData.status = status;
          if (priority) updateData.priority = priority;
          if (estimatedHours !== undefined) updateData.estimatedHours = parseFloat(estimatedHours);
          if (actualHours !== undefined) updateData.actualHours = parseFloat(actualHours);
          if (deadline) updateData.deadline = new Date(deadline);
          if (reviewNotes) updateData.reviewNotes = reviewNotes;

          // If approving a completed task
          if (status === 'COMPLETED' && reviewApproved) {
               updateData.completedAt = new Date();

               // Create notification for developer
               if (existingTask.assigneeId) {
                    await prisma.notification.create({
                         data: {
                              type: 'TASK_COMPLETED',
                              title: 'Task Approved',
                              message: `Your task "${existingTask.title}" has been approved`,
                              link: `/developer/tasks/${taskId}`,
                              userId: existingTask.assigneeId,
                              metadata: {
                                   taskId,
                                   taskTitle: existingTask.title,
                                   approvedBy: decoded.name
                              }
                         }
                    });
               }
          }

          // Update task
          const updatedTask = await prisma.task.update({
               where: { id: taskId },
               data: updateData,
               include: {
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    project: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    milestone: {
                         select: {
                              id: true,
                              name: true
                         }
                    }
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: reviewApproved ? 'APPROVE_TASK' : 'UPDATE_TASK',
                    entityType: 'task',
                    entityId: taskId,
                    details: {
                         taskTitle: existingTask.title,
                         changes: Object.keys(body),
                         approved: reviewApproved || false
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               task: updatedTask,
               message: reviewApproved ? 'Task approved successfully' : 'Task updated successfully'
          });

     } catch (error) {
          console.error('Update Task API Error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to update task' },
               { status: 500 }
          );
     }
}