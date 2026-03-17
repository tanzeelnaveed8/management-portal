
// // app/api/project-manager/projects/route.js
// import { NextResponse } from 'next/server';
// import { verifyAccessToken } from '../../../../lib/auth/jwt';
// import prisma from '../../../../lib/prisma';
// import { z } from 'zod';

// const projectSchema = z.object({
//      name: z.string().min(3, 'Project name must be at least 3 characters'),
//      description: z.string().optional(),
//      scope: z.string().optional(),
//      deadline: z.string().optional(),
//      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
//      teamLeadId: z.string().optional(),
//      clientName: z.string().min(2, 'Client name is required'),
//      clientEmail: z.string().email('Valid client email is required'),
//      clientCompany: z.string().optional(),
//      clientPhone: z.string().optional(),
//      startDate: z.string().optional(),
//      budget: z.number().optional()
// });

// export async function POST(request) {
//      try {
//           const token = request.cookies.get('accessToken')?.value;

//           if (!token) {
//                return NextResponse.json(
//                     { error: 'Not authenticated' },
//                     { status: 401 }
//                );
//           }

//           const decoded = verifyAccessToken(token);
//           if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
//                return NextResponse.json(
//                     { error: 'Access denied' },
//                     { status: 403 }
//                );
//           }

//           const body = await request.json();

//           // Validate input
//           const validation = projectSchema.safeParse(body);
//           if (!validation.success) {
//                return NextResponse.json(
//                     { error: 'Invalid input', details: validation.error.errors },
//                     { status: 400 }
//                );
//           }

//           const data = validation.data;

//           // Create project
//           const project = await prisma.project.create({
//                data: {
//                     name: data.name,
//                     description: data.description || data.scope,
//                     status: 'UPCOMING',
//                     priority: data.priority,
//                     startDate: data.startDate ? new Date(data.startDate) : new Date(),
//                     deadline: data.deadline ? new Date(data.deadline) : null,
//                     budget: data.budget,
//                     clientName: data.clientName,
//                     clientEmail: data.clientEmail,
//                     clientCompany: data.clientCompany,
//                     clientPhone: data.clientPhone,
//                     managerId: decoded.id,
//                     teamLeadId: data.teamLeadId,
//                     createdById: decoded.id,
//                     progress: 0
//                },
//                include: {
//                     manager: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true
//                          }
//                     },
//                     teamLead: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true
//                          }
//                     }
//                }
//           });

//           // Create activity log
//           await prisma.activityLog.create({
//                data: {
//                     action: 'CREATE_PROJECT',
//                     entityType: 'project',
//                     entityId: project.id,
//                     details: {
//                          projectName: project.name,
//                          clientName: project.clientName
//                     },
//                     userId: decoded.id
//                }
//           });

//           // Notify team lead if assigned
//           if (data.teamLeadId) {
//                await prisma.notification.create({
//                     data: {
//                          type: 'PROJECT_UPDATE',
//                          title: 'New Project Assigned',
//                          message: `You have been assigned as Team Lead for project: ${project.name}`,
//                          link: `/team-lead/projects/${project.id}`,
//                          userId: data.teamLeadId,
//                          metadata: {
//                               projectId: project.id,
//                               projectName: project.name,
//                               assignedBy: decoded.name
//                          }
//                     }
//                });
//           }

//           return NextResponse.json({
//                success: true,
//                message: 'Project created successfully',
//                project
//           });

//      } catch (error) {
//           console.error('Create project error:', error);
//           return NextResponse.json(
//                { error: 'Failed to create project' },
//                { status: 500 }
//           );
//      }
// }

// app/api/project-manager/projects/[projectId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';


async function refreshAccessToken(request) {
     try {
          const response = await fetch(new URL('/api/auth/refresh', request.url), {
               method: 'POST',
               headers: {
                    Cookie: request.headers.get('cookie') || ''
               }
          });

          if (response.ok) {
               // Get the new cookies from the refresh response
               const newCookies = response.headers.getSetCookie();
               return { success: true, cookies: newCookies };
          }
          return { success: false };
     } catch {
          return { success: false };
     }
}

