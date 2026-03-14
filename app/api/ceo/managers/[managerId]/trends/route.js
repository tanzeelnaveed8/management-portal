
// app/api/ceo/managers/[managerId]/trends/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { managerId } = await params; 
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

          // Get manager's projects with historical data
          const projects = await prisma.project.findMany({
               where: {
                    managerId
               },
               include: {
                    tasks: {
                         select: {
                              status: true,
                              createdAt: true,
                              completedAt: true
                         }
                    },
                    feedbacks: {
                         select: {
                              isApproved: true,
                              createdAt: true
                         }
                    }
               },
               orderBy: {
                    createdAt: 'asc'
               }
          });

          // Group by month for trend analysis
          const monthlyData = {};

          projects.forEach(project => {
               const month = new Date(project.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });

               if (!monthlyData[month]) {
                    monthlyData[month] = {
                         month,
                         projects: 0,
                         completedProjects: 0,
                         tasksCompleted: 0,
                         approvals: 0,
                         avgProgress: 0
                    };
               }

               monthlyData[month].projects++;
               if (project.status === 'COMPLETED') monthlyData[month].completedProjects++;

               const completedTasks = project.tasks?.filter(t => t.status === 'COMPLETED').length || 0;
               monthlyData[month].tasksCompleted += completedTasks;

               const approvals = project.feedbacks?.filter(f => f.isApproved).length || 0;
               monthlyData[month].approvals += approvals;
          });

          // Calculate averages
          Object.values(monthlyData).forEach(data => {
               data.avgProgress = data.projects > 0
                    ? Math.round((data.completedProjects / data.projects) * 100)
                    : 0;
          });

          return NextResponse.json({
               trends: Object.values(monthlyData)
          });

     } catch (error) {
          console.error('Manager trends error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch trends' },
               { status: 500 }
          );
     }
}