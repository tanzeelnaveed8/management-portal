
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
     try {
          const { projectId } = await params;
          const token = request.cookies.get('accessToken')?.value;
          const body = await request.json();

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Verify project access
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    managerId: decoded.id
               }
          });

          if (!project) {
               return NextResponse.json(
                    { error: 'Project not found or access denied' },
                    { status: 404 }
               );
          }

          // Validate required fields
          const { title, description, priority, deadline, milestoneId } = body;
          if (!title || title.trim() === '') {
               return NextResponse.json(
                    { error: 'Task title is required' },
                    { status: 400 }
               );
          }

          // If milestoneId provided, verify it belongs to this project
          if (milestoneId) {
               const milestone = await prisma.milestone.findFirst({
                    where: {
                         id: milestoneId,
                         projectId
                    }
               });

               if (!milestone) {
                    return NextResponse.json(
                         { error: 'Milestone not found in this project' },
                         { status: 400 }
                    );
               }
          }

          // Create the task
          const task = await prisma.task.create({
               data: {
                    title,
                    description: description || '',
                    priority: priority || 'MEDIUM',
                    deadline: deadline ? new Date(deadline) : null,
                    projectId,
                    milestoneId: milestoneId || null,
                    createdById: decoded.id,
                    status: 'NOT_STARTED'
               },
               include: {
                    milestone: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    project: {
                         select: {
                              name: true
                         }
                    }
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'CREATE_TASK',
                    entityType: 'project',
                    entityId: projectId,
                    details: {
                         taskTitle: title,
                         projectName: project.name,
                         milestoneName: task.milestone?.name
                    },
                    userId: decoded.id
               }
          });

          // Notify team lead if assigned
          if (project.teamLeadId) {
               await prisma.notification.create({
                    data: {
                         type: 'TASK_ASSIGNED',
                         title: 'New Task Created',
                         message: `Task "${title}" created in project ${project.name}`,
                         link: `/team-lead/projects/${projectId}`,
                         userId: project.teamLeadId,
                         metadata: {
                              projectId,
                              taskId: task.id,
                              milestoneId: milestoneId
                         }
                    }
               });
          }

          return NextResponse.json({
               success: true,
               message: 'Task created successfully',
               task
          }, { status: 201 });

     } catch (error) {
          console.error('Create Task API Error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to create task' },
               { status: 500 }
          );
     }
}

// Optional: GET endpoint to fetch tasks for a project
export async function GET(request, { params }) {
     try {
          const { projectId } = await params;
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
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Fetch tasks with filters
          const { searchParams } = new URL(request.url);
          const milestoneId = searchParams.get('milestoneId');
          const status = searchParams.get('status');
          const assigneeId = searchParams.get('assigneeId');

          const where = {
               projectId,
               project: { managerId: decoded.id }
          };

          if (milestoneId) where.milestoneId = milestoneId;
          if (status) where.status = status;
          if (assigneeId) where.assigneeId = assigneeId;

          const tasks = await prisma.task.findMany({
               where,
               include: {
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true
                         }
                    },
                    milestone: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    createdBy: {
                         select: {
                              name: true
                         }
                    }
               },
               orderBy: [
                    { deadline: 'asc' },
                    { createdAt: 'desc' }
               ]
          });

          // Calculate stats
          const stats = {
               total: tasks.length,
               notStarted: tasks.filter(t => t.status === 'NOT_STARTED').length,
               inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
               review: tasks.filter(t => t.status === 'REVIEW').length,
               completed: tasks.filter(t => t.status === 'COMPLETED').length,
               blocked: tasks.filter(t => t.status === 'BLOCKED').length,
               overdue: tasks.filter(t =>
                    t.status !== 'COMPLETED' &&
                    t.deadline &&
                    new Date(t.deadline) < new Date()
               ).length
          };

          return NextResponse.json({
               tasks,
               stats
          });

     } catch (error) {
          console.error('Fetch Tasks API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}