

// app/api/team-lead/projects/[projectId]/tasks/route.js
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
               return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
          }

          // Fetch tasks with related data
          const tasks = await prisma.task.findMany({
               where: { projectId },
               include: {
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true,
                              jobTitle: true
                         }
                    },
                    milestone: true,
                    createdBy: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    _count: {
                         select: {
                              comments: true,
                              attachments: true
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

export async function POST(request, { params }) {
     try {
          const { projectId } = await params;
          const token = request.cookies.get('accessToken')?.value;
          const body = await request.json();

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Validate required fields
          if (!body.title) {
               return NextResponse.json(
                    { error: 'Task title is required' },
                    { status: 400 }
               );
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
               return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
          }

          // Create task
          const task = await prisma.task.create({
               data: {
                    title: body.title,
                    description: body.description,
                    status: body.status || 'NOT_STARTED',
                    priority: body.priority || 'MEDIUM',
                    deadline: body.deadline ? new Date(body.deadline) : null,
                    estimatedHours: body.estimatedHours ? parseFloat(body.estimatedHours) : null,
                    projectId: projectId,
                    milestoneId: body.milestoneId,
                    assigneeId: body.assigneeId,
                    createdById: decoded.id,
                    metadata: body.metadata || {}
               },
               include: {
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true
                         }
                    },
                    milestone: true
               }
          });

          // Update project task counts
          await prisma.project.update({
               where: { id: projectId },
               data: {
                    taskCount: { increment: 1 }
               }
          });

          return NextResponse.json(task, { status: 201 });

     } catch (error) {
          console.error('Task creation error:', error);
          return NextResponse.json(
               { error: 'Failed to create task' },
               { status: 500 }
          );
     }
}