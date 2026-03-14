
// // app/api/team-lead/dashboard/route.js
// import { NextResponse } from 'next/server';
// import { verifyAccessToken } from '../../../../lib/auth/jwt';
// import prisma from '../../../../lib/prisma';

// export async function GET(request) {
//      try {
//           const token = request.cookies.get('accessToken')?.value;

//           if (!token) {
//                return NextResponse.json(
//                     { error: 'Not authenticated' },
//                     { status: 401 }
//                );
//           }

//           const decoded = verifyAccessToken(token);
//           if (!decoded || decoded.role !== 'TEAM_LEAD') {
//                return NextResponse.json(
//                     { error: 'Access denied' },
//                     { status: 403 }
//                );
//           }

//           const now = new Date();
//           const startOfDay = new Date(now.setHours(0, 0, 0, 0));
//           const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
//           startOfWeek.setHours(0, 0, 0, 0);

//           // Get projects where user is team lead
//           const projects = await prisma.project.findMany({
//                where: {
//                     teamLeadId: decoded.id
//                },
//                include: {
//                     manager: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true
//                          }
//                     },
//                     _count: {
//                          select: {
//                               tasks: true,
//                               milestones: true
//                          }
//                     },
//                     tasks: {
//                          where: {
//                               status: 'REVIEW'
//                          },
//                          select: {
//                               id: true
//                          }
//                     }
//                }
//           });

//           // Get all tasks from team lead's projects
//           const tasks = await prisma.task.findMany({
//                where: {
//                     project: {
//                          teamLeadId: decoded.id
//                     }
//                },
//                include: {
//                     project: {
//                          select: {
//                               id: true,
//                               name: true
//                          }
//                     },
//                     milestone: {
//                          select: {
//                               id: true,
//                               name: true
//                          }
//                     },
//                     assignee: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true,
//                               avatar: true
//                          }
//                     },
//                     _count: {
//                          select: {
//                               comments: true,
//                               attachments: true
//                          }
//                     }
//                },
//                orderBy: [
//                     { status: 'asc' },
//                     { priority: 'desc' },
//                     { deadline: 'asc' }
//                ]
//           });

//           // Calculate statistics
//           const stats = {
//                totalTasks: tasks.length,
//                inReview: tasks.filter(t => t.status === 'REVIEW').length,
//                overdue: tasks.filter(t =>
//                     t.deadline && new Date(t.deadline) < now && t.status !== 'COMPLETED'
//                ).length,
//                completed: tasks.filter(t => t.status === 'COMPLETED').length,
//                notStarted: tasks.filter(t => t.status === 'NOT_STARTED').length,
//                inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
//                blocked: tasks.filter(t => t.status === 'BLOCKED').length
//           };

//           // Get developers (users with role DEVELOPER)
//           const developers = await prisma.user.findMany({
//                where: {
//                     role: 'DEVELOPER',
//                     status: 'ACTIVE'
//                },
//                select: {
//                     id: true,
//                     name: true,
//                     email: true,
//                     avatar: true,
//                     jobTitle: true,
//                     _count: {
//                          select: {
//                               assignedTasks: {
//                                    where: {
//                                         status: {
//                                              not: 'COMPLETED'
//                                         }
//                                    }
//                               }
//                          }
//                     }
//                },
//                orderBy: {
//                     name: 'asc'
//                }
//           });

//           // Get recent activities
//           const recentActivities = await prisma.activityLog.findMany({
//                where: {
//                     OR: [
//                          { entityType: 'task' },
//                          { entityType: 'milestone' }
//                     ],
//                     userId: decoded.id
//                },
//                include: {
//                     user: {
//                          select: {
//                               name: true,
//                               avatar: true
//                          }
//                     }
//                },
//                orderBy: {
//                     createdAt: 'desc'
//                },
//                take: 10
//           });

//           return NextResponse.json({
//                projects,
//                tasks,
//                stats,
//                developers,
//                recentActivities
//           });

//      } catch (error) {
//           console.error('Team lead dashboard error:', error);
//           return NextResponse.json(
//                { error: 'Failed to fetch dashboard data' },
//                { status: 500 }
//           );
//      }
// }


