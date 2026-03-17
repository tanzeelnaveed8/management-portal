
// app/api/team-lead/developers/minimal/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Minimal query with only essential fields
          const users = await prisma.user.findMany({
               where: { role: 'DEVELOPER' },
               select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    jobTitle: true,
                    department: true,
                    isActive: true
               }
          });

          // Transform to expected format
          const developers = users.map(user => ({
               id: user.id,
               name: user.name,
               email: user.email,
               avatar: user.avatar,
               jobTitle: user.jobTitle || 'Developer',
               department: user.department || 'Engineering',
               status: user.isActive ? 'ACTIVE' : 'INACTIVE',
               stats: {
                    completed: 0,
                    ongoing: 0,
                    overdue: 0,
                    total: 0
               },
               workload: 0,
               currentTasks: 0,
               maxWorkload: 8,
               recentTasks: []
          }));

          return NextResponse.json({
               developers,
               filters: {
                    departments: [...new Set(developers.map(d => d.department).filter(Boolean))],
                    totalCount: developers.length,
                    workloadDistribution: { low: 0, medium: 0, high: 0 }
               }
          });

     } catch (error) {
          console.error('Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}