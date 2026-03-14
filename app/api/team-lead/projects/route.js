
// app/api/team-lead/projects/route.js
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

          // Check if user is Team Lead or higher
          if (!['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Parse query parameters
          const { searchParams } = new URL(request.url);
          const search = searchParams.get('search') || '';
          const status = searchParams.get('status');
          const priority = searchParams.get('priority');
          const riskLevel = searchParams.get('riskLevel');

          // Build filter conditions
          const where = {
               OR: [
                    { teamLeadId: decoded.id }, // Projects where user is team lead
                    { managerId: decoded.id },   // Projects where user is manager
                    { createdById: decoded.id }  // Projects created by user
               ]
          };

          // Add search filter
          if (search) {
               where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { clientName: { contains: search, mode: 'insensitive' } }
               ];
          }

          // Add status filter
          if (status && status !== 'ALL') {
               where.status = status;
          }

          // Add priority filter
          if (priority && priority !== 'ALL') {
               where.priority = priority;
          }

          // Add risk level filter
          if (riskLevel && riskLevel !== 'ALL') {
               where.riskLevel = riskLevel;
          }

          // Fetch projects with related data
          const projects = await prisma.project.findMany({
               where,
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
                    tasks: {
                         select: {
                              id: true,
                              status: true,
                              priority: true,
                              assigneeId: true
                         }
                    },
                    _count: {
                         select: {
                              tasks: true,
                              milestones: true,
                              documents: true
                         }
                    }
               },
               orderBy: {
                    updatedAt: 'desc'
               }
          });

          // Calculate additional metrics
          const projectsWithMetrics = projects.map(project => {
               const totalTasks = project.tasks.length;
               const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
               const inProgressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
               const blockedTasks = project.tasks.filter(t => t.status === 'BLOCKED').length;

               // Calculate days until deadline
               const daysUntilDeadline = project.deadline
                    ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;

               return {
                    ...project,
                    taskStats: {
                         total: totalTasks,
                         completed: completedTasks,
                         inProgress: inProgressTasks,
                         blocked: blockedTasks
                    },
                    daysUntilDeadline,
                    progress: totalTasks > 0
                         ? Math.round((completedTasks / totalTasks) * 100)
                         : project.progress || 0
               };
          });

          return NextResponse.json({ projects: projectsWithMetrics });

     } catch (error) {
          console.error('Team Lead projects fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch projects' },
               { status: 500 }
          );
     }
}

export async function POST(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;
          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          const body = await request.json();

          // Validate required fields
          if (!body.name || !body.clientName || !body.clientEmail) {
               return NextResponse.json(
                    { error: 'Missing required fields' },
                    { status: 400 }
               );
          }

          // Create project
          const project = await prisma.project.create({
               data: {
                    name: body.name,
                    description: body.description,
                    status: body.status || 'UPCOMING',
                    priority: body.priority || 'MEDIUM',
                    startDate: body.startDate ? new Date(body.startDate) : null,
                    deadline: body.deadline ? new Date(body.deadline) : null,
                    budget: body.budget ? parseFloat(body.budget) : null,
                    clientName: body.clientName,
                    clientEmail: body.clientEmail,
                    clientCompany: body.clientCompany,
                    clientPhone: body.clientPhone,
                    managerId: body.managerId || decoded.id,
                    teamLeadId: decoded.role === 'TEAM_LEAD' ? decoded.id : body.teamLeadId,
                    createdById: decoded.id
               },
               include: {
                    manager: { select: { id: true, name: true, email: true } },
                    teamLead: { select: { id: true, name: true, email: true } }
               }
          });

          return NextResponse.json(project, { status: 201 });

     } catch (error) {
          console.error('Project creation error:', error);
          return NextResponse.json(
               { error: 'Failed to create project' },
               { status: 500 }
          );
     }
}