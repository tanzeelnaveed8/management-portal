

// app/api/developer/tasks/[taskId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          // ✅ Await the params to get the taskId
          const { taskId } = await params;

          // Get token from cookies
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          // Verify token and get user
          const decoded = verifyAccessToken(token);
          if (!decoded) {
               return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
               );
          }

          // Validate that taskId exists
          if (!taskId) {
               return NextResponse.json(
                    { error: 'Task ID is required' },
                    { status: 400 }
               );
          }

          // Fetch task with all related data
          const task = await prisma.task.findUnique({
               where: { id: taskId }, // Now taskId is properly defined
               include: {
                    project: {
                         include: {
                              manager: {
                                   select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true
                                   }
                              },
                              teamLead: {
                                   select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true
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
                              email: true,
                              avatar: true
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
                                        avatar: true,
                                        role: true
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

          // Verify access (task assigned to this developer or user is admin/manager)
          const hasAccess = task.assigneeId === decoded.id ||
               decoded.role === 'CEO' ||
               decoded.role === 'PROJECT_MANAGER' ||
               decoded.role === 'TEAM_LEAD';

          if (!hasAccess) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Calculate time metrics
          const now = new Date();
          const isOverdue = task.deadline && new Date(task.deadline) < now && task.status !== 'COMPLETED';
          const daysUntilDeadline = task.deadline
               ? Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24))
               : null;

          // Format time spent
          const timeSpent = task.actualHours ? `${task.actualHours}h` : 'Not started';
          const timeRemaining = task.estimatedHours && task.actualHours
               ? `${Math.max(0, task.estimatedHours - task.actualHours)}h`
               : task.estimatedHours ? `${task.estimatedHours}h` : 'N/A';

          const taskWithMeta = {
               ...task,
               isOverdue,
               daysUntilDeadline,
               timeSpent,
               timeRemaining,
               progress: task.estimatedHours && task.actualHours
                    ? Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100))
                    : 0
          };

          return NextResponse.json({ task: taskWithMeta });

     } catch (error) {
          console.error('Task fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch task' },
               { status: 500 }
          );
     }
}