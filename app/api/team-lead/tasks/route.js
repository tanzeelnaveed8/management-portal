
// app/api/team-lead/tasks/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';


export async function GET(request) {
     try {
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

          // Parse query parameters
          const { searchParams } = new URL(request.url);
          const status = searchParams.get('status');
          const projectId = searchParams.get('projectId');
          const assigneeId = searchParams.get('assigneeId');
          const search = searchParams.get('search');
          const sortBy = searchParams.get('sortBy') || 'deadline';
          const sortOrder = searchParams.get('sortOrder') || 'asc';

          // Build filter
          let whereClause = {
               project: {
                    teamLeadId: decoded.id
               }
          };

          if (status && status !== 'all') {
               whereClause.status = status;
          }

          if (projectId) {
               whereClause.projectId = projectId;
          }

          if (assigneeId) {
               whereClause.assigneeId = assigneeId;
          }

          if (search) {
               whereClause.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { project: { name: { contains: search, mode: 'insensitive' } } }
               ];
          }

          // Build sort
          let orderBy = {};
          switch (sortBy) {
               case 'deadline':
                    orderBy.deadline = sortOrder;
                    break;
               case 'priority':
                    orderBy.priority = sortOrder;
                    break;
               case 'status':
                    orderBy.status = sortOrder;
                    break;
               case 'createdAt':
                    orderBy.createdAt = sortOrder;
                    break;
               default:
                    orderBy.deadline = 'asc';
          }

          const tasks = await prisma.task.findMany({
               where: whereClause,
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
                    },
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true,
                              jobTitle: true
                         }
                    },
                    _count: {
                         select: {
                              comments: true,
                              attachments: true
                         }
                    }
               },
               orderBy
          });

          // Calculate additional metrics
          const now = new Date();
          const tasksWithMeta = tasks.map(task => ({
               ...task,
               isOverdue: task.deadline && new Date(task.deadline) < now && task.status !== 'COMPLETED',
               daysUntilDeadline: task.deadline
                    ? Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24))
                    : null
          }));

          // Get filter options
          const projects = await prisma.project.findMany({
               where: { teamLeadId: decoded.id },
               select: { id: true, name: true }
          });

          const developers = await prisma.user.findMany({
               where: {
                    role: 'DEVELOPER',
                    assignedTasks: {
                         some: {
                              project: {
                                   teamLeadId: decoded.id
                              }
                         }
                    }
               },
               select: { id: true, name: true }
          });

          return NextResponse.json({
               tasks: tasksWithMeta,
               filters: {
                    projects,
                    developers
               }
          });

     } catch (error) {
          console.error('Team lead tasks error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch tasks' },
               { status: 500 }
          );
     }
}

