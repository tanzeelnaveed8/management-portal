
// ap
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

          // Verify user is a Project Manager
          if (decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json(
                    { error: 'Access denied. Only Project Managers can access this resource.' },
                    { status: 403 }
               );
          }

          // Fetch all active team leads with their project counts
          const teamLeads = await prisma.user.findMany({
               where: {
                    role: 'TEAM_LEAD',
                    status: 'ACTIVE'
               },
               select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    jobTitle: true,
                    department: true,
                    _count: {
                         select: {
                              projectsLed: {
                                   where: {
                                        status: {
                                             in: ['ACTIVE', 'IN_DEVELOPMENT']
                                        }
                                   }
                              }
                         }
                    }
               },
               orderBy: {
                    name: 'asc'
               }
          });

          // Also fetch unassigned projects for context
          const unassignedProjects = await prisma.project.count({
               where: {
                    teamLeadId: null,
                    managerId: decoded.id
               }
          });

          return NextResponse.json({
               teamLeads,
               unassignedProjects,
               total: teamLeads.length
          });

     } catch (error) {
          console.error('Team leads fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch team leads. Please try again.' },
               { status: 500 }
          );
     }
}