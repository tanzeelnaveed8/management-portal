

// app/api/ceo/managers/[managerId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { managerId } = await params;   // ✅ await the Promise
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

          // Fetch manager with all their projects and details
          const manager = await prisma.user.findUnique({
               where: { id: managerId },
               include: {
                    projectsManaged: {
                         include: {
                              teamLead: {
                                   select: {
                                        id: true,
                                        name: true,
                                        email: true
                                   }
                              },
                              tasks: {
                                   include: {
                                        assignee: {
                                             select: {
                                                  id: true,
                                                  name: true,
                                                  jobTitle: true
                                             }
                                        }
                                   }
                              },
                              feedbacks: {
                                   orderBy: {
                                        createdAt: 'desc'
                                   }
                              },
                              milestones: true,
                              _count: {
                                   select: {
                                        tasks: true,
                                        milestones: true,
                                        feedbacks: true
                                   }
                              }
                         },
                         orderBy: {
                              createdAt: 'desc'
                         }
                    }
               }
          });

          if (!manager) {
               return NextResponse.json(
                    { error: 'Manager not found' },
                    { status: 404 }
               );
          }

          // Calculate detailed metrics
          const projects = manager.projectsManaged || [];
          const now = new Date();

          // Project statistics
          const projectStats = {
               total: projects.length,
               active: projects.filter(p => ['ACTIVE', 'IN_DEVELOPMENT'].includes(p.status)).length,
               completed: projects.filter(p => p.status === 'COMPLETED').length,
               upcoming: projects.filter(p => p.status === 'UPCOMING').length,
               delayed: projects.filter(p => p.isDelayed).length,
               highRisk: projects.filter(p => p.riskLevel === 'HIGH').length
          };

          // Financial metrics
          const financialMetrics = {
               totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
               totalCost: projects.reduce((sum, p) => sum + (p.cost || 0), 0),
               averageProjectValue: projects.length > 0
                    ? Math.round(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / projects.length)
                    : 0
          };

          // Performance metrics
          let totalTasks = 0;
          let completedTasks = 0;
          let overdueTasks = 0;
          let onTimeTasks = 0;

          projects.forEach(project => {
               project.tasks?.forEach(task => {
                    totalTasks++;
                    if (task.status === 'COMPLETED') {
                         completedTasks++;
                         if (task.deadline && task.completedAt && new Date(task.completedAt) <= new Date(task.deadline)) {
                              onTimeTasks++;
                         } else if (!task.deadline) {
                              onTimeTasks++;
                         }
                    } else if (task.deadline && new Date(task.deadline) < now) {
                         overdueTasks++;
                    }
               });
          });

          const performanceMetrics = {
               totalTasks,
               completedTasks,
               overdueTasks,
               completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
               onTimeRate: completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 100
          };

          // Timeline metrics
          const upcomingDeadlines = projects
               .filter(p => p.deadline && new Date(p.deadline) > now)
               .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
               .slice(0, 5)
               .map(p => ({
                    projectId: p.id,
                    projectName: p.name,
                    deadline: p.deadline,
                    daysRemaining: Math.ceil((new Date(p.deadline) - now) / (1000 * 60 * 60 * 24))
               }));

          const managerWithDetails = {
               ...manager,
               projectStats,
               financialMetrics,
               performanceMetrics,
               upcomingDeadlines,
               recentProjects: projects.slice(0, 5)
          };

          return NextResponse.json({ manager: managerWithDetails });

     } catch (error) {
          console.error('CEO manager details error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch manager details' },
               { status: 500 }
          );
     }
}