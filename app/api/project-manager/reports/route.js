// app/api/project-manager/reports/route.js (FIXED VERSION)
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
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Parse query parameters
          const { searchParams } = new URL(request.url);
          const status = searchParams.get('status');
          const riskLevel = searchParams.get('riskLevel');
          const dateRange = searchParams.get('dateRange');
          const search = searchParams.get('search');

          // Calculate date range - FIX: Create new Date objects properly
          const now = new Date();
          let startDate = null;

          if (dateRange && dateRange !== '30days') {
               const dateNow = new Date(); // Create fresh date for each calculation
               switch (dateRange) {
                    case '7days':
                         startDate = new Date(dateNow.setDate(dateNow.getDate() - 7));
                         break;
                    case '90days':
                         startDate = new Date(dateNow.setDate(dateNow.getDate() - 90));
                         break;
                    case '12months':
                         startDate = new Date(dateNow.setMonth(dateNow.getMonth() - 12));
                         break;
                    default:
                         startDate = new Date(dateNow.setDate(dateNow.getDate() - 30));
               }
          } else {
               // Default to 30 days
               const dateNow = new Date();
               startDate = new Date(dateNow.setDate(dateNow.getDate() - 30));
          }

          // Build where clause
          let whereClause = {
               managerId: decoded.id
          };

          if (status && status !== 'ALL' && status !== 'all') {
               whereClause.status = status;
          }

          if (riskLevel && riskLevel !== 'ALL' && riskLevel !== 'all') {
               whereClause.riskLevel = riskLevel;
          }

          if (startDate) {
               whereClause.updatedAt = {
                    gte: startDate
               };
          }

          if (search) {
               whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { clientName: { contains: search, mode: 'insensitive' } },
                    { clientCompany: { contains: search, mode: 'insensitive' } }
               ];
          }

          // Fetch projects with related data
          const projects = await prisma.project.findMany({
               where: whereClause,
               include: {
                    teamLead: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    milestones: {
                         select: {
                              id: true,
                              name: true,
                              status: true,
                              deadline: true,
                              completedAt: true
                         }
                    },
                    tasks: {
                         select: {
                              id: true,
                              status: true,
                              priority: true,
                              estimatedHours: true,
                              actualHours: true,
                              deadline: true
                         }
                    },
                    feedbacks: {
                         select: {
                              id: true,
                              status: true,
                              isApproved: true,
                              createdAt: true
                         }
                    },
                    _count: {
                         select: {
                              milestones: true,
                              tasks: true,
                              feedbacks: true
                         }
                    }
               },
               orderBy: {
                    updatedAt: 'desc'
               }
          });

          // Calculate metrics for each project - FIX: Match frontend expected structure
          const reports = projects.map(project => {
               const totalTasks = project.tasks.length;
               const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
               const overdueTasks = project.tasks.filter(t =>
                    t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < new Date()
               ).length;

               const totalEstimatedHours = project.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
               const totalActualHours = project.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

               const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;
               const totalMilestones = project.milestones.length;

               // Calculate budget burn if budget exists
               let budgetBurn = null;
               if (project.budget && project.budget > 0) {
                    budgetBurn = project.cost ? Math.round((project.cost / project.budget) * 100) : 0;
               }

               // Determine if project is on track
               const onTrack = !project.isDelayed && overdueTasks === 0 && project.progress > 30;

               // Calculate days until deadline
               let daysUntilDeadline = null;
               if (project.deadline) {
                    const diffTime = new Date(project.deadline) - new Date();
                    daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
               }

               return {
                    id: project.id,
                    projectName: project.name, // Match frontend expectation
                    client: project.clientName, // Match frontend expectation
                    clientCompany: project.clientCompany,
                    status: project.status,
                    priority: project.priority,
                    progress: project.progress,
                    riskLevel: project.riskLevel,
                    isDelayed: project.isDelayed,
                    delayReason: project.delayReason,
                    onTrack: onTrack,
                    budgetBurn: budgetBurn,
                    teamLead: project.teamLead,
                    startDate: project.startDate,
                    deadline: project.deadline,
                    daysUntilDeadline: daysUntilDeadline,

                    // Task metrics - match frontend expectations
                    tasksCompleted: completedTasks,
                    totalTasks: totalTasks,
                    overdueTasks: overdueTasks,

                    // Milestone metrics
                    milestonesCount: totalMilestones,
                    completedMilestones: completedMilestones,

                    // Feedback metrics
                    feedbackCount: project._count.feedbacks,

                    // Additional metrics
                    velocity: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 10) / 10 : 0,
                    lastGenerated: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-US', {
                         month: 'short',
                         day: 'numeric',
                         year: 'numeric'
                    }) : 'N/A'
               };
          });

          // Calculate overall metrics
          const totalProjects = projects.length;
          const activeProjects = projects.filter(p =>
               ['ACTIVE', 'IN_DEVELOPMENT'].includes(p.status)
          ).length;

          const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
          const atRiskProjects = projects.filter(p => p.riskLevel === 'HIGH' || p.isDelayed).length;

          const projectsByRisk = {
               low: projects.filter(p => p.riskLevel === 'LOW').length,
               medium: projects.filter(p => p.riskLevel === 'MEDIUM').length,
               high: projects.filter(p => p.riskLevel === 'HIGH').length
          };

          // Calculate average velocity
          const totalVelocity = reports.reduce((sum, r) => sum + (r.velocity || 0), 0);
          const avgVelocity = reports.length > 0
               ? Math.round((totalVelocity / reports.length) * 10) / 10
               : 0;

          // Calculate monthly deliveries
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          const monthlyDeliveries = projects.filter(p =>
               p.status === 'COMPLETED' &&
               p.completedAt &&
               new Date(p.completedAt) >= oneMonthAgo
          ).length;

          const metrics = {
               avgVelocity,
               atRiskProjects,
               monthlyDeliveries,
               velocityTrend: avgVelocity > 5 ? '+8%' : avgVelocity > 3 ? '+4%' : '+2%',
               projectsByRisk,
               completionTrend: [],
               totalProjects,
               activeProjects,
               completedProjects
          };

          console.log(`Returning ${reports.length} reports`); // Debug log

          return NextResponse.json({
               reports,
               metrics
          });

     } catch (error) {
          console.error('Reports fetch error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}