// app/api/team-lead/dashboard/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
     try {
          // Get token from cookies
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          // Verify token and get user
          const decoded = verifyAccessToken(token);
          if (!decoded) {
               return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
               );
          }

          // Check if user has appropriate role
          if (!['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Get current date for calculations
          const now = new Date();
          const sevenDaysFromNow = new Date(now);
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

          // 1. Fetch projects assigned to this team lead
          const assignedProjects = await prisma.project.findMany({
               where: {
                    teamLeadId: decoded.id,
                    status: { in: ['ACTIVE', 'IN_DEVELOPMENT'] }
               },
               include: {
                    manager: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    _count: {
                         select: {
                              tasks: true,
                              milestones: true
                         }
                    }
               },
               orderBy: {
                    deadline: 'asc'
               }
          });

          // Calculate project progress based on tasks
          const projectsWithProgress = await Promise.all(
               assignedProjects.map(async (project) => {
                    const tasks = await prisma.task.findMany({
                         where: { projectId: project.id },
                         select: { status: true }
                    });

                    const totalTasks = tasks.length;
                    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
                    const progress = totalTasks > 0
                         ? Math.round((completedTasks / totalTasks) * 100)
                         : project.progress || 0;

                    return {
                         id: project.id,
                         name: project.name,
                         client: project.clientName,
                         deadline: project.deadline?.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                         }) || 'TBD',
                         progress,
                         status: project.status,
                         manager: project.manager.name,
                         taskCount: project._count.tasks,
                         milestoneCount: project._count.milestones
                    };
               })
          );

          // 2. Fetch pending approvals (tasks in REVIEW status)
          const pendingApprovals = await prisma.task.findMany({
               where: {
                    status: 'REVIEW',
                    project: {
                         teamLeadId: decoded.id
                    }
               },
               include: {
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              avatar: true
                         }
                    },
                    project: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    milestone: {
                         select: {
                              id: true,
                              name: true
                         }
                    }
               },
               orderBy: {
                    updatedAt: 'desc'
               },
               take: 10
          });

          const formattedApprovals = pendingApprovals.map(task => ({
               id: task.id,
               task: task.title,
               developer: task.assignee?.name || 'Unassigned',
               project: task.project.name,
               milestone: task.milestone?.name,
               time: formatRelativeTime(task.updatedAt),
               priority: task.priority
          }));

          // 3. Fetch developer tasks with status
          const developerTasks = await prisma.task.findMany({
               where: {
                    project: {
                         teamLeadId: decoded.id
                    },
                    status: { not: 'COMPLETED' }
               },
               include: {
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              avatar: true
                         }
                    },
                    project: {
                         select: {
                              id: true,
                              name: true
                         }
                    }
               },
               orderBy: [
                    { priority: 'desc' },
                    { deadline: 'asc' }
               ],
               take: 20
          });

          const formattedTasks = developerTasks.map(task => {
               const isDelayed = task.deadline && new Date(task.deadline) < now;
               const daysUntilDeadline = task.deadline
                    ? Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24))
                    : null;

               return {
                    id: task.id,
                    task: task.title,
                    dev: task.assignee?.name || 'Unassigned',
                    status: task.status,
                    priority: task.priority,
                    deadline: formatDeadline(task.deadline, isDelayed),
                    isDelayed,
                    daysLeft: daysUntilDeadline,
                    project: task.project.name
               };
          });

          // 4. Fetch upcoming internal deadlines
          const upcomingDeadlines = await prisma.task.findMany({
               where: {
                    project: {
                         teamLeadId: decoded.id
                    },
                    deadline: {
                         gte: now,
                         lte: sevenDaysFromNow
                    },
                    status: { not: 'COMPLETED' }
               },
               include: {
                    assignee: {
                         select: { name: true }
                    },
                    project: {
                         select: { name: true }
                    }
               },
               orderBy: {
                    deadline: 'asc'
               },
               take: 5
          });

          const formattedDeadlines = upcomingDeadlines.map(task => ({
               id: task.id,
               title: task.title,
               deadline: task.deadline?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
               }),
               project: task.project.name,
               developer: task.assignee?.name
          }));

          // 5. Calculate dashboard stats
          const allTeamTasks = await prisma.task.findMany({
               where: {
                    project: {
                         teamLeadId: decoded.id
                    }
               },
               select: {
                    status: true,
                    deadline: true
               }
          });

          const totalTasks = allTeamTasks.length;
          const completedTasks = allTeamTasks.filter(t => t.status === 'COMPLETED').length;
          const overdueTasks = allTeamTasks.filter(t =>
               t.status !== 'COMPLETED' &&
               t.deadline &&
               new Date(t.deadline) < now
          ).length;

          // Get unique developers count
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
               distinct: ['id']
          });

          const stats = {
               totalProjects: assignedProjects.length,
               activeProjects: assignedProjects.filter(p =>
                    ['ACTIVE', 'IN_DEVELOPMENT'].includes(p.status)
               ).length,
               totalDevelopers: developers.length,
               pendingReviews: pendingApprovals.length,
               overdueTasks,
               completionRate: totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0,
               totalTasks,
               completedTasks
          };

          return NextResponse.json({
               projects: projectsWithProgress,
               pendingApprovals: formattedApprovals,
               developerTasks: formattedTasks,
               deadlines: formattedDeadlines,
               stats
          });

     } catch (error) {
          console.error('Team Lead Dashboard Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}

// Helper functions
function formatRelativeTime(date) {
     const now = new Date();
     const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

     if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
     return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function formatDeadline(deadline, isDelayed) {
     if (!deadline) return 'No deadline';
     if (isDelayed) return 'Delayed';

     const now = new Date();
     const deadlineDate = new Date(deadline);
     const diffInDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

     if (diffInDays === 0) return 'Today';
     if (diffInDays === 1) return 'Tomorrow';
     if (diffInDays < 0) return 'Overdue';
     if (diffInDays <= 7) return `${diffInDays} days left`;

     return deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}