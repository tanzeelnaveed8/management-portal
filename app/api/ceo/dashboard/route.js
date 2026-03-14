

// // app/api/ceo/dashboard/route.js
// import { NextResponse } from 'next/server';
// import { verifyAccessToken } from '../../../../lib/auth/jwt';
// import prisma from '../../../../lib/prisma';

// export async function GET(request) {
//      try {
//           const token = request.cookies.get('accessToken')?.value;

//           if (!token) {
//                return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//           }

//           const decoded = verifyAccessToken(token);
//           if (!decoded || decoded.role !== 'CEO') {
//                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//           }

//           const now = new Date();

//           // ========== 1. FETCH ALL PROJECTS WITH DETAILS ==========
//           const projects = await prisma.project.findMany({
//                include: {
//                     manager: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true,
//                               avatar: true
//                          }
//                     },
//                     teamLead: {
//                          select: {
//                               name: true
//                          }
//                     },
//                     tasks: {
//                          select: {
//                               id: true,
//                               status: true,
//                               estimatedHours: true,
//                               actualHours: true
//                          }
//                     },
//                     feedbacks: {
//                          select: {
//                               id: true,
//                               isApproved: true,
//                               status: true
//                          }
//                     },
//                     _count: {
//                          select: {
//                               tasks: true,
//                               milestones: true,
//                               documents: true,
//                               feedbacks: true
//                          }
//                     }
//                },
//                orderBy: {
//                     createdAt: 'desc'
//                }
//           });

//           // ========== 2. FETCH ALL PROJECT MANAGERS ==========
//           const managers = await prisma.user.findMany({
//                where: {
//                     role: 'PROJECT_MANAGER',
//                     status: 'ACTIVE'
//                },
//                include: {
//                     projectsManaged: {
//                          include: {
//                               tasks: {
//                                    select: {
//                                         status: true
//                                    }
//                               }
//                          }
//                     }
//                }
//           });

//           // ========== 3. FETCH ALL DEVELOPERS FOR WORKLOAD ==========
//           const developers = await prisma.user.findMany({
//                where: {
//                     role: 'DEVELOPER',
//                     status: 'ACTIVE'
//                },
//                include: {
//                     assignedTasks: {
//                          where: {
//                               status: { in: ['IN_PROGRESS', 'REVIEW', 'NOT_STARTED'] }
//                          },
//                          select: {
//                               estimatedHours: true
//                          }
//                     }
//                }
//           });

//           // ========== 4. CALCULATE PROJECT STATISTICS ==========
//           const projectStats = {
//                total: projects.length,
//                active: projects.filter(p => ['ACTIVE', 'IN_DEVELOPMENT'].includes(p.status)).length,
//                inProgress: projects.filter(p => p.status === 'IN_DEVELOPMENT').length,
//                completed: projects.filter(p => p.status === 'COMPLETED').length,
//                upcoming: projects.filter(p => p.status === 'UPCOMING').length,
//                onHold: projects.filter(p => p.status === 'ON_HOLD').length,
//                clientReview: projects.filter(p => p.status === 'CLIENT_REVIEW').length
//           };

//           // ========== 5. CALCULATE REVENUE METRICS ==========
//           const revenue = {
//                total: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
//                active: projects
//                     .filter(p => ['ACTIVE', 'IN_DEVELOPMENT'].includes(p.status))
//                     .reduce((sum, p) => sum + (p.budget || 0), 0),
//                completed: projects
//                     .filter(p => p.status === 'COMPLETED')
//                     .reduce((sum, p) => sum + (p.budget || 0), 0),
//                avgProjectValue: projects.length > 0
//                     ? Math.round(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / projects.length)
//                     : 0
//           };

//           // ========== 6. CALCULATE AVERAGE PROGRESS ==========
//           const projectsWithProgress = projects.map(p => {
//                const totalTasks = p.tasks.length;
//                const completedTasks = p.tasks.filter(t => t.status === 'COMPLETED').length;
//                const progress = totalTasks > 0
//                     ? Math.round((completedTasks / totalTasks) * 100)
//                     : p.progress || 0;
//                return progress;
//           });

