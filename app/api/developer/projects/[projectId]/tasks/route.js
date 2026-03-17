

// app/api/developer/projects/[projectId]/tasks/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { projectId } = params;

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
          const milestoneId = searchParams.get('milestoneId');

          // Build filter
          let whereClause = {
               projectId,
               assigneeId: decoded.id
          };

          if (status && status !== 'all') {
               whereClause.status = status;
          }

          if (milestoneId) {
               whereClause.milestoneId = milestoneId;
          }

          // Fetch tasks
          const tasks = await prisma.task.findMany({
               where: whereClause,
               include: {
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
                                        avatar: true
                                   }
                              }
                         }
                    },
                    attachments: {
                         select: {
                              id: true,
                              name: true,
                              url: true,
                              fileSize: true
                         }
                    }
               },
               orderBy: [
                    { priority: 'desc' },
                    { deadline: 'asc' }
               ]
          });

          // Calculate task statistics
          const stats = {
               total: tasks.length,
               notStarted: tasks.filter(t => t.status === 'NOT_STARTED').length,
               inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
               review: tasks.filter(t => t.status === 'REVIEW').length,
               completed: tasks.filter(t => t.status === 'COMPLETED').length,
               blocked: tasks.filter(t => t.status === 'BLOCKED').length
          };

          return NextResponse.json({
               tasks,
               stats
          });

     } catch (error) {
          console.error('Project tasks fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch tasks' },
               { status: 500 }
          );
     }
}