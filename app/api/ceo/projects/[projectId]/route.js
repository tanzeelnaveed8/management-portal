
// app/api/ceo/projects/[projectId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { projectId } = await params;

          if (!projectId || typeof projectId !== 'string') {
               return NextResponse.json(
                    { error: 'Invalid project ID format' },
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
          if (!decoded || decoded.role !== 'CEO') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // First, check if project exists with minimal query
          const projectExists = await prisma.project.findUnique({
               where: { id: projectId },
               select: { id: true }
          });

          if (!projectExists) {
               return NextResponse.json(
                    { error: 'Project not found' },
                    { status: 404 }
               );
          }

          // Fetch project with all related data - with error handling for each relation
          const project = await prisma.project.findUnique({
               where: { id: projectId },
               include: {
                    manager: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true,
                              jobTitle: true
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
                    milestones: {
                         include: {
                              tasks: {
                                   select: {
                                        id: true,
                                        status: true,
                                        priority: true
                                   }
                              },
                              _count: {
                                   select: {
                                        tasks: true
                                   }
                              }
                         },
                         orderBy: {
                              deadline: 'asc'
                         }
                    },
                    tasks: {
                         include: {
                              assignee: {
                                   select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                        jobTitle: true
                                   }
                              },
                              milestone: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              }
                         },
                         orderBy: [
                              { priority: 'desc' },
                              { deadline: 'asc' }
                         ]
                    },
                    feedbacks: {
                         include: {
                              createdBy: {
                                   select: {
                                        id: true,
                                        name: true,
                                        role: true
                                   }
                              }
                         },
                         orderBy: {
                              createdAt: 'desc'
                         }
                    },
                    documents: {
                         orderBy: {
                              uploadedAt: 'desc'
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

          // Safely calculate workload distribution with null checks
          const workloadByAssignee = {};

          if (project.tasks && Array.isArray(project.tasks)) {
               project.tasks.forEach(task => {
                    if (task?.assignee) {
                         const assigneeId = task.assignee.id;
                         if (!workloadByAssignee[assigneeId]) {
                              workloadByAssignee[assigneeId] = {
                                   id: assigneeId,
                                   name: task.assignee.name || 'Unknown',
                                   role: task.assignee.jobTitle || 'Developer',
                                   avatar: task.assignee.avatar,
                                   totalTasks: 0,
                                   completedTasks: 0,
                                   inProgressTasks: 0,
                                   reviewTasks: 0,
                                   blockedTasks: 0,
                                   highPriorityTasks: 0
                              };
                         }

                         workloadByAssignee[assigneeId].totalTasks++;

                         if (task.status === 'COMPLETED') workloadByAssignee[assigneeId].completedTasks++;
                         if (task.status === 'IN_PROGRESS') workloadByAssignee[assigneeId].inProgressTasks++;
                         if (task.status === 'REVIEW') workloadByAssignee[assigneeId].reviewTasks++;
                         if (task.status === 'BLOCKED') workloadByAssignee[assigneeId].blockedTasks++;

                         if (task.priority === 'HIGH' || task.priority === 'URGENT') {
                              workloadByAssignee[assigneeId].highPriorityTasks++;
                         }
                    }
               });
          }

          // Safely calculate milestone progress
          const milestoneProgress = (project.milestones || []).map(milestone => {
               const totalTasks = milestone?._count?.tasks || 0;
               const completedTasks = (milestone?.tasks || []).filter(t => t?.status === 'COMPLETED').length;

               return {
                    ...milestone,
                    taskProgress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
                    completedTasks,
                    totalTasks
               };
          });

          // Calculate financial metrics with null checks
          const budget = project.budget || 0;
          const cost = project.cost || 0;

          const financialMetrics = {
               budget,
               cost,
               variance: budget - cost,
               utilization: budget > 0 ? (cost / budget) * 100 : 0
          };

          // Calculate timeline metrics
          const now = new Date();
          const deadline = project.deadline ? new Date(project.deadline) : null;

          const timelineMetrics = {
               startDate: project.startDate,
               deadline: project.deadline,
               daysRemaining: deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : null,
               isOverdue: deadline && deadline < now && project.status !== 'COMPLETED',
               delayDays: project.isDelayed && deadline
                    ? Math.ceil((now - deadline) / (1000 * 60 * 60 * 24))
                    : 0
          };

          // Get client approval status with safe array access
          const feedbacks = project.feedbacks || [];
          const latestFeedback = feedbacks[0];

          const clientStatus = {
               hasFeedback: feedbacks.length > 0,
               latestApproval: latestFeedback?.isApproved || false,
               latestStatus: latestFeedback?.status || 'NO_FEEDBACK',
               feedbackCount: feedbacks.length,
               approvedCount: feedbacks.filter(f => f?.isApproved).length
          };

          const projectWithMetrics = {
               ...project,
               workload: Object.values(workloadByAssignee),
               milestoneProgress,
               financialMetrics,
               timelineMetrics,
               clientStatus
          };

          return NextResponse.json({ project: projectWithMetrics });

     } catch (error) {
          console.error('CEO project details error:', error);

          // Send more detailed error message in development
          const errorMessage = process.env.NODE_ENV === 'development'
               ? error.message
               : 'Failed to fetch project details';

          return NextResponse.json(
               { error: errorMessage },
               { status: 500 }
          );
     }
}