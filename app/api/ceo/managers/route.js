

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
          const search = searchParams.get('search');
          const sortBy = searchParams.get('sortBy') || 'performance';
          const sortOrder = searchParams.get('sortOrder') || 'desc';

          // Fetch all project managers with their projects
          const managers = await prisma.user.findMany({
               where: {
                    role: 'PROJECT_MANAGER',
                    ...(status && status !== 'all' ? { status } : {})
               },
               include: {
                    projectsManaged: {
                         include: {
                              tasks: {
                                   select: {
                                        id: true,
                                        status: true,
                                        deadline: true,
                                        priority: true
                                   }
                              },
                              feedbacks: {
                                   select: {
                                        id: true,
                                        isApproved: true,
                                        status: true
                                   }
                              },
                              milestones: {
                                   select: {
                                        id: true,
                                        status: true,
                                        deadline: true
                                   }
                              },
                              teamLead: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              }
                         }
                    }
               },
               orderBy: {
                    name: 'asc'
               }
          });

          // Calculate performance metrics for each manager
          const now = new Date();
          const managersWithMetrics = managers.map(manager => {
               const projects = manager.projectsManaged || [];

               // Project statistics
               const activeProjects = projects.filter(p =>
                    ['ACTIVE', 'IN_DEVELOPMENT'].includes(p.status)
               ).length;

               const completedProjects = projects.filter(p =>
                    p.status === 'COMPLETED'
               ).length;

               const delayedProjects = projects.filter(p => p.isDelayed).length;
               const highRiskProjects = projects.filter(p => p.riskLevel === 'HIGH').length;

               // Calculate total budget and costs
               const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
               const totalCost = projects.reduce((sum, p) => sum + (p.cost || 0), 0);

               // Calculate average progress
               const avgProgress = projects.length > 0
                    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
                    : 0;

               // Calculate on-time delivery rate
               let totalTasks = 0;
               let completedOnTime = 0;

               projects.forEach(project => {
                    project.tasks?.forEach(task => {
                         totalTasks++;
                         if (task.status === 'COMPLETED') {
                              // Check if completed before or on deadline
                              if (task.deadline && new Date(task.deadline) >= new Date(task.completedAt || now)) {
                                   completedOnTime++;
                              } else if (!task.deadline) {
                                   // If no deadline, count as on-time
                                   completedOnTime++;
                              }
                         }
                    });
               });

               const onTimeRate = totalTasks > 0 ? Math.round((completedOnTime / totalTasks) * 100) : 100;

               // Calculate team size (unique team leads + developers from tasks)
               const teamLeads = new Set();
               const developers = new Set();

               projects.forEach(project => {
                    if (project.teamLead?.id) teamLeads.add(project.teamLead.id);
                    project.tasks?.forEach(task => {
                         if (task.assigneeId) developers.add(task.assigneeId);
                    });
               });

               const teamSize = teamLeads.size + developers.size;

               // Calculate client approval rate
               const allFeedbacks = projects.flatMap(p => p.feedbacks || []);
               const approvedFeedbacks = allFeedbacks.filter(f => f.isApproved).length;
               const approvalRate = allFeedbacks.length > 0
                    ? Math.round((approvedFeedbacks / allFeedbacks.length) * 100)
                    : 0;

               // Calculate portfolio health score (weighted average)
               const healthScore = Math.round(
                    (avgProgress * 0.3) +
                    (onTimeRate * 0.4) +
                    (approvalRate * 0.3)
               );

               // Determine performance category
               let performanceCategory = 'Excellent';
               if (healthScore < 60) performanceCategory = 'Critical';
               else if (healthScore < 75) performanceCategory = 'At Risk';
               else if (healthScore < 90) performanceCategory = 'Good';

               return {
                    id: manager.id,
                    name: manager.name,
                    email: manager.email,
                    avatar: manager.avatar,
                    jobTitle: manager.jobTitle || 'Project Manager',
                    status: manager.status,
                    department: manager.department || 'Project Management',
                    phone: manager.phone,
                    metrics: {
                         activeProjects,
                         completedProjects,
                         totalProjects: projects.length,
                         totalBudget,
                         totalCost,
                         avgProgress,
                         onTimeRate,
                         approvalRate,
                         teamSize,
                         healthScore,
                         performanceCategory,
                         delayedProjects,
                         highRiskProjects
                    },
                    projects: projects.map(p => ({
                         id: p.id,
                         name: p.name,
                         status: p.status,
                         progress: p.progress,
                         budget: p.budget,
                         riskLevel: p.riskLevel,
                         isDelayed: p.isDelayed
                    }))
               };
          });

          // Apply search filter
          let filteredManagers = managersWithMetrics;
          if (search) {
               const searchLower = search.toLowerCase();
               filteredManagers = managersWithMetrics.filter(m =>
                    m.name.toLowerCase().includes(searchLower) ||
                    m.email.toLowerCase().includes(searchLower) ||
                    m.department?.toLowerCase().includes(searchLower)
               );
          }

          // Apply sorting
          filteredManagers.sort((a, b) => {
               let aVal, bVal;

               switch (sortBy) {
                    case 'performance':
                         aVal = a.metrics.healthScore;
                         bVal = b.metrics.healthScore;
                         break;
                    case 'projects':
                         aVal = a.metrics.activeProjects;
                         bVal = b.metrics.activeProjects;
                         break;
                    case 'budget':
                         aVal = a.metrics.totalBudget;
                         bVal = b.metrics.totalBudget;
                         break;
                    case 'team':
                         aVal = a.metrics.teamSize;
                         bVal = b.metrics.teamSize;
                         break;
                    default:
                         aVal = a.metrics.healthScore;
                         bVal = b.metrics.healthScore;
               }

               if (sortOrder === 'desc') {
                    return bVal - aVal;
               } else {
                    return aVal - bVal;
               }
          });

          // Calculate overall stats
          const stats = {
               totalManagers: filteredManagers.length,
               avgPortfolioHealth: filteredManagers.length > 0
                    ? Math.round(filteredManagers.reduce((sum, m) => sum + m.metrics.healthScore, 0) / filteredManagers.length)
                    : 0,
               resourceEfficiency: filteredManagers.length > 0
                    ? Math.round(filteredManagers.reduce((sum, m) => sum + m.metrics.onTimeRate, 0) / filteredManagers.length)
                    : 0,
               totalPortfolioValue: filteredManagers.reduce((sum, m) => sum + m.metrics.totalBudget, 0),
               activeManagers: filteredManagers.filter(m => m.status === 'ACTIVE').length,
               managersAtRisk: filteredManagers.filter(m => m.metrics.healthScore < 70).length,
               topPerformers: filteredManagers.filter(m => m.metrics.healthScore >= 90).length
          };

          return NextResponse.json({
               managers: filteredManagers,
               stats
          });

     } catch (error) {
          console.error('CEO managers fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch managers' },
               { status: 500 }
          );
     }
}