//           const avgProgress = projectsWithProgress.length > 0
//                ? Math.round(projectsWithProgress.reduce((a, b) => a + b, 0) / projectsWithProgress.length)
//                : 0;

//           // ========== 7. CALCULATE CLIENT APPROVALS ==========
//           const allFeedbacks = projects.flatMap(p => p.feedbacks);
//           const clientApprovals = {
//                approved: allFeedbacks.filter(f => f.isApproved).length,
//                pending: allFeedbacks.filter(f => f.status === 'PENDING').length,
//                rejected: allFeedbacks.filter(f => f.status === 'REJECTED').length,
//                total: allFeedbacks.length
//           };

//           // ========== 8. FORMAT PROJECTS FOR DISPLAY ==========
//           const formattedProjects = projects.map(p => {
//                const totalTasks = p.tasks.length;
//                const completedTasks = p.tasks.filter(t => t.status === 'COMPLETED').length;
//                const progress = totalTasks > 0
//                     ? Math.round((completedTasks / totalTasks) * 100)
//                     : p.progress || 0;

//                // Determine risk level based on multiple factors
//                const isDelayed = p.isDelayed;
//                const hasOverdueTasks = p.tasks.some(t =>
//                     t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < now
//                );
//                const lowProgress = progress < 30 && p.status === 'IN_DEVELOPMENT';
//                const highBudgetBurn = p.budget && p.cost && (p.cost / p.budget) > 0.85;

//                let riskLevel = 'Low';
//                if (isDelayed || hasOverdueTasks) riskLevel = 'High';
//                else if (lowProgress || highBudgetBurn) riskLevel = 'Medium';

//                return {
//                     id: p.id,
//                     name: p.name,
//                     manager: p.manager,
//                     progress,
//                     status: p.status,
//                     revenue: p.budget ? `$${(p.budget / 1000).toFixed(0)}k` : 'N/A',
//                     risk: riskLevel,
//                     isDelayed: p.isDelayed,
//                     delayReason: p.delayReason,
//                     deadline: p.deadline,
//                     taskStats: {
//                          total: totalTasks,
//                          completed: completedTasks
//                     }
//                };
//           });

//           // ========== 9. CALCULATE MANAGER PERFORMANCE ==========
//           const managerPerformance = managers.map(m => {
//                const managedProjects = m.projectsManaged || [];

//                // Calculate performance score based on:
//                // 1. Project completion rate
//                // 2. On-time delivery
//                // 3. Client approval rate

//                let totalTasks = 0;
//                let completedTasks = 0;
//                let delayedProjects = 0;
//                let approvedFeedbacks = 0;
//                let totalFeedbacks = 0;

//                managedProjects.forEach(p => {
//                     p.tasks?.forEach(t => {
//                          totalTasks++;
//                          if (t.status === 'COMPLETED') completedTasks++;
//                     });

//                     if (p.isDelayed) delayedProjects++;

//                     p.feedbacks?.forEach(f => {
//                          totalFeedbacks++;
//                          if (f.isApproved) approvedFeedbacks++;
//                     });
//                });

//                const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
//                const onTimeRate = managedProjects.length > 0
//                     ? ((managedProjects.length - delayedProjects) / managedProjects.length) * 100
//                     : 100;
//                const approvalRate = totalFeedbacks > 0 ? (approvedFeedbacks / totalFeedbacks) * 100 : 100;

//                // Weighted score: 40% completion, 30% on-time, 30% approval
//                const performanceScore = Math.round(
//                     (completionRate * 0.4) + (onTimeRate * 0.3) + (approvalRate * 0.3)
//                );

//                // Calculate workload (active projects * average tasks)
//                const workload = Math.min(100, Math.round((managedProjects.length / 5) * 100));

//                return {
//                     name: m.name,
//                     email: m.email,
//                     avatar: m.avatar,
//                     performance: performanceScore,
//                     workload,
//                     activeProjects: managedProjects.length,
//                     projects: managedProjects.map(p => p.name)
//                };
//           }).sort((a, b) => b.performance - a.performance);

