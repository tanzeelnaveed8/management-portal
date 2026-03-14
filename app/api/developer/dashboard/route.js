

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

          // Get current date for calculations
          const now = new Date();
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          startOfWeek.setHours(0, 0, 0, 0);

          // Fetch developer's projects
          const projects = await prisma.project.findMany({
               where: {
                    tasks: {
                         some: {
                              assigneeId: decoded.id
                         }
                    }
               },
               include: {
                    _count: {
                         select: {
                              tasks: {
                                   where: {
                                        assigneeId: decoded.id,
                                        status: { not: 'COMPLETED' }
                                   }
                              }
                         }
                    }
               },
               orderBy: {
                    deadline: 'asc'
               },
               take: 5
          });

          // Fetch developer's tasks with all related data
          const tasks = await prisma.task.findMany({
               where: {
                    assigneeId: decoded.id
               },
               include: {
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
                    },
                    comments: {
                         orderBy: {
                              createdAt: 'desc'
                         },
                         take: 3,
                         include: {
                              author: {
                                   select: {
                                        id: true,
                                        name: true,
                                        role: true
                                   }
                              }
                         }
                    },
                    _count: {
                         select: {
                              comments: true,
                              attachments: true
                         }
                    }
               },
               orderBy: [
                    { status: 'asc' },
                    { priority: 'desc' },
                    { deadline: 'asc' }
               ]
          });

          // Calculate task statistics
          const taskStats = {
               total: tasks.length,
               notStarted: tasks.filter(t => t.status === 'NOT_STARTED').length,
               inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
               review: tasks.filter(t => t.status === 'REVIEW').length,
               completed: tasks.filter(t => t.status === 'COMPLETED').length,
               blocked: tasks.filter(t => t.status === 'BLOCKED').length
          };

          // Calculate weekly goal progress
          const weeklyTasks = tasks.filter(t =>
               t.createdAt >= startOfWeek ||
               (t.completedAt && t.completedAt >= startOfWeek)
          );

          const weeklyCompleted = tasks.filter(t =>
               t.status === 'COMPLETED' &&
               t.completedAt &&
               t.completedAt >= startOfWeek
          ).length;

          const weeklyGoal = 15; // Default weekly goal
          const weeklyProgress = weeklyCompleted;

          // Calculate session time
          const sessions = await prisma.session.findMany({
               where: {
                    userId: decoded.id,
                    expires: {
                         gt: now
                    }
               },
               orderBy: {
                    createdAt: 'desc'
               }
          });

          // Calculate active session duration
          let activeSessionDuration = 0;
          if (sessions.length > 0) {
               const currentSession = sessions[0];
               activeSessionDuration = Math.floor((now - currentSession.createdAt) / (1000 * 60)); // in minutes
          }

          // Fetch recent comments
          const recentComments = await prisma.comment.findMany({
               where: {
                    task: {
                         assigneeId: decoded.id
                    }
               },
               include: {
                    author: {
                         select: {
                              id: true,
                              name: true,
                              role: true,
                              avatar: true
                         }
                    },
                    task: {
                         select: {
                              id: true,
                              title: true
                         }
                    }
               },
               orderBy: {
                    createdAt: 'desc'
               },
               take: 5
          });

          // Format projects for display
          const formattedProjects = projects.map(project => ({
               id: project.id,
               name: project.name,
               role: 'Developer', // You might want to fetch actual role from project assignment
               deadline: project.deadline ? formatDate(project.deadline) : 'No deadline',
               tasksLeft: project._count.tasks
          }));

          // Format tasks for display
          const formattedTasks = tasks.map(task => ({
               id: task.id,
               task: task.title,
               description: task.description || 'No description provided',
               project: task.project?.name || 'Unknown Project',
               status: formatStatus(task.status),
               priority: task.priority,
               deadline: task.deadline ? formatDeadline(task.deadline) : 'No deadline',
               isOverdue: task.deadline && new Date(task.deadline) < now && task.status !== 'COMPLETED',
               comments: task._count.comments,
               attachments: task._count.attachments
          }));

          // Format comments for display
          const formattedComments = recentComments.map(comment => ({
               id: comment.id,
               user: comment.author.name,
               role: comment.author.role,
               text: comment.content,
               time: formatTimeAgo(comment.createdAt),
               taskTitle: comment.task.title
          }));

          return NextResponse.json({
               user: {
                    id: decoded.id,
                    name: decoded.name,
                    email: decoded.email,
                    role: decoded.role
               },
               session: {
                    activeDuration: formatDuration(activeSessionDuration),
                    activeMinutes: activeSessionDuration
               },
               stats: taskStats,
               projects: formattedProjects,
               tasks: formattedTasks,
               comments: formattedComments,
               weeklyGoal: {
                    target: weeklyGoal,
                    completed: weeklyProgress,
                    percentage: Math.round((weeklyProgress / weeklyGoal) * 100)
               }
          });

     } catch (error) {
          console.error('Developer dashboard error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch dashboard data' },
               { status: 500 }
          );
     }
}

// Helper functions
function formatDate(date) {
     const options = { month: 'short', day: 'numeric' };
     return new Date(date).toLocaleDateString('en-US', options);
}

function formatDeadline(date) {
     const now = new Date();
     const deadline = new Date(date);
     const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

     if (diffDays < 0) return 'Overdue';
     if (diffDays === 0) return 'Today';
     if (diffDays === 1) return 'Tomorrow';
     if (diffDays <= 7) return `${diffDays} days`;
     return formatDate(date);
}

function formatStatus(status) {
     const statusMap = {
          'NOT_STARTED': 'Not Started',
          'IN_PROGRESS': 'In Progress',
          'REVIEW': 'Review',
          'COMPLETED': 'Completed',
          'BLOCKED': 'Blocked'
     };
     return statusMap[status] || status;
}

function formatTimeAgo(date) {
     const now = new Date();
     const diffMinutes = Math.floor((now - new Date(date)) / (1000 * 60));

     if (diffMinutes < 1) return 'Just now';
     if (diffMinutes < 60) return `${diffMinutes}m ago`;
     if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
     return `${Math.floor(diffMinutes / 1440)}d ago`;
}

function formatDuration(minutes) {
     if (minutes < 60) {
          return `${minutes}m`;
     }
     const hours = Math.floor(minutes / 60);
     const remainingMinutes = minutes % 60;
     return `${hours}h ${remainingMinutes}m`;
}