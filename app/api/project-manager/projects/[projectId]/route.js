
// app/api/project-manager/projects/[projectId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { projectId } = await params;

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

          // Check if user has appropriate role
          if (!['PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Fetch project with all related data
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    managerId: decoded.id // Ensure PM owns this project
               },
               include: {
                    manager: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    teamLead: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true
                         }
                    },
                    createdBy: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    milestones: {
                         include: {
                              tasks: {
                                   select: {
                                        id: true,
                                        status: true,
                                        assigneeId: true
                                   }
                              }
                         },
                         orderBy: { deadline: 'asc' }
                    },
                    tasks: {
                         include: {
                              assignee: {
                                   select: {
                                        id: true,
                                        name: true,
                                        avatar: true,
                                        email: true
                                   }
                              },
                              milestone: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              },
                              createdBy: {
                                   select: {
                                        name: true
                                   }
                              }
                         },
                         orderBy: { createdAt: 'desc' }
                    },
                    documents: {
                         include: {
                              uploadedBy: {
                                   select: {
                                        name: true,
                                        avatar: true
                                   }
                              }
                         },
                         orderBy: { uploadedAt: 'desc' }
                    },
                    feedbacks: {
                         include: {
                              createdBy: {
                                   select: {
                                        name: true,
                                        role: true,
                                        avatar: true
                                   }
                              }
                         },
                         orderBy: { createdAt: 'desc' }
                    },
                    _count: {
                         select: {
                              tasks: true,
                              milestones: true,
                              documents: true,
                              feedbacks: true
                         }
                    }
               }
          });

          if (!project) {
               return NextResponse.json(
                    { error: 'Project not found' },
                    { status: 404 }
               );
          }

          // Calculate progress based on tasks
          const totalTasks = project.tasks.length;
          const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.progress || 0;

          // Calculate milestone progress
          const milestonesWithProgress = project.milestones.map(m => {
               const milestoneTasks = m.tasks || [];
               const completedMilestoneTasks = milestoneTasks.filter(t => t.status === 'COMPLETED').length;
               const milestoneProgress = milestoneTasks.length > 0
                    ? Math.round((completedMilestoneTasks / milestoneTasks.length) * 100)
                    : 0;

               return {
                    ...m,
                    progress: milestoneProgress,
                    tasksCount: milestoneTasks.length,
                    completedTasks: completedMilestoneTasks,
                    tasks: undefined // Remove tasks array to keep response size manageable
               };
          });

          // Calculate task statistics
          const taskStats = {
               total: totalTasks,
               completed: completedTasks,
               inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
               review: project.tasks.filter(t => t.status === 'REVIEW').length,
               blocked: project.tasks.filter(t => t.status === 'BLOCKED').length,
               notStarted: project.tasks.filter(t => t.status === 'NOT_STARTED').length,
               overdue: project.tasks.filter(t =>
                    t.status !== 'COMPLETED' &&
                    t.deadline &&
                    new Date(t.deadline) < new Date()
               ).length
          };

          // Calculate days until deadline
          const daysUntilDeadline = project.deadline
               ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
               : null;

          const projectWithStats = {
               ...project,
               progress,
               daysUntilDeadline,
               milestones: milestonesWithProgress,
               stats: taskStats,
               completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          };

          return NextResponse.json({ project: projectWithStats });

     } catch (error) {
          console.error('Project Details API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}