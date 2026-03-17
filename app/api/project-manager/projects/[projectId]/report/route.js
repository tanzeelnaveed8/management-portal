

// import { NextResponse } from 'next/server';
// import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
// import prisma from '../../../../../../lib/prisma';

// export async function GET(request, { params }) {
//      try {
//           const { projectId } = params;
//           const token = request.cookies.get('accessToken')?.value;

//           if (!token) {
//                return NextResponse.json(
//                     { error: 'Not authenticated' },
//                     { status: 401 }
//                );
//           }

//           const decoded = verifyAccessToken(token);
//           if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
//                return NextResponse.json(
//                     { error: 'Access denied' },
//                     { status: 403 }
//                );
//           }

//           // Verify project access
//           const project = await prisma.project.findFirst({
//                where: {
//                     id: projectId,
//                     managerId: decoded.id
//                },
//                include: {
//                     manager: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true
//                          }
//                     },
//                     teamLead: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true
//                          }
//                     },
//                     milestones: {
//                          include: {
//                               _count: {
//                                    select: {
//                                         tasks: true
//                                    }
//                               },
//                               tasks: {
//                                    where: {
//                                         status: 'COMPLETED'
//                                    }
//                               }
//                          },
//                          orderBy: {
//                               deadline: 'asc'
//                          }
//                     },
//                     tasks: {
//                          include: {
//                               assignee: {
//                                    select: {
//                                         id: true,
//                                         name: true
//                                    }
//                               },
//                               milestone: {
//                                    select: {
//                                         id: true,
//                                         name: true
//                                    }
//                               }
//                          }
//                     },
//                     documents: {
//                          where: {
//                               type: 'CLIENT_REQUIREMENT'
//                          }
//                     },
//                     feedbacks: {
//                          orderBy: {
//                               createdAt: 'desc'
//                          },
//                          take: 10
//                     }
//                }
//           });

//           if (!project) {
//                return NextResponse.json(
//                     { error: 'Project not found or access denied' },
//                     { status: 404 }
//                );
//           }

//           // Calculate metrics
//           const now = new Date();
//           const totalTasks = project.tasks.length;
//           const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
//           const overdueTasks = project.tasks.filter(t =>
//                t.deadline && new Date(t.deadline) < now && t.status !== 'COMPLETED'
//           ).length;
//           const tasksInReview = project.tasks.filter(t => t.status === 'REVIEW').length;

//           const milestoneStats = {
//                total: project.milestones.length,
//                completed: project.milestones.filter(m => m.status === 'COMPLETED').length,
//                inProgress: project.milestones.filter(m => m.status === 'IN_PROGRESS').length,
//                delayed: project.milestones.filter(m => m.status === 'DELAYED').length
//           };

//           const feedbackStats = {
//                total: project.feedbacks.length,
//                approved: project.feedbacks.filter(f => f.isApproved).length,
//                pending: project.feedbacks.filter(f => f.status === 'PENDING').length,
//                revisions: project.feedbacks.reduce((acc, f) => acc + f.revisionCount, 0)
//           };

//           const report = {
//                project: {
//                     id: project.id,
//                     name: project.name,
//                     description: project.description,
//                     status: project.status,
//                     priority: project.priority,
//                     progress: project.progress,
//                     startDate: project.startDate,
//                     deadline: project.deadline,
//                     isDelayed: project.isDelayed,
//                     riskLevel: project.riskLevel,
//                     clientName: project.clientName,
//                     clientCompany: project.clientCompany
//                },
//                team: {
//                     manager: project.manager,
//                     teamLead: project.teamLead
//                },
//                metrics: {
//                     totalTasks,
//                     completedTasks,
//                     overdueTasks,
//                     tasksInReview,
//                     completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
//                     milestoneStats,
//                     feedbackStats
//                },
//                milestones: project.milestones.map(m => ({
//                     id: m.id,
//                     name: m.name,
//                     status: m.status,
//                     deadline: m.deadline,
//                     progress: m.progress,
//                     taskCount: m._count.tasks,
//                     completedTasks: m.tasks.length
//                })),
//                recentFeedback: project.feedbacks.slice(0, 5),
//                generatedAt: new Date().toISOString(),
//                generatedBy: decoded.name
//           };

//           return NextResponse.json({ report });