//           // ========== 10. CALCULATE DEVELOPER WORKLOAD ==========
//           const totalCapacity = developers.length * 40; // 40 hours per week per developer
//           const assignedHours = developers.reduce((sum, dev) => {
//                const devHours = dev.assignedTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
//                return sum + devHours;
//           }, 0);

//           // Calculate distribution (simplified - in real app, you'd have proper categorization)
//           const distribution = {
//                development: Math.min(100, Math.round((assignedHours * 0.7) / totalCapacity * 100)),
//                design: Math.min(100, Math.round((assignedHours * 0.2) / totalCapacity * 100)),
//                overhead: Math.min(100, Math.round((assignedHours * 0.1) / totalCapacity * 100))
//           };

//           // ========== 11. GENERATE CRITICAL ALERTS ==========
//           const alerts = [];

//           // Delayed projects
//           const delayedProjects = projects.filter(p => p.isDelayed);
//           delayedProjects.forEach(p => {
//                alerts.push({
//                     type: 'delay',
//                     title: `${p.name} Delayed`,
//                     message: p.delayReason || 'Project is behind schedule',
//                     projectId: p.id,
//                     severity: 'high',
//                     actionable: true,
//                     actionLabel: 'Review Project',
//                     actionLink: `/ceo/projects/${p.id}`
//                });
//           });

//           // Budget threshold alerts
//           const budgetWarnings = projects.filter(p =>
//                p.budget && p.cost && (p.cost / p.budget) > 0.85
//           );
//           budgetWarnings.forEach(p => {
//                alerts.push({
//                     type: 'budget',
//                     title: `${p.name} Budget Alert`,
//                     message: `Project has reached ${Math.round((p.cost / p.budget) * 100)}% of allocated budget`,
//                     projectId: p.id,
//                     severity: 'medium',
//                     actionable: true,
//                     actionLabel: 'View Budget',
//                     actionLink: `/ceo/projects/${p.id}/financials`
//                });
//           });

//           // Low progress alerts
//           const lowProgressProjects = projects.filter(p =>
//                p.status === 'IN_DEVELOPMENT' &&
//                p.progress < 30 &&
//                p.startDate &&
//                (new Date() - new Date(p.startDate)) / (1000 * 60 * 60 * 24) > 30
//           );
//           lowProgressProjects.forEach(p => {
//                alerts.push({
//                     type: 'progress',
//                     title: `${p.name} Progress Alert`,
//                     message: 'Project has low progress after 30+ days',
//                     projectId: p.id,
//                     severity: 'medium',
//                     actionable: true
//                });
//           });

//           // ========== 12. GENERATE APPROVAL QUEUE ==========
//           const pendingApprovals = allFeedbacks.filter(f => f.status === 'PENDING');
//           const approvalQueue = [
//                {
//                     label: 'Client Feedback Pending',
//                     count: pendingApprovals.length,
//                     color: 'bg-accent',
//                     link: '/ceo/approvals/feedback'
//                },
//                {
//                     label: 'Awaiting CEO Sign-off',
//                     count: projects.filter(p => p.status === 'CLIENT_REVIEW').length,
//                     color: 'bg-accent-secondary',
//                     link: '/ceo/approvals/signoff'
//                },
//                {
//                     label: 'PM Resource Requests',
//                     count: Math.floor(Math.random() * 10) + 3, // This would come from a resource request model
//                     color: 'bg-orange-500',
//                     link: '/ceo/approvals/resources'
//                }
//           ];

//           return NextResponse.json({
//                stats: {
//                     totalProjects: projectStats.total,
//                     activeProjects: projectStats.active,
//                     inProgressProjects: projectStats.inProgress,
//                     completedProjects: projectStats.completed,
//                     upcomingProjects: projectStats.upcoming,
//                     totalRevenue: revenue.total,
//                     activeRevenue: revenue.active,
//                     avgProgress,
//                     clientApprovals: {
//                          approved: clientApprovals.approved,
//                          total: clientApprovals.total,
//                          rate: clientApprovals.total > 0
//                               ? Math.round((clientApprovals.approved / clientApprovals.total) * 100)
//                               : 0
//                     }
//                },
//                projects: formattedProjects,
//                managers: managerPerformance.slice(0, 5), // Top 5 managers
//                workload: {
//                     totalCapacity,
//                     assignedHours,
//                     percentage: totalCapacity > 0 ? Math.round((assignedHours / totalCapacity) * 100) : 0,
//                     distribution
//                },
//                alerts: alerts.slice(0, 5), // Top 5 most critical alerts
//                approvalQueue
//           });

