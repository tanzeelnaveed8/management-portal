

// //app/api/project-manager/dashboard/route.js

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

          const now = new Date();
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          startOfWeek.setHours(0, 0, 0, 0);

          // Get all projects managed by this PM
          const projects = await prisma.project.findMany({
               where: {
                    managerId: decoded.id
               },
               include: {
                    teamLead: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true
                         }
                    },
                    _count: {
                         select: {
                              milestones: true,
                              tasks: true,
                              documents: true,
                              feedbacks: true
                         }
                    },
                    milestones: {
                         where: {
                              status: {
                                   not: 'COMPLETED'
                              }
                         },
                         orderBy: {
                              deadline: 'asc'
                         },
                         take: 5
                    },
                    tasks: {
                         where: {
                              status: 'REVIEW'
                         },
                         select: {
                              id: true
                         }
                    }
               },
               orderBy: {
                    updatedAt: 'desc'
               }
          });

          // Calculate statistics
          const stats = {
               activeProjects: projects.filter(p =>
                    p.status === 'ACTIVE' || p.status === 'IN_DEVELOPMENT'
               ).length,
               totalMilestones: projects.reduce((acc, p) => acc + p._count.milestones, 0),
               pendingApprovals: projects.reduce((acc, p) => acc + p.tasks.length, 0),
               completedMilestones: projects.reduce((acc, p) =>
                    acc + p.milestones.filter(m => m.status === 'COMPLETED').length, 0
               ),
               totalMilestonesCount: projects.reduce((acc, p) => acc + p._count.milestones, 0),
               completionRate: projects.length > 0
                    ? Math.round((projects.reduce((acc, p) => acc + p.progress, 0) / projects.length))
                    : 0,
               deadlinesHit: 94, // This would need more complex calculation
               projectsWithoutLead: projects.filter(p => !p.teamLeadId).length
          };

          // Get recent documents
          const recentDocuments = await prisma.document.findMany({
               where: {
                    project: {
                         managerId: decoded.id
                    }
               },
               orderBy: {
                    uploadedAt: 'desc'
               },
               take: 5,
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    uploadedBy: {
                         select: {
                              name: true
                         }
                    }
               }
          });

          // Get recent feedback
          const recentFeedback = await prisma.clientFeedback.findMany({
               where: {
                    project: {
                         managerId: decoded.id
                    }
               },
               orderBy: {
                    createdAt: 'desc'
               },
               take: 5,
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true,
                              clientName: true
                         }
                    },
                    createdBy: {
                         select: {
                              name: true
                         }
                    }
               }
          });

          // Get upcoming milestones
          const upcomingMilestones = await prisma.milestone.findMany({
               where: {
                    project: {
                         managerId: decoded.id
                    },
                    status: {
                         not: 'COMPLETED'
                    },
                    deadline: {
                         gte: now
                    }
               },
               orderBy: {
                    deadline: 'asc'
               },
               take: 5,
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true
                         }
                    }
               }
          });

          // Get projects waiting for team lead assignment
          const projectsWithoutLead = projects.filter(p => !p.teamLeadId);

          return NextResponse.json({
               projects,
               stats,
               recentDocuments,
               recentFeedback,
               upcomingMilestones,
               projectsWithoutLead
          });

     } catch (error) {
          console.error('Project manager dashboard error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch dashboard data' },
               { status: 500 }
          );
     }
}
// app/api/project-manager/dashboard/route.js
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
//           if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
//                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//           }

//           const now = new Date();
//           const thirtyDaysFromNow = new Date(now);
//           thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

//           // Fetch all projects managed by this PM
//           const projects = await prisma.project.findMany({
//                where: { managerId: decoded.id },
//                include: {
//                     teamLead: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true,
//                               avatar: true
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
//                orderBy: { createdAt: 'desc' }
//           });

//           // Calculate project statistics
//           const projectsWithStats = projects.map(project => {
//                const tasksCount = project._count.tasks;
//                const completedTasks = project.completedTaskCount || 0;
//                const progress = tasksCount > 0 ? (completedTasks / tasksCount) * 100 : project.progress || 0;

//                const isOverdue = project.deadline && new Date(project.deadline) < now && project.status !== 'COMPLETED';
//                const daysUntilDeadline = project.deadline
//                     ? Math.ceil((new Date(project.deadline) - now) / (1000 * 60 * 60 * 24))
//                     : null;

