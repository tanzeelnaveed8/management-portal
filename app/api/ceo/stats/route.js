

// app/api/ceo/stats/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;
          const { searchParams } = new URL(request.url);
          const range = searchParams.get('range') || '30days';

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'CEO') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Calculate date range
          const now = new Date();
          let startDate = new Date();
          switch (range) {
               case '7days':
                    startDate.setDate(now.getDate() - 7);
                    break;
               case '30days':
                    startDate.setDate(now.getDate() - 30);
                    break;
               case '90days':
                    startDate.setDate(now.getDate() - 90);
                    break;
               case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
               default:
                    startDate.setDate(now.getDate() - 30);
          }

          // Fetch projects in date range
          const projects = await prisma.project.findMany({
               where: {
                    createdAt: { gte: startDate }
               },
               include: {
                    tasks: true,
                    feedbacks: true
               }
          });

          // Calculate trend data
          const previousPeriodStart = new Date(startDate);
          previousPeriodStart.setDate(previousPeriodStart.getDate() - (now - startDate) / (1000 * 60 * 60 * 24));

          const previousProjects = await prisma.project.count({
               where: {
                    createdAt: {
                         gte: previousPeriodStart,
                         lt: startDate
                    }
               }
          });

          const currentProjects = projects.length;
          const projectGrowth = previousProjects > 0
               ? Math.round(((currentProjects - previousProjects) / previousProjects) * 100)
               : 0;

          // Calculate revenue trend
          const currentRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
          const previousRevenue = await prisma.project.aggregate({
               where: {
                    createdAt: {
                         gte: previousPeriodStart,
                         lt: startDate
                    }
               },
               _sum: { budget: true }
          });

          const revenueGrowth = previousRevenue._sum.budget > 0
               ? Math.round(((currentRevenue - (previousRevenue._sum.budget || 0)) / (previousRevenue._sum.budget || 1)) * 100)
               : 0;

          // Completion rate trend
          const completedNow = projects.filter(p => p.status === 'COMPLETED').length;
          const completedThen = await prisma.project.count({
               where: {
                    status: 'COMPLETED',
                    createdAt: {
                         gte: previousPeriodStart,
                         lt: startDate
                    }
               }
          });

          const completionRate = currentProjects > 0 ? Math.round((completedNow / currentProjects) * 100) : 0;
          const completionTrend = completedThen > 0
               ? Math.round(((completedNow - completedThen) / completedThen) * 100)
               : 0;

          return NextResponse.json({
               range,
               projects: {
                    current: currentProjects,
                    previous: previousProjects,
                    growth: projectGrowth
               },
               revenue: {
                    current: currentRevenue,
                    previous: previousRevenue._sum.budget || 0,
                    growth: revenueGrowth
               },
               completion: {
                    rate: completionRate,
                    trend: completionTrend
               }
          });

     } catch (error) {
          console.error('CEO Stats API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}