//      } catch (error) {
//           console.error('CEO Dashboard API Error:', error);
//           return NextResponse.json(
//                { error: error.message },
//                { status: 500 }
//           );
//      }
// }

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

          // Get all projects
          const projects = await prisma.project.findMany({
               include: {
                    manager: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    tasks: {
                         select: {
                              id: true,
                              status: true,
                              assigneeId: true
                         }
                    },
                    feedbacks: {
                         select: {
                              id: true,
                              isApproved: true
                         }
                    }
               }
          });

          // Get all active users for developer count
          const users = await prisma.user.findMany({
               where: {
                    role: 'DEVELOPER',
                    status: 'ACTIVE'
               },
               select: {
                    id: true
               }
          });

          // Calculate project statistics
          const stats = {
               totalProjects: projects.length,
               activeProjects: projects.filter(p => p.status === 'ACTIVE' || p.status === 'IN_DEVELOPMENT').length,
               inProgress: projects.filter(p => p.status === 'IN_DEVELOPMENT').length,
               completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
               upcomingProjects: projects.filter(p => p.status === 'UPCOMING').length,

               // Risk metrics
               highRiskProjects: projects.filter(p => p.riskLevel === 'HIGH').length,
               delayedProjects: projects.filter(p => p.isDelayed).length,

               // Financial metrics
               totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
               totalCost: projects.reduce((sum, p) => sum + (p.cost || 0), 0),
               averageEfficiency: projects.length > 0
                    ? Math.round((projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length))
                    : 0,

               // Resource metrics
               activeDevelopers: users.length,
               totalTasks: projects.reduce((sum, p) => sum + p.tasks.length, 0),
               completedTasks: projects.reduce((sum, p) =>
                    sum + p.tasks.filter(t => t.status === 'COMPLETED').length, 0
                    , 0),

               // Client metrics
               projectsWithApproval: projects.filter(p =>
                    p.feedbacks.some(f => f.isApproved)
               ).length,
               pendingApprovals: projects.filter(p =>
                    p.status === 'CLIENT_REVIEW'
               ).length
          };

          // Calculate portfolio value
          stats.portfolioValue = stats.totalBudget;

          // Get recent risk alerts
          const riskAlerts = projects
               .filter(p => p.riskLevel === 'HIGH' || p.isDelayed)
               .slice(0, 5)
               .map(p => ({
                    id: p.id,
                    projectName: p.name,
                    clientName: p.clientName,
                    riskLevel: p.riskLevel,
                    isDelayed: p.isDelayed,
                    manager: p.manager?.name,
                    progress: p.progress
               }));

          // Get manager performance summary
          const managerPerformance = {};
          projects.forEach(project => {
               if (project.manager) {
                    const managerId = project.manager.id;
                    if (!managerPerformance[managerId]) {
                         managerPerformance[managerId] = {
                              id: managerId,
                              name: project.manager.name,
                              projects: 0,
                              delayed: 0,
                              highRisk: 0,
                              avgProgress: 0
                         };
                    }
                    managerPerformance[managerId].projects++;
                    if (project.isDelayed) managerPerformance[managerId].delayed++;
                    if (project.riskLevel === 'HIGH') managerPerformance[managerId].highRisk++;
                    managerPerformance[managerId].avgProgress += project.progress || 0;
               }
          });

          Object.values(managerPerformance).forEach(m => {
               m.avgProgress = Math.round(m.avgProgress / m.projects);
          });

          return NextResponse.json({
               stats,
               riskAlerts,
               managerPerformance: Object.values(managerPerformance)
          });

     } catch (error) {
          console.error('CEO dashboard error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch dashboard data' },
               { status: 500 }
          );
     }
}