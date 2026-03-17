// app/api/project-manager/reports/custom/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';
export async function POST(request) {
     try {
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

          const config = await request.json();
          const { projectIds, dateRange, includeMetrics, format } = config;

          // Build where clause based on config
          let whereClause = {
               managerId: decoded.id
          };

          if (projectIds && projectIds.length > 0) {
               whereClause.id = { in: projectIds };
          }

          if (dateRange) {
               const now = new Date();
               let startDate;
               switch (dateRange) {
                    case '7days':
                         startDate = new Date(now.setDate(now.getDate() - 7));
                         break;
                    case '30days':
                         startDate = new Date(now.setDate(now.getDate() - 30));
                         break;
                    case '90days':
                         startDate = new Date(now.setDate(now.getDate() - 90));
                         break;
                    case '12months':
                         startDate = new Date(now.setMonth(now.getMonth() - 12));
                         break;
                    default:
                         startDate = null;
               }
               if (startDate) {
                    whereClause.updatedAt = { gte: startDate };
               }
          }

          // Fetch projects with full data
          const projects = await prisma.project.findMany({
               where: whereClause,
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
                              email: true
                         }
                    },
                    milestones: {
                         include: {
                              tasks: true
                         }
                    },
                    tasks: {
                         include: {
                              assignee: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              },
                              comments: {
                                   include: {
                                        author: {
                                             select: {
                                                  id: true,
                                                  name: true
                                             }
                                        }
                                   }
                              }
                         }
                    },
                    feedbacks: {
                         include: {
                              createdBy: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              }
                         }
                    },
                    documents: true
               }
          });

          // Generate custom report data based on includeMetrics
          const reportData = {
               generatedAt: new Date().toISOString(),
               generatedBy: decoded.name,
               dateRange,
               format,
               summary: {
                    totalProjects: projects.length,
                    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
                    totalCost: projects.reduce((sum, p) => sum + (p.cost || 0), 0),
                    avgProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length || 0,
                    atRiskCount: projects.filter(p => p.riskLevel === 'HIGH' || p.isDelayed).length
               },
               projects: projects.map(p => {
                    const projectData = {
                         id: p.id,
                         name: p.name,
                         clientName: p.clientName,
                         status: p.status,
                         progress: p.progress,
                         riskLevel: p.riskLevel
                    };

                    if (includeMetrics?.includes('financial')) {
                         projectData.budget = p.budget;
                         projectData.cost = p.cost;
                         projectData.profit = (p.budget || 0) - (p.cost || 0);
                    }

                    if (includeMetrics?.includes('tasks')) {
                         projectData.tasks = {
                              total: p.tasks.length,
                              completed: p.tasks.filter(t => t.status === 'COMPLETED').length,
                              inProgress: p.tasks.filter(t => t.status === 'IN_PROGRESS').length,
                              overdue: p.tasks.filter(t =>
                                   t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < new Date()
                              ).length
                         };
                    }

                    if (includeMetrics?.includes('milestones')) {
                         projectData.milestones = {
                              total: p.milestones.length,
                              completed: p.milestones.filter(m => m.status === 'COMPLETED').length
                         };
                    }

                    if (includeMetrics?.includes('feedback')) {
                         projectData.feedback = {
                              total: p.feedbacks.length,
                              approved: p.feedbacks.filter(f => f.isApproved).length
                         };
                    }

                    return projectData;
               })
          };

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'GENERATE_CUSTOM_REPORT',
                    entityType: 'report',
                    details: {
                         dateRange,
                         projectCount: projects.length,
                         includeMetrics
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json(reportData);

     } catch (error) {
          console.error('Custom report error:', error);
          return NextResponse.json(
               { error: 'Failed to generate custom report' },
               { status: 500 }
          );
     }
}