
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

          // Verify user is a developer
          if (decoded.role !== 'DEVELOPER') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Parse query parameters
          const { searchParams } = new URL(request.url);
          const status = searchParams.get('status');
          const search = searchParams.get('search');

          // Build filter - developers see projects they have tasks in
          let whereClause = {
               tasks: {
                    some: {
                         assigneeId: decoded.id
                    }
               }
          };

          // Add status filter if provided
          if (status && status !== 'all') {
               whereClause.status = status;
          }

          // Add search filter if provided
          if (search) {
               whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { clientName: { contains: search, mode: 'insensitive' } },
                    { clientCompany: { contains: search, mode: 'insensitive' } }
               ];
          }

          // Fetch projects with related data
          const projects = await prisma.project.findMany({
               where: whereClause,
               include: {
                    manager: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    teamLead: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    _count: {
                         select: {
                              tasks: true
                         }
                    },
                    tasks: {
                         where: {
                              assigneeId: decoded.id
                         },
                         select: {
                              id: true,
                              status: true
                         }
                    }
               },
               orderBy: [
                    { isDelayed: 'desc' },
                    { updatedAt: 'desc' }
               ]
          });

          // Calculate task counts for this developer specifically
          const formattedProjects = projects.map(project => {
               const totalTasks = project.tasks.length;
               const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;

               return {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    priority: project.priority,
                    progress: project.progress,
                    riskLevel: project.riskLevel,
                    isDelayed: project.isDelayed,
                    deadline: project.deadline,
                    clientName: project.clientName,
                    clientCompany: project.clientCompany,
                    taskCount: totalTasks,
                    completedTaskCount: completedTasks,
                    manager: project.manager,
                    teamLead: project.teamLead,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt
               };
          });

          return NextResponse.json({
               projects: formattedProjects,
               total: formattedProjects.length
          });

     } catch (error) {
          console.error('Developer projects fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch projects' },
               { status: 500 }
          );
     }
}