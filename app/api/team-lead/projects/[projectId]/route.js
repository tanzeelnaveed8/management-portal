

// app/api/team-lead/projects/[projectId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { projectId } = await params;

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

          // Check if user has appropriate role
          if (!['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Fetch project with all related data
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    OR: [
                         { teamLeadId: decoded.id },
                         { managerId: decoded.id },
                         { createdById: decoded.id }
                    ]
               },
               include: {
                    manager: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true
                         }
                    },
                    teamLead: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true
                         }
                    },
                    createdBy: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    _count: {
                         select: {
                              tasks: true,
                              milestones: true,
                              documents: true,
                              feedbacks: true
                         }
                    }
               }
          });

          if (!project) {
               return NextResponse.json(
                    { error: 'Project not found' },
                    { status: 404 }
               );
          }

          // Calculate additional metrics
          const tasksStats = await prisma.task.aggregate({
               where: { projectId },
               _count: true,
               _sum: {
                    estimatedHours: true,
                    actualHours: true
               }
          });

          const completedTasks = await prisma.task.count({
               where: {
                    projectId,
                    status: 'COMPLETED'
               }
          });

          const projectWithStats = {
               ...project,
               taskStats: {
                    total: tasksStats._count,
                    completed: completedTasks,
                    estimatedHours: tasksStats._sum.estimatedHours || 0,
                    actualHours: tasksStats._sum.actualHours || 0
               },
               progress: tasksStats._count > 0
                    ? Math.round((completedTasks / tasksStats._count) * 100)
                    : project.progress || 0
          };

          return NextResponse.json({ project: projectWithStats });

     } catch (error) {
          console.error('Project fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch project' },
               { status: 500 }
          );
     }
}