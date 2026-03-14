
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { developerId } = await params;
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

          // Verify developer exists
          const developer = await prisma.user.findFirst({
               where: {
                    id: developerId,
                    role: 'DEVELOPER'
               }
          });

          if (!developer) {
               return NextResponse.json(
                    { error: 'Developer not found' },
                    { status: 404 }
               );
          }

          // Fetch tasks assigned to this developer
          const tasks = await prisma.task.findMany({
               where: {
                    assigneeId: developerId,
                    project: {
                         teamLeadId: decoded.id // Only tasks from projects this team lead manages
                    }
               },
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    milestone: {
                         select: {
                              id: true,
                              name: true
                         }
                    }
               },
               orderBy: [
                    { deadline: 'asc' },
                    { createdAt: 'desc' }
               ]
          });

          // Calculate additional metrics
          const now = new Date();
          const tasksWithMeta = tasks.map(task => ({
               ...task,
               isOverdue: task.deadline && new Date(task.deadline) < now && task.status !== 'COMPLETED'
          }));

          return NextResponse.json({ tasks: tasksWithMeta });

     } catch (error) {
          console.error('Fetch developer tasks error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}