

// app/api/team-lead/projects/[projectId]/milestones/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { projectId } = await params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Verify project access
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    OR: [
                         { teamLeadId: decoded.id },
                         { managerId: decoded.id },
                         { createdById: decoded.id }
                    ]
               }
          });

          if (!project) {
               return NextResponse.json({ error: 'Project not found' }, { status: 404 });
          }

          // Fetch milestones
          const milestones = await prisma.milestone.findMany({
               where: { projectId },
               select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    deadline: true
               },
               orderBy: {
                    deadline: 'asc'
               }
          });

          return NextResponse.json({ milestones });

     } catch (error) {
          console.error('Milestones fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch milestones' },
               { status: 500 }
          );
     }
}