//                return {
//                     id: project.id,
//                     name: project.name,
//                     description: project.description,
//                     status: project.status,
//                     priority: project.priority,
//                     progress: Math.round(progress),
//                     teamLead: project.teamLead?.name || 'Not Assigned',
//                     teamLeadId: project.teamLead?.id,
//                     deadline: project.deadline?.toISOString().split('T')[0],
//                     tasksCount,
//                     milestonesCount: project._count.milestones,
//                     documentsCount: project._count.documents,
//                     feedbacksCount: project._count.feedbacks,
//                     isOverdue,
//                     daysUntilDeadline,
//                     clientName: project.clientName,
//                     clientEmail: project.clientEmail,
//                     createdAt: project.createdAt
//                };
//           });

//           // Calculate overall stats
//           const stats = {
//                totalProjects: projects.length,
//                activeProjects: projects.filter(p => ['ACTIVE', 'IN_DEVELOPMENT'].includes(p.status)).length,
//                completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
//                onHoldProjects: projects.filter(p => p.status === 'ON_HOLD').length,
//                totalMilestones: projects.reduce((acc, p) => acc + p._count.milestones, 0),
//                pendingApprovals: projects.reduce((acc, p) => acc + p._count.feedbacks, 0),
//                deadlinesHit: projects.filter(p => !p.isDelayed && p.status === 'COMPLETED').length,
//                deadlinesMissed: projects.filter(p => p.isDelayed).length,
//                projectsWithoutLead: projects.filter(p => !p.teamLeadId).length,
//                completionRate: projects.length > 0
//                     ? Math.round((projects.filter(p => p.status === 'COMPLETED').length / projects.length) * 100)
//                     : 0
//           };

//           // Fetch recent documents
//           const recentDocuments = await prisma.document.findMany({
//                where: {
//                     project: {
//                          managerId: decoded.id
//                     }
//                },
//                include: {
//                     project: {
//                          select: {
//                               id: true,
//                               name: true
//                          }
//                     },
//                     uploadedBy: {
//                          select: {
//                               name: true,
//                               avatar: true
//                          }
//                     }
//                },
//                orderBy: { uploadedAt: 'desc' },
//                take: 10
//           });

//           // Fetch recent feedback
//           const recentFeedback = await prisma.clientFeedback.findMany({
//                where: {
//                     project: {
//                          managerId: decoded.id
//                     }
//                },
//                include: {
//                     project: {
//                          select: {
//                               id: true,
//                               name: true
//                          }
//                     },
//                     createdBy: {
//                          select: {
//                               name: true,
//                               role: true
//                          }
//                     }
//                },
//                orderBy: { createdAt: 'desc' },
//                take: 10
//           });

//           // Fetch upcoming milestones
//           const upcomingMilestones = await prisma.milestone.findMany({
//                where: {
//                     project: {
//                          managerId: decoded.id
//                     },
//                     deadline: {
//                          gte: now,
//                          lte: thirtyDaysFromNow
//                     },
//                     status: { not: 'COMPLETED' }
//                },
//                include: {
//                     project: {
//                          select: {
//                               id: true,
//                               name: true
//                          }
//                     }
//                },
//                orderBy: { deadline: 'asc' },
//                take: 10
//           });

//           // Projects without team leads
//           const projectsWithoutLead = projects
//                .filter(p => !p.teamLeadId)
//                .map(p => ({
//                     id: p.id,
//                     name: p.name,
//                     clientName: p.clientName,
//                     deadline: p.deadline,
//                     priority: p.priority
//                }));

//           return NextResponse.json({
//                projects: projectsWithStats,
//                stats,
//                recentDocuments: recentDocuments.map(d => ({
//                     id: d.id,
//                     name: d.name,
//                     type: d.type,
//                     projectName: d.project.name,
//                     projectId: d.project.id,
//                     uploadedBy: d.uploadedBy.name,
//                     uploadedAt: d.uploadedAt,
//                     fileSize: d.fileSize,
//                     url: d.url
//                })),
//                recentFeedback: recentFeedback.map(f => ({
//                     id: f.id,
//                     content: f.content.substring(0, 100) + (f.content.length > 100 ? '...' : ''),
//                     status: f.status,
//                     isApproved: f.isApproved,
//                     projectName: f.project.name,
//                     projectId: f.project.id,
//                     createdAt: f.createdAt,
//                     author: f.createdBy.name,
//                     authorRole: f.createdBy.role
//                })),
//                upcomingMilestones: upcomingMilestones.map(m => ({
//                     id: m.id,
//                     name: m.name,
//                     deadline: m.deadline,
//                     projectName: m.project.name,
//                     projectId: m.project.id,
//                     daysLeft: Math.ceil((new Date(m.deadline) - now) / (1000 * 60 * 60 * 24))
//                })),
//                projectsWithoutLead
//           });

//      } catch (error) {
//           console.error('Dashboard API Error:', error);
//           return NextResponse.json(
//                { error: error.message },
//                { status: 500 }
//           );
//      }
// }