export async function POST(request) {
     try {
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

          const body = await request.json();
          const {
               title,
               description,
               milestoneId,
               assigneeId,
               deadline,
               estimatedHours,
               priority
          } = body;

          // Validate required fields
          if (!title || !milestoneId || !assigneeId) {
               return NextResponse.json(
                    { error: 'Missing required fields' },
                    { status: 400 }
               );
          }

          // Verify milestone belongs to team lead's project
          const milestone = await prisma.milestone.findUnique({
               where: { id: milestoneId },
               include: {
                    project: {
                         select: { teamLeadId: true, id: true }
                    }
               }
          });

          if (!milestone || milestone.project.teamLeadId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Access denied to this milestone' },
                    { status: 403 }
               );
          }

          // Create task
          const task = await prisma.task.create({
               data: {
                    title,
                    description,
                    status: 'NOT_STARTED',
                    priority: priority || 'MEDIUM',
                    deadline: deadline ? new Date(deadline) : null,
                    estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
                    projectId: milestone.projectId,
                    milestoneId,
                    assigneeId,
                    createdById: decoded.id
               },
               include: {
                    assignee: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    milestone: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    project: {
                         select: {
                              id: true,
                              name: true
                         }
                    }
               }
          });

          // Create notification for developer
          await prisma.notification.create({
               data: {
                    type: 'TASK_ASSIGNED',
                    title: 'New Task Assigned',
                    message: `You have been assigned a new task: ${title}`,
                    link: `/developer/tasks/${task.id}`,
                    userId: assigneeId,
                    metadata: {
                         taskId: task.id,
                         taskTitle: title,
                         projectName: milestone.project.name,
                         assignedBy: decoded.name
                    }
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'CREATE_TASK',
                    entityType: 'task',
                    entityId: task.id,
                    details: {
                         title,
                         milestone: milestone.name,
                         assignee: task.assignee.name
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               task,
               message: 'Task created successfully'
          });

     } catch (error) {
          console.error('Create task error:', error);
          return NextResponse.json(
               { error: 'Failed to create task' },
               { status: 500 }
          );
     }
}

// app/api/team-lead/tasks/route.js
// import { NextResponse } from 'next/server';
// import { verifyAccessToken } from '../../../../lib/auth/jwt';
// import prisma from '../../../../lib/prisma';

// export async function POST(request) {
//      try {
//           const token = request.cookies.get('accessToken')?.value;
//           const body = await request.json();

//           if (!token) {
//                return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//           }

//           const decoded = verifyAccessToken(token);
//           if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
//                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//           }

//           // Validate required fields
//           const { title, projectId, milestoneId, assigneeId, deadline, priority, description } = body;

//           if (!title || !projectId) {
//                return NextResponse.json(
//                     { error: 'Title and project are required' },
//                     { status: 400 }
//                );
//           }

//           // Verify project access
//           const project = await prisma.project.findFirst({
//                where: {
//                     id: projectId,
//                     OR: [
//                          { teamLeadId: decoded.id },
//                          { managerId: decoded.id }
//                     ]
//                }
//           });

//           if (!project) {
//                return NextResponse.json(
//                     { error: 'Project not found or access denied' },
//                     { status: 404 }
//                );
//           }

//           // Create task
//           const task = await prisma.task.create({
//                data: {
//                     title,
//                     description,
//                     priority: priority || 'MEDIUM',
//                     deadline: deadline ? new Date(deadline) : null,
//                     projectId,
//                     milestoneId: milestoneId || null,
//                     assigneeId: assigneeId || null,
//                     createdById: decoded.id,
//                     status: 'NOT_STARTED'
//                },
//                include: {
//                     assignee: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true,
//                               avatar: true
//                          }
//                     },
//                     milestone: true,
//                     project: {
//                          select: {
//                               id: true,
//                               name: true
//                          }
//                     }
//                }
//           });

//           // Update project task count
//           await prisma.project.update({
//                where: { id: projectId },
//                data: {
//                     taskCount: { increment: 1 }
//                }
//           });

//           // Create notification for assignee
//           if (assigneeId) {
//                await prisma.notification.create({
//                     data: {
//                          type: 'TASK_ASSIGNED',
//                          title: 'New Task Assigned',
//                          message: `You have been assigned a new task: ${title}`,
//                          userId: assigneeId,
//                          link: `/developer/tasks/${task.id}`,
//                          metadata: {
//                               taskId: task.id,
//                               projectId,
//                               assignedBy: decoded.name
//                          }
//                     }
//                });
//           }

//           return NextResponse.json(task, { status: 201 });

//      } catch (error) {
//           console.error('Task creation error:', error);
//           return NextResponse.json(
//                { error: error.message },
//                { status: 500 }
//           );
//      }
// }

// export async function GET(request) {
//      try {
//           const token = request.cookies.get('accessToken')?.value;

//           if (!token) {
//                return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//           }

//           const decoded = verifyAccessToken(token);
//           if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
//                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//           }

//           // Get query params
//           const { searchParams } = new URL(request.url);
//           const projectId = searchParams.get('projectId');
//           const milestoneId = searchParams.get('milestoneId');
//           const status = searchParams.get('status');
//           const assigneeId = searchParams.get('assigneeId');

//           // Build where clause
//           const where = {
//                project: {
//                     teamLeadId: decoded.id
//                }
//           };

//           if (projectId) where.projectId = projectId;
//           if (milestoneId) where.milestoneId = milestoneId;
//           if (status) where.status = status;
//           if (assigneeId) where.assigneeId = assigneeId;

//           // Fetch tasks with filters
//           const tasks = await prisma.task.findMany({
//                where,
//                include: {
//                     assignee: {
//                          select: {
//                               id: true,
//                               name: true,
//                               avatar: true
//                          }
//                     },
//                     project: {
//                          select: {
//                               id: true,
//                               name: true
//                          }
//                     },
//                     milestone: {
//                          select: {
//                               id: true,
//                               name: true
//                          }
//                     }
//                },
//                orderBy: [
//                     { priority: 'desc' },
//                     { deadline: 'asc' }
//                ]
//           });

//           return NextResponse.json({ tasks });

//      } catch (error) {
//           console.error('Tasks fetch error:', error);
//           return NextResponse.json(
//                { error: error.message },
//                { status: 500 }
//           );
//      }
// }