//      } catch (error) {
//           console.error('Generate report error:', error);
//           return NextResponse.json(
//                { error: 'Failed to generate report' },
//                { status: 500 }
//           );
//      }
// }

// app/api/project-manager/projects/[projectId]/report/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { projectId } = await params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Fetch project with all data for report
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    managerId: decoded.id
               },
               include: {
                    manager: {
                         select: {
                              name: true,
                              email: true
                         }
                    },
                    teamLead: {
                         select: {
                              name: true,
                              email: true
                         }
                    },
                    milestones: {
                         include: {
                              tasks: {
                                   include: {
                                        assignee: {
                                             select: {
                                                  name: true,
                                                  email: true
                                             }
                                        }
                                   }
                              }
                         },
                         orderBy: { deadline: 'asc' }
                    },
                    tasks: {
                         include: {
                              assignee: {
                                   select: {
                                        name: true,
                                        email: true
                                   }
                              },
                              milestone: {
                                   select: {
                                        name: true
                                   }
                              }
                         },
                         orderBy: { createdAt: 'desc' }
                    },
                    documents: {
                         include: {
                              uploadedBy: {
                                   select: {
                                        name: true
                                   }
                              }
                         },
                         orderBy: { uploadedAt: 'desc' }
                    },
                    feedbacks: {
                         include: {
                              createdBy: {
                                   select: {
                                        name: true,
                                        role: true
                                   }
                              }
                         },
                         orderBy: { createdAt: 'desc' }
                    },
                    _count: {
                         select: {
                              tasks: true,
                              milestones: true,
                              documents: true,
                              feedbacks: true
                         }
                    }
               }
          });

          if (!project) {
               return NextResponse.json({ error: 'Project not found' }, { status: 404 });
          }

          const now = new Date();

          // Calculate task statistics
          const totalTasks = project.tasks.length;
          const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
          const inProgressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
          const reviewTasks = project.tasks.filter(t => t.status === 'REVIEW').length;
          const blockedTasks = project.tasks.filter(t => t.status === 'BLOCKED').length;
          const notStartedTasks = project.tasks.filter(t => t.status === 'NOT_STARTED').length;

          // Calculate overdue tasks
          const overdueTasks = project.tasks.filter(t =>
               t.status !== 'COMPLETED' &&
               t.deadline &&
               new Date(t.deadline) < now
          ).length;

          // Calculate milestone progress
          const milestonesWithProgress = project.milestones.map(m => {
               const milestoneTasks = m.tasks || [];
               const completedMilestoneTasks = milestoneTasks.filter(t => t.status === 'COMPLETED').length;
               const progress = milestoneTasks.length > 0
                    ? Math.round((completedMilestoneTasks / milestoneTasks.length) * 100)
                    : 0;

               return {
                    name: m.name,
                    status: m.status,
                    deadline: m.deadline,
                    progress,
                    tasksCount: milestoneTasks.length,
                    completedTasks: completedMilestoneTasks,
                    isDelayed: m.isDelayed
               };
          });

          // Calculate developer workload
          const developerWorkload = {};
          project.tasks.forEach(task => {
               if (task.assignee) {
                    if (!developerWorkload[task.assignee.name]) {
                         developerWorkload[task.assignee.name] = {
                              name: task.assignee.name,
                              email: task.assignee.email,
                              total: 0,
                              completed: 0,
                              inProgress: 0,
                              review: 0,
                              blocked: 0
                         };
                    }
                    developerWorkload[task.assignee.name].total++;

                    switch (task.status) {
                         case 'COMPLETED':
                              developerWorkload[task.assignee.name].completed++;
                              break;
                         case 'IN_PROGRESS':
                              developerWorkload[task.assignee.name].inProgress++;
                              break;
                         case 'REVIEW':
                              developerWorkload[task.assignee.name].review++;
                              break;
                         case 'BLOCKED':
                              developerWorkload[task.assignee.name].blocked++;
                              break;
                    }
               }
          });

          // Calculate timeline variance
          const originalTimeline = {
               start: project.startDate,
               deadline: project.deadline
          };

          const currentTimeline = {
               start: project.startDate,
               deadline: project.deadline,
               completedAt: project.completedAt
          };

          const daysDelayed = project.deadline && now > project.deadline && project.status !== 'COMPLETED'
               ? Math.ceil((now - new Date(project.deadline)) / (1000 * 60 * 60 * 24))
               : 0;

          // Generate report
          const report = {
               projectInfo: {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    priority: project.priority,
                    riskLevel: project.riskLevel,
                    startDate: project.startDate,
                    deadline: project.deadline,
                    completedAt: project.completedAt,
                    createdAt: project.createdAt,
                    daysDelayed,
                    isDelayed: project.isDelayed,
                    delayReason: project.delayReason
               },
               clientInfo: {
                    name: project.clientName,
                    email: project.clientEmail,
                    company: project.clientCompany,
                    phone: project.clientPhone
               },
               teamInfo: {
                    projectManager: project.manager,
                    teamLead: project.teamLead
               },
               financials: {
                    budget: project.budget,
                    actualCost: project.cost,
                    variance: project.budget && project.cost
                         ? project.budget - project.cost
                         : null,
                    budgetUtilization: project.budget && project.cost
                         ? Math.round((project.cost / project.budget) * 100)
                         : 0
               },
               taskStats: {
                    total: totalTasks,
                    completed: completedTasks,
                    inProgress: inProgressTasks,
                    review: reviewTasks,
                    blocked: blockedTasks,
                    notStarted: notStartedTasks,
                    overdue: overdueTasks,
                    completionRate: totalTasks > 0
                         ? Math.round((completedTasks / totalTasks) * 100)
                         : 0,
                    healthScore: calculateHealthScore({
                         totalTasks,
                         completedTasks,
                         overdueTasks,
                         blockedTasks,
                         inProgressTasks
                    })
               },
               milestoneStats: {
                    total: project.milestones.length,
                    completed: project.milestones.filter(m => m.status === 'COMPLETED').length,
                    inProgress: project.milestones.filter(m => m.status === 'IN_PROGRESS').length,
                    delayed: project.milestones.filter(m => m.isDelayed).length,
                    milestones: milestonesWithProgress
               },
               developerWorkload: Object.values(developerWorkload),
               documents: project.documents.map(d => ({
                    id: d.id,
                    name: d.name,
                    type: d.type,
                    uploadedBy: d.uploadedBy.name,
                    uploadedAt: d.uploadedAt,
                    fileSize: d.fileSize
               })),
               feedbacks: project.feedbacks.map(f => ({
                    id: f.id,
                    content: f.content,
                    status: f.status,
                    isApproved: f.isApproved,
                    stage: f.stage,
                    createdAt: f.createdAt,
                    author: f.createdBy.name,
                    authorRole: f.createdBy.role
               })),
               timeline: {
                    original: originalTimeline,
                    current: currentTimeline,
                    timelineStatus: daysDelayed > 0 ? 'DELAYED' : 'ON_TRACK'
               },
               metrics: {
                    projectProgress: project.progress ||
                         (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0),
                    milestoneProgress: project.milestones.length > 0
                         ? Math.round((project.milestones.filter(m => m.status === 'COMPLETED').length / project.milestones.length) * 100)
                         : 0,
                    documentCount: project._count.documents,
                    feedbackCount: project._count.feedbacks
               },
               generatedAt: new Date(),
               generatedBy: decoded.name
          };

          // Log report generation
          await prisma.activityLog.create({
               data: {
                    action: 'GENERATE_REPORT',
                    entityType: 'project',
                    entityId: projectId,
                    details: {
                         projectName: project.name,
                         reportGeneratedAt: new Date()
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({ report });

     } catch (error) {
          console.error('Generate Report API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}

// Helper function to calculate project health score
function calculateHealthScore({ totalTasks, completedTasks, overdueTasks, blockedTasks, inProgressTasks }) {
     if (totalTasks === 0) return 100;

     const completedWeight = (completedTasks / totalTasks) * 40; // 40% weight
     const overduePenalty = (overdueTasks / totalTasks) * 30; // 30% penalty max
     const blockedPenalty = (blockedTasks / totalTasks) * 20; // 20% penalty max
     const inProgressBonus = (inProgressTasks / totalTasks) * 10; // 10% bonus max

     const score = Math.max(0, Math.min(100,
          40 + completedWeight - overduePenalty - blockedPenalty + inProgressBonus
     ));

     return Math.round(score);
}