

import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
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

          // Parse query parameters
          const { searchParams } = new URL(request.url);
          const projectId = searchParams.get('projectId');
          const developerId = searchParams.get('developerId');
          const priority = searchParams.get('priority');
          const days = searchParams.get('days'); // For filtering by submission date

          // Build filter for tasks pending review
          let whereClause = {
               status: 'REVIEW',
               project: {
                    teamLeadId: decoded.id
               }
          };

          if (projectId) {
               whereClause.projectId = projectId;
          }

          if (developerId) {
               whereClause.assigneeId = developerId;
          }

          if (priority && priority !== 'all') {
               whereClause.priority = priority;
          }

          if (days) {
               const dateThreshold = new Date();
               dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
               whereClause.updatedAt = {
                    gte: dateThreshold
               };
          }

          // Fetch tasks with all related data
          const tasks = await prisma.task.findMany({
               where: whereClause,
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true,
                              clientName: true,
                              manager: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              }
                         }
                    },
                    milestone: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true,
                              jobTitle: true
                         }
                    },
                    attachments: {
                         orderBy: {
                              uploadedAt: 'desc'
                         }
                    },
                    comments: {
                         orderBy: {
                              createdAt: 'desc'
                         },
                         take: 5,
                         include: {
                              author: {
                                   select: {
                                        id: true,
                                        name: true,
                                        role: true
                                   }
                              }
                         }
                    },
                    _count: {
                         select: {
                              comments: true,
                              attachments: true
                         }
                    }
               },
               orderBy: [
                    { priority: 'desc' },
                    { updatedAt: 'asc' } // Oldest first
               ]
          });

          // Calculate additional metrics
          const now = new Date();
          const tasksWithMeta = tasks.map(task => ({
               ...task,
               waitingTime: Math.floor((now - new Date(task.updatedAt)) / (1000 * 60 * 60)), // hours
               isUrgent: task.priority === 'URGENT' || task.priority === 'HIGH',
               reviewNotes: task.reviewNotes || ''
          }));

          // Get filter options
          const projects = await prisma.project.findMany({
               where: { teamLeadId: decoded.id },
               select: { id: true, name: true }
          });

          const developers = await prisma.user.findMany({
               where: {
                    role: 'DEVELOPER',
                    assignedTasks: {
                         some: {
                              project: {
                                   teamLeadId: decoded.id
                              }
                         }
                    }
               },
               select: {
                    id: true,
                    name: true,
                    avatar: true
               }
          });

          // Calculate statistics
          const stats = {
               total: tasks.length,
               urgent: tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length,
               waitingMoreThan24h: tasks.filter(t =>
                    (now - new Date(t.updatedAt)) > 24 * 60 * 60 * 1000
               ).length,
               byProject: projects.map(p => ({
                    ...p,
                    count: tasks.filter(t => t.projectId === p.id).length
               })),
               byDeveloper: developers.map(d => ({
                    ...d,
                    count: tasks.filter(t => t.assigneeId === d.id).length
               }))
          };

          return NextResponse.json({
               tasks: tasksWithMeta,
               filters: {
                    projects,
                    developers
               },
               stats
          });

     } catch (error) {
          console.error('Approvals fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch approvals' },
               { status: 500 }
          );
     }
}