// GET all projects for project manager
export async function GET(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Fetch all projects managed by this project manager
          const projects = await prisma.project.findMany({
               where: {
                    managerId: decoded.id
               },
               include: {
                    teamLead: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    _count: {
                         select: {
                              tasks: true,
                              milestones: true
                         }
                    }
               },
               orderBy: {
                    createdAt: 'desc'
               }
          });

          // Calculate additional stats for each project
          const projectsWithStats = await Promise.all(projects.map(async (project) => {
               // Get tasks for this project to calculate progress
               const tasks = await prisma.task.findMany({
                    where: { projectId: project.id },
                    select: { status: true, deadline: true }
               });

               const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
               const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

               // Check if project is overdue
               const isOverdue = project.deadline &&
                    new Date(project.deadline) < new Date() &&
                    project.status !== 'COMPLETED';

               // Calculate days until deadline
               const daysUntilDeadline = project.deadline ?
                    Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

               return {
                    ...project,
                    progress,
                    tasksCount: tasks.length,
                    completedTasks,
                    isOverdue,
                    daysUntilDeadline,
                    milestonesCount: project._count.milestones
               };
          }));

          return NextResponse.json({ projects: projectsWithStats });

     } catch (error) {
          console.error('Projects API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}

// POST - Create a new project
export async function POST(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Parse request body
          const body = await request.json();

          // Validate required fields
          if (!body.name || !body.clientName || !body.clientEmail) {
               return NextResponse.json(
                    { error: 'Missing required fields: name, clientName, clientEmail' },
                    { status: 400 }
               );
          }

          // Create the project - FIXED VERSION
          const project = await prisma.project.create({
               data: {
                    name: body.name,
                    description: body.description || '',
                    status: body.status || 'UPCOMING',
                    priority: body.priority || 'MEDIUM',

                    // Dates
                    startDate: body.startDate ? new Date(body.startDate) : null,
                    deadline: body.deadline ? new Date(body.deadline) : null,

                    // Budget
                    budget: body.budget ? parseFloat(body.budget) : null,

                    // Risk
                    riskLevel: body.riskLevel || 'LOW',

                    // Client Info
                    clientName: body.clientName,
                    clientEmail: body.clientEmail,
                    clientCompany: body.clientCompany || null,
                    clientPhone: body.clientPhone || null,

                    // Relations - ✅ DIRECT FOREIGN KEY ASSIGNMENT
                    managerId: decoded.id,
                    createdById: decoded.id,
                    teamLeadId: body.teamLeadId || null,  // Simple and works with MongoDB
               },
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
                    }
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'CREATE_PROJECT',
                    entityType: 'project',
                    entityId: project.id,
                    details: { projectName: project.name },
                    userId: decoded.id
               }
          });

          // Notify team lead if assigned
          if (body.teamLeadId) {
               await prisma.notification.create({
                    data: {
                         type: 'PROJECT_UPDATE',
                         title: 'New Project Assigned',
                         message: `You have been assigned as Team Lead for project: ${project.name}`,
                         link: `/team-lead/projects/${project.id}`,
                         userId: body.teamLeadId,
                         metadata: {
                              projectId: project.id,
                              projectName: project.name,
                              assignedBy: decoded.name
                         }
                    }
               });
          }

          return NextResponse.json({
               success: true,
               project,
               message: 'Project created successfully'
          }, { status: 201 });

     } catch (error) {
          console.error('Create Project API Error:', error);

          // Handle Prisma-specific errors
          if (error.code === 'P2002') {
               return NextResponse.json(
                    { error: 'A project with this name already exists' },
                    { status: 409 }
               );
          }

          if (error.code === 'P2003') {
               return NextResponse.json(
                    { error: 'Invalid team lead ID provided' },
                    { status: 400 }
               );
          }

          return NextResponse.json(
               { error: error.message || 'Failed to create project' },
               { status: 500 }
          );
     }
}

// Update project
export async function PATCH(request, { params }) {
     try {
          const { projectId } = await params;
          const token = request.cookies.get('accessToken')?.value;
          const body = await request.json();

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Verify project access
          const existingProject = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    managerId: decoded.id
               }
          });

          if (!existingProject) {
               return NextResponse.json({ error: 'Project not found' }, { status: 404 });
          }

          // Update project
          const updatedProject = await prisma.project.update({
               where: { id: projectId },
               data: {
                    name: body.name,
                    description: body.description,
                    status: body.status,
                    priority: body.priority,
                    deadline: body.deadline ? new Date(body.deadline) : null,
                    budget: body.budget,
                    riskLevel: body.riskLevel,
                    clientName: body.clientName,
                    clientEmail: body.clientEmail,
                    clientCompany: body.clientCompany,
                    clientPhone: body.clientPhone
               },
               include: {
                    manager: { select: { id: true, name: true } },
                    teamLead: { select: { id: true, name: true } }
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'UPDATE_PROJECT',
                    entityType: 'project',
                    entityId: projectId,
                    details: { changes: body },
                    userId: decoded.id
               }
          });

          return NextResponse.json({ project: updatedProject });

     } catch (error) {
          console.error('Update Project API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}

// Delete project
export async function DELETE(request, { params }) {
     try {
          const { projectId } = await params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Verify project access
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    managerId: decoded.id
               }
          });

          if (!project) {
               return NextResponse.json({ error: 'Project not found' }, { status: 404 });
          }

          // Soft delete or archive? Let's archive it
          const archivedProject = await prisma.project.update({
               where: { id: projectId },
               data: { status: 'ARCHIVED' }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'ARCHIVE_PROJECT',
                    entityType: 'project',
                    entityId: projectId,
                    details: { projectName: project.name },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               message: 'Project archived successfully'
          });

     } catch (error) {
          console.error('Delete Project API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}