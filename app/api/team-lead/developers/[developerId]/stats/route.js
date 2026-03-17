
// app/api/team-lead/developers/[developerId]/stats/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { developerId } = await params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Get date range from query params (default to last 30 days)
          const { searchParams } = new URL(request.url);
          const days = parseInt(searchParams.get('days') || '30');
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);

          // Fetch task completion trends
          const tasks = await prisma.task.findMany({
               where: {
                    assigneeId: developerId,
                    createdAt: { gte: startDate }
               },
               select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    completedAt: true,
                    estimatedHours: true,
                    actualHours: true,
                    priority: true
               },
               orderBy: {
                    createdAt: 'asc'
               }
          });

          // Group tasks by date for trend analysis
          const dailyStats = {};
          const now = new Date();

          tasks.forEach(task => {
               const date = task.createdAt.toISOString().split('T')[0];
               if (!dailyStats[date]) {
                    dailyStats[date] = {
                         date,
                         created: 0,
                         completed: 0,
                         inProgress: 0
                    };
               }

               dailyStats[date].created++;

               if (task.status === 'COMPLETED') {
                    dailyStats[date].completed++;
               } else if (['IN_PROGRESS', 'REVIEW'].includes(task.status)) {
                    dailyStats[date].inProgress++;
               }
          });

          // Calculate efficiency metrics
          const completedTasks = tasks.filter(t => t.status === 'COMPLETED' && t.actualHours);
          const efficiency = completedTasks.map(t => ({
               taskId: t.id,
               estimated: t.estimatedHours || 0,
               actual: t.actualHours || 0,
               variance: ((t.actualHours || 0) - (t.estimatedHours || 0)) / (t.estimatedHours || 1) * 100
          }));

          const avgEfficiency = efficiency.reduce((sum, e) => sum + e.variance, 0) / (efficiency.length || 1);

          // Calculate priority distribution
          const priorityDistribution = {
               critical: tasks.filter(t => t.priority === 'CRITICAL').length,
               high: tasks.filter(t => t.priority === 'HIGH').length,
               medium: tasks.filter(t => t.priority === 'MEDIUM').length,
               low: tasks.filter(t => t.priority === 'LOW').length
          };

          return NextResponse.json({
               stats: {
                    period: {
                         start: startDate,
                         end: now,
                         days
                    },
                    trends: Object.values(dailyStats),
                    efficiency: {
                         average: avgEfficiency,
                         byTask: efficiency.slice(0, 10) // Last 10 tasks
                    },
                    priorities: priorityDistribution,
                    completion: {
                         rate: tasks.length > 0
                              ? (tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100
                              : 0,
                         averageTimeToComplete: completedTasks.reduce((sum, t) => {
                              if (t.completedAt && t.createdAt) {
                                   const hours = (new Date(t.completedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
                                   return sum + hours;
                              }
                              return sum;
                         }, 0) / (completedTasks.length || 1)
                    }
               }
          });

     } catch (error) {
          console.error('Developer stats fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch developer stats' },
               { status: 500 }
          );
     }
}