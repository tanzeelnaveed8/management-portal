// app/api/ceo/reports/route.js
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
          if (!decoded || decoded.role !== 'CEO') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Parse query parameters for date range
          const { searchParams } = new URL(request.url);
          const range = searchParams.get('range') || 'quarter';
          const fromDate = searchParams.get('from');
          const toDate = searchParams.get('to');

          // Calculate date range
          const now = new Date();
          let startDate, endDate = now;

          if (fromDate && toDate) {
               startDate = new Date(fromDate);
               endDate = new Date(toDate);
          } else {
               switch (range) {
                    case 'week':
                         startDate = new Date(now.setDate(now.getDate() - 7));
                         break;
                    case 'month':
                         startDate = new Date(now.setMonth(now.getMonth() - 1));
                         break;
                    case 'quarter':
                         startDate = new Date(now.setMonth(now.getMonth() - 3));
                         break;
                    case 'year':
                         startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                         break;
                    default:
                         startDate = new Date(now.setMonth(now.getMonth() - 3));
               }
          }

          // Fetch all projects with related data
          const projects = await prisma.project.findMany({
               where: {
                    createdAt: {
                         gte: startDate,
                         lte: endDate
                    }
               },
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
                              name: true
                         }
                    },
                    tasks: {
                         select: {
                              id: true,
                              status: true,
                              estimatedHours: true,
                              actualHours: true,
                              createdAt: true,
                              completedAt: true
                         }
                    },
                    milestones: {
                         select: {
                              id: true,
                              status: true,
                              deadline: true,
                              isDelayed: true
                         }
                    },
                    feedbacks: {
                         select: {
                              id: true,
                              isApproved: true,
                              status: true,
                              createdAt: true
                         }
                    }
               }
          });

          // Calculate core metrics
          const totalProjects = projects.length;
          const activeProjects = projects.filter(p =>
               ['ACTIVE', 'IN_DEVELOPMENT'].includes(p.status)
          ).length;
          const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
          const upcomingProjects = projects.filter(p => p.status === 'UPCOMING').length;
          const inProgressProjects = projects.filter(p => p.status === 'IN_DEVELOPMENT').length;

          // Calculate revenue metrics
          const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
          const totalCost = projects.reduce((sum, p) => sum + (p.cost || 0), 0);
          const revenueGrowth = totalBudget > 0 ? ((totalBudget - totalCost) / totalBudget) * 100 : 0;

          // Calculate portfolio health
          const projectsWithGoodHealth = projects.filter(p =>
               p.riskLevel !== 'HIGH' && !p.isDelayed && p.progress > 50
          ).length;
          const portfolioHealth = totalProjects > 0
               ? (projectsWithGoodHealth / totalProjects) * 100
               : 0;

          // Calculate resource metrics
          const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
          const completedTasks = projects.reduce((sum, p) =>
               sum + p.tasks.filter(t => t.status === 'COMPLETED').length, 0
               , 0);

          const totalEstimatedHours = projects.reduce((sum, p) =>
               sum + p.tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0), 0
               , 0);
          const totalActualHours = projects.reduce((sum, p) =>
               sum + p.tasks.reduce((s, t) => s + (t.actualHours || 0), 0), 0
               , 0);

          const resourceLoad = totalEstimatedHours > 0
               ? (totalActualHours / totalEstimatedHours) * 100
               : 0;

          // Calculate risk metrics
          const highRiskProjects = projects.filter(p => p.riskLevel === 'HIGH').length;
          const delayedMilestones = projects.reduce((sum, p) =>
               sum + p.milestones.filter(m => m.isDelayed).length, 0
               , 0);

          const operationalRisk = highRiskProjects > 0 || delayedMilestones > 0
               ? 'High'
               : projects.filter(p => p.riskLevel === 'MEDIUM').length > 0
                    ? 'Medium'
                    : 'Low';

          // Calculate cycle efficiency
          const tasksWithCompletion = projects.flatMap(p =>
               p.tasks.filter(t => t.completedAt && t.createdAt)
          );

          const avgCycleTime = tasksWithCompletion.length > 0
               ? tasksWithCompletion.reduce((sum, t) => {
                    const created = new Date(t.createdAt);
                    const completed = new Date(t.completedAt);
                    const days = (completed - created) / (1000 * 60 * 60 * 24);
                    return sum + days;
               }, 0) / tasksWithCompletion.length
               : 0;

          // Generate weekly velocity data
          const weeks = 10;
          const weeklyData = [];
          for (let i = 0; i < weeks; i++) {
               const weekStart = new Date(endDate);
               weekStart.setDate(weekStart.getDate() - (weeks - i) * 7);
               const weekEnd = new Date(weekStart);
               weekEnd.setDate(weekEnd.getDate() + 7);

               const weekTasks = projects.flatMap(p =>
                    p.tasks.filter(t =>
                         t.completedAt &&
                         new Date(t.completedAt) >= weekStart &&
                         new Date(t.completedAt) <= weekEnd
                    )
               );

               weeklyData.push({
                    week: `W${i + 1}`,
                    completed: weekTasks.length,
                    estimated: weekTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
                    actual: weekTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
               });
          }

          // Get manager performance data
          const managers = await prisma.user.findMany({
               where: {
                    role: 'PROJECT_MANAGER',
                    projectsManaged: {
                         some: {
                              createdAt: {
                                   gte: startDate,
                                   lte: endDate
                              }
                         }
                    }
               },
               include: {
                    projectsManaged: {
                         where: {
                              createdAt: {
                                   gte: startDate,
                                   lte: endDate
                              }
                         },
                         include: {
                              tasks: {
                                   select: {
                                        status: true,
                                        estimatedHours: true,
                                        actualHours: true
                                   }
                              },
                              milestones: {
                                   select: {
                                        isDelayed: true
                                   }
                              }
                         }
                    }
               }
          });

          const managerPerformance = managers.map(m => {
               const managedProjects = m.projectsManaged || [];
               const projectCount = managedProjects.length;

               const tasksTotal = managedProjects.reduce((sum, p) => sum + p.tasks.length, 0);
               const tasksCompleted = managedProjects.reduce((sum, p) =>
                    sum + p.tasks.filter(t => t.status === 'COMPLETED').length, 0
                    , 0);

               const delayedCount = managedProjects.reduce((sum, p) =>
                    sum + p.milestones.filter(m => m.isDelayed).length, 0
                    , 0);

               const efficiency = tasksTotal > 0
                    ? (tasksCompleted / tasksTotal) * 100
                    : 0;

               return {
                    name: m.name,
                    role: 'Project Manager',
                    projects: projectCount,
                    tasks: `${tasksCompleted}/${tasksTotal}`,
                    efficiency: Math.round(efficiency * 10) / 10,
                    status: efficiency >= 80 ? 'Optimal' : efficiency >= 60 ? 'Watch' : 'Critical'
               };
          });

          // Get status distribution
          const statusDistribution = {
               completed: completedProjects,
               inDevelopment: inProgressProjects,
               clientReview: projects.filter(p => p.status === 'CLIENT_REVIEW').length,
               archived: projects.filter(p => p.status === 'ARCHIVED').length,
               upcoming: upcomingProjects
          };

          // Get risk items
          const riskItems = [];

          // SLA breach risks
          projects.forEach(p => {
               const stalledTasks = p.tasks.filter(t =>
                    t.status === 'IN_PROGRESS' &&
                    t.estimatedHours &&
                    (t.actualHours || 0) > t.estimatedHours * 1.5
               );

               if (stalledTasks.length > 0) {
                    riskItems.push({
                         title: 'SLA Breach Impending',
                         project: p.name,
                         reason: `${stalledTasks.length} tasks exceeded estimate by 50%`,
                         severity: stalledTasks.length > 2 ? 'CRITICAL' : 'HIGH'
                    });
               }

               const reviewStalled = p.tasks.filter(t =>
                    t.status === 'REVIEW' &&
                    t.completedAt &&
                    (new Date() - new Date(t.completedAt)) / (1000 * 60 * 60) > 48
               );

               if (reviewStalled.length > 0) {
                    riskItems.push({
                         title: 'Review Stage Exceeded',
                         project: p.name,
                         reason: `${reviewStalled.length} tasks in review > 48hrs`,
                         severity: 'MEDIUM'
                    });
               }
          });

          // Resource gaps
          const unassignedTasks = projects.reduce((sum, p) =>
               sum + p.tasks.filter(t => !t.assigneeId && t.status === 'NOT_STARTED').length, 0
               , 0);

          if (unassignedTasks > 0) {
               riskItems.push({
                    title: 'Resource Gap',
                    project: 'Multiple Projects',
                    reason: `${unassignedTasks} unassigned tasks pending`,
                    severity: unassignedTasks > 5 ? 'CRITICAL' : 'MEDIUM'
               });
          }

          // Get activity feed
          const activities = [];

          // Revenue milestones
          const highValueProjects = projects.filter(p => (p.budget || 0) > 100000);
          highValueProjects.slice(0, 2).forEach(p => {
               activities.push({
                    title: 'Revenue Milestone',
                    meta: `${p.name} +$${((p.budget || 0) / 1000).toFixed(0)}k`,
                    time: formatTimeAgo(p.updatedAt),
                    icon: 'revenue'
               });
          });

          // New clients
          const newClients = projects.filter(p =>
               new Date(p.createdAt) >= new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
          );
          newClients.slice(0, 2).forEach(p => {
               activities.push({
                    title: 'New Project Launched',
                    meta: `${p.name} - ${p.clientName}`,
                    time: formatTimeAgo(p.createdAt),
                    icon: 'project'
               });
          });

          return NextResponse.json({
               metrics: {
                    portfolioHealth: Math.round(portfolioHealth * 10) / 10,
                    resourceLoad: Math.round(resourceLoad * 10) / 10,
                    operationalRisk,
                    cycleEfficiency: Math.round(avgCycleTime * 10) / 10 + 'd',
                    portfolioHealthTrend: '+2.4%',
                    resourceLoadTrend: '-4.1%',
                    operationalRiskTrend: '+12%',
                    cycleEfficiencyTrend: '-1.5d'
               },
               projectStats: {
                    total: totalProjects,
                    active: activeProjects,
                    completed: completedProjects,
                    upcoming: upcomingProjects,
                    inProgress: inProgressProjects
               },
               revenue: {
                    total: totalBudget,
                    growth: revenueGrowth,
                    byProject: projects.map(p => ({
                         name: p.name,
                         value: p.budget || 0
                    })).filter(p => p.value > 0)
               },
               velocity: weeklyData,
               managerPerformance: managerPerformance.slice(0, 5),
               statusDistribution,
               risks: riskItems.slice(0, 5),
               activities: activities.slice(0, 5)
          });

     } catch (error) {
          console.error('CEO reports error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch reports data' },
               { status: 500 }
          );
     }
}

function formatTimeAgo(date) {
     const now = new Date();
     const diffMs = now - new Date(date);
     const diffMins = Math.floor(diffMs / (1000 * 60));
     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

     if (diffMins < 60) return `${diffMins}m ago`;
     if (diffHours < 24) return `${diffHours}h ago`;
     if (diffDays === 1) return 'Yesterday';
     if (diffDays < 7) return `${diffDays}d ago`;
     return new Date(date).toLocaleDateString();
}