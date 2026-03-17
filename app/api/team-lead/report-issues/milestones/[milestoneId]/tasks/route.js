

/// app/api/team-lead/report-issues/milestones/[milestoneId]/tasks/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../../lib/auth/jwt';
import prisma from '../../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { milestoneId } = params;
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

          // Get tasks for the milestone
          const tasks = await prisma.task.findMany({
               where: {
                    milestoneId
               },
               select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    assignee: {
                         select: {
                              id: true,
                              name: true
                         }
                    }
               },
               orderBy: [
                    { priority: 'desc' },
                    { deadline: 'asc' }
               ]
          });

          return NextResponse.json({ tasks });

     } catch (error) {
          console.error('Tasks fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch tasks' },
               { status: 500 }
          );
     }
}