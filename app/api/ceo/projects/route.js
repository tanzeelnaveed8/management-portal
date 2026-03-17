
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

          // Parse query parameters for filtering
          const { searchParams } = new URL(request.url);
          const status = searchParams.get('status');
          const risk = searchParams.get('risk');
          const search = searchParams.get('search');
          const sortBy = searchParams.get('sortBy') || 'progress';
          const sortOrder = searchParams.get('sortOrder') || 'desc';

          // Build filter
          let whereClause = {};

          if (status && status !== 'all') {
               whereClause.status = status;
          }

          if (risk && risk !== 'all') {
               whereClause.riskLevel = risk;
          }

          if (search) {
               whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { clientName: { contains: search, mode: 'insensitive' } },
                    { clientCompany: { contains: search, mode: 'insensitive' } }
               ];
          }

          // Build sort
          let orderBy = {};
          switch (sortBy) {
               case 'progress':
                    orderBy.progress = sortOrder;
                    break;
               case 'budget':
                    orderBy.budget = sortOrder;
                    break;
               case 'deadline':
                    orderBy.deadline = sortOrder;
                    break;
               case 'risk':
                    orderBy.riskLevel = sortOrder;
                    break;
               default:
                    orderBy.createdAt = 'desc';
          }

          // Fetch all projects with comprehensive data
          const projects = await prisma.project.findMany({
               where: whereClause,
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
                         select: {
                              id: true,
                              status: true,
                              deadline: true
                         }
                    },
                    tasks: {
                         select: {
                              id: true,
                              status: true,
                              priority: true,
                              assigneeId: true
                         }
                    },
                    feedbacks: {
                         select: {
                              id: true,
                              isApproved: true,
                              status: true,
                              createdAt: true
                         },
                         orderBy: {
                              createdAt: 'desc'
                         },
                         take: 1
                    },
                    _count: {
                         select: {
                              tasks: true,
                              milestones: true,
                              documents: true,
                              feedbacks: true
                         }
                    }
               },
               orderBy
          });

          // Calculate additional metrics
          const now = new Date();
          const projectsWithMetrics = projects.map(project => {
               const totalTasks = project._count.tasks;
               const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
               const overdueTasks = project.tasks.filter(t =>
                    t.deadline && new Date(t.deadline) < now && t.status !== 'COMPLETED'
               ).length;

               const milestoneProgress = project.milestones.length > 0
                    ? Math.round((project.milestones.filter(m => m.status === 'COMPLETED').length / project.milestones.length) * 100)
                    : 0;

               const budgetUtilization = project.budget ? (project.cost / project.budget) * 100 : 0;

               return {
                    ...project,
                    metrics: {
                         totalTasks,
                         completedTasks,
                         overdueTasks,
                         completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                         milestoneProgress,
                         budgetUtilization: Math.round(budgetUtilization)
                    }
               };
          });

          // Calculate overall statistics
          const stats = {
               totalProjects: projects.length,
               activeProjects: projects.filter(p => p.status === 'ACTIVE' || p.status === 'IN_DEVELOPMENT').length,
               completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
               upcomingProjects: projects.filter(p => p.status === 'UPCOMING').length,
               delayedProjects: projects.filter(p => p.isDelayed).length,
               highRiskProjects: projects.filter(p => p.riskLevel === 'HIGH').length,
               totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
               totalCost: projects.reduce((sum, p) => sum + (p.cost || 0), 0),
               averageProgress: projects.length > 0
                    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
                    : 0,
               totalTasks: projects.reduce((sum, p) => sum + p._count.tasks, 0),
               completedTasks: projects.reduce((sum, p) =>
                    sum + p.tasks.filter(t => t.status === 'COMPLETED').length, 0
                    , 0)
          };

          // Get risk alerts
          const riskAlerts = projects
               .filter(p => p.riskLevel === 'HIGH' || p.isDelayed)
               .map(p => ({
                    id: p.id,
                    projectName: p.name,
                    clientName: p.clientName,
                    riskLevel: p.riskLevel,
                    isDelayed: p.isDelayed,
                    delayReason: p.delayReason,
                    progress: p.progress,
                    manager: p.manager?.name,
                    deadline: p.deadline
               }));

          // Get performance metrics per project manager
          const managerPerformance = {};
          projects.forEach(project => {
               if (project.manager) {
                    const managerId = project.manager.id;
                    if (!managerPerformance[managerId]) {
                         managerPerformance[managerId] = {
                              id: managerId,
                              name: project.manager.name,
                              email: project.manager.email,
                              avatar: project.manager.avatar,
                              totalProjects: 0,
                              completedProjects: 0,
                              delayedProjects: 0,
                              highRiskProjects: 0,
                              averageProgress: 0,
                              totalBudget: 0,
                              totalCost: 0,
                              projects: []
                         };
                    }

                    managerPerformance[managerId].totalProjects++;
                    if (project.status === 'COMPLETED') managerPerformance[managerId].completedProjects++;
                    if (project.isDelayed) managerPerformance[managerId].delayedProjects++;
                    if (project.riskLevel === 'HIGH') managerPerformance[managerId].highRiskProjects++;
                    managerPerformance[managerId].averageProgress += project.progress || 0;
                    managerPerformance[managerId].totalBudget += project.budget || 0;
                    managerPerformance[managerId].totalCost += project.cost || 0;
                    managerPerformance[managerId].projects.push(project.id);
               }
          });

          // Calculate averages for managers
          Object.values(managerPerformance).forEach(manager => {
               manager.averageProgress = Math.round(manager.averageProgress / manager.totalProjects);
               manager.budgetUtilization = manager.totalBudget > 0
                    ? Math.round((manager.totalCost / manager.totalBudget) * 100)
                    : 0;
          });

          return NextResponse.json({
               projects: projectsWithMetrics,
               stats,
               riskAlerts,
               managerPerformance: Object.values(managerPerformance)
          });

     } catch (error) {
          console.error('CEO projects fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch projects' },
               { status: 500 }
          );
     }
}