
// app/api/developer/tasks/route.js
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

          // Parse query parameters
          const { searchParams } = new URL(request.url);
          const status = searchParams.get('status');
          const priority = searchParams.get('priority');
          const projectId = searchParams.get('projectId');
          const search = searchParams.get('search');
          const sortBy = searchParams.get('sortBy') || 'deadline';
          const sortOrder = searchParams.get('sortOrder') || 'asc';

          // Build filter - tasks assigned to this developer
          let whereClause = {
               assigneeId: decoded.id
          };

          // Add filters
          if (status && status !== 'all') {
               whereClause.status = status;
          }

          if (priority && priority !== 'all') {
               whereClause.priority = priority;
          }

          if (projectId) {
               whereClause.projectId = projectId;
          }

          if (search) {
               whereClause.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
               ];
          }

          // Build sort order
          let orderBy = {};
          switch (sortBy) {
               case 'deadline':
                    orderBy.deadline = sortOrder;
                    break;
               case 'priority':
                    orderBy.priority = sortOrder;
                    break;
               case 'status':
                    orderBy.status = sortOrder;
                    break;
               case 'createdAt':
                    orderBy.createdAt = sortOrder;
                    break;
               default:
                    orderBy.deadline = 'asc';
          }

          // Fetch tasks with related data
          const tasks = await prisma.task.findMany({
               where: whereClause,
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true,
                              clientName: true,
                              clientCompany: true
                         }
                    },
                    milestone: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    _count: {
                         select: {
                              comments: true,
                              attachments: true
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
                                        avatar: true
                                   }
                              }
                         }
                    }
               },
               orderBy
          });

          // Calculate overdue status
          const now = new Date();
          const tasksWithMeta = tasks.map(task => ({
               ...task,
               isOverdue: task.deadline && new Date(task.deadline) < now && task.status !== 'COMPLETED',
               daysUntilDeadline: task.deadline
                    ? Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24))
                    : null
          }));

          // Get statistics
          const stats = {
               total: tasks.length,
               notStarted: tasks.filter(t => t.status === 'NOT_STARTED').length,
               inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
               review: tasks.filter(t => t.status === 'REVIEW').length,
               completed: tasks.filter(t => t.status === 'COMPLETED').length,
               blocked: tasks.filter(t => t.status === 'BLOCKED').length,
               overdue: tasksWithMeta.filter(t => t.isOverdue).length,
               highPriority: tasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length
          };

          return NextResponse.json({
               tasks: tasksWithMeta,
               stats
          });

     } catch (error) {
          console.error('Developer tasks fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch tasks' },
               { status: 500 }
          );
     }
}