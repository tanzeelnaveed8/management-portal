

// app/api/team-lead/report-issues/projects/[projectId]/milestones/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../../lib/auth/jwt';
import prisma from '../../../../../../../lib/prisma';


export async function GET(request, { params }) {
     try {
          const { projectId } = params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'TEAM_LEAD') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Verify project access
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    teamLeadId: decoded.id
               }
          });

          if (!project) {
               return NextResponse.json(
                    { error: 'Project not found or access denied' },
                    { status: 404 }
               );
          }

          // Get milestones for the project
          const milestones = await prisma.milestone.findMany({
               where: {
                    projectId
               },
               select: {
                    id: true,
                    name: true,
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