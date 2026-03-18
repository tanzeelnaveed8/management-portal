export const runtime = 'nodejs';

// app/api/project-manager/team-members/route.js
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
                    { error: 'Access denied. Only Project Managers can access this resource.' },
                    { status: 403 }
               );
          }

          // Return developers and team leads for task assignment
          const members = await prisma.user.findMany({
               where: {
                    status: 'ACTIVE',
                    role: { in: ['DEVELOPER', 'TEAM_LEAD'] }
               },
               select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatar: true,
                    jobTitle: true,
                    department: true
               },
               orderBy: [{ role: 'asc' }, { name: 'asc' }]
          });

          return NextResponse.json({
               members
          });
     } catch (error) {
          console.error('Team members fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch team members. Please try again.' },
               { status: 500 }
          );
     }
}
