
// app/api/developer/projects/[projectId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

// --- FIX: Make the function async and await the params ---
export async function GET(request, { params }) {
     try {
          // Await the params promise to get the actual object
          const { projectId } = await params;
          // --- End of fix ---

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

          // Verify user is a developer
          if (decoded.role !== 'DEVELOPER') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Fetch project with all related data
          // projectId is now correctly defined from the awaited params
          const project = await prisma.project.findUnique({
               where: { id: projectId },
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
                    },
                    tasks: {
                         where: {
                              assigneeId: decoded.id
                         },
                         include: {
                              milestone: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              }
                         },
                         orderBy: [
                              { status: 'asc' },
                              { priority: 'desc' },
                              { deadline: 'asc' }
                         ]
                    },
                    milestones: {
                         include: {
                              _count: {
                                   select: {
                                        tasks: true
                                   }
                              },
                              tasks: {
                                   where: {
                                        assigneeId: decoded.id
                                   },
                                   select: {
                                        id: true,
                                        status: true
                                   }
                              }
                         },
                         orderBy: {
                              deadline: 'asc'
                         }
                    },
                    documents: {
                         where: {
                              OR: [
                                   { isPublic: true },
                                   { uploadedById: decoded.id }
                              ]
                         },
                         orderBy: {
                              uploadedAt: 'desc'
                         },
                         take: 10
                    },
                    feedbacks: {
                         orderBy: {
                              createdAt: 'desc'
                         },
                         take: 5
                    }
               }
          });

          if (!project) {
               return NextResponse.json(
                    { error: 'Project not found' },
                    { status: 404 }
               );
          }

          // Verify developer has access to this project
          const hasAccess = project.tasks.length > 0 ||
               project.milestones.some(m => m.tasks.length > 0);

          if (!hasAccess && decoded.role !== 'CEO' && decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json(
                    { error: 'Access denied to this project' },
                    { status: 403 }
               );
          }

          // Calculate task statistics for this developer
          const taskStats = {
               total: project.tasks.length,
               notStarted: project.tasks.filter(t => t.status === 'NOT_STARTED').length,
               inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
               review: project.tasks.filter(t => t.status === 'REVIEW').length,
               completed: project.tasks.filter(t => t.status === 'COMPLETED').length,
               blocked: project.tasks.filter(t => t.status === 'BLOCKED').length
          };

          // Calculate milestone progress for this developer
          const milestonesWithProgress = project.milestones.map(milestone => {
               const totalTasks = milestone.tasks.length;
               const completedTasks = milestone.tasks.filter(t => t.status === 'COMPLETED').length;

               return {
                    ...milestone,
                    taskProgress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
                    totalTasks,
                    completedTasks
               };
          });

          // Format the response
          const formattedProject = {
               ...project,
               taskStats,
               milestones: milestonesWithProgress,
               progress: project.progress,
               budgetUtilization: project.budget ? (project.cost / project.budget) * 100 : 0
          };

          return NextResponse.json({ project: formattedProject });

     } catch (error) {
          console.error('Project details fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch project details' },
               { status: 500 }
          );
     }
}