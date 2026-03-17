
// // app/
// import { NextResponse } from 'next/server';
// import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
// import prisma from '../../../../../../lib/prisma';

// export async function POST(request, { params }) {
//      try {
//           const { projectId } = params;
//           const { teamLeadId } = await request.json();

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

//           // Verify project exists and is managed by this PM
//           const project = await prisma.project.findFirst({
//                where: {
//                     id: projectId,
//                     managerId: decoded.id
//                }
//           });

//           if (!project) {
//                return NextResponse.json(
//                     { error: 'Project not found or access denied' },
//                     { status: 404 }
//                );
//           }

//           // Update project with team lead
//           const updatedProject = await prisma.project.update({
//                where: { id: projectId },
//                data: { teamLeadId },
//                include: {
//                     teamLead: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true
//                          }
//                     }
//                }
//           });

//           // Create notification for team lead
//           await prisma.notification.create({
//                data: {
//                     type: 'PROJECT_UPDATE',
//                     title: 'Assigned as Team Lead',
//                     message: `You have been assigned as Team Lead for project: ${project.name}`,
//                     link: `/team-lead/projects/${projectId}`,
//                     userId: teamLeadId,
//                     metadata: {
//                          projectId,
//                          projectName: project.name,
//                          assignedBy: decoded.name
//                     }
//                }
//           });

//           // Log activity
//           await prisma.activityLog.create({
//                data: {
//                     action: 'ASSIGN_TEAM_LEAD',
//                     entityType: 'project',
//                     entityId: projectId,
//                     details: {
//                          projectName: project.name,
//                          teamLeadId,
//                          teamLeadName: updatedProject.teamLead?.name
//                     },
//                     userId: decoded.id
//                }
//           });

//           return NextResponse.json({
//                success: true,
//                message: 'Team lead assigned successfully',
//                project: updatedProject
//           });

//      } catch (error) {
//           console.error('Assign team lead error:', error);
//           return NextResponse.json(
//                { error: 'Failed to assign team lead' },
//                { status: 500 }
//           );
//      }
// }

// app/api/project-manager/projects/[projectId]/assign-lead/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
     try {
          const { projectId } = await params;
          const token = request.cookies.get('accessToken')?.value;
          const { teamLeadId } = await request.json();

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

          // Verify team lead exists and has correct role
          if (teamLeadId) {
               const teamLead = await prisma.user.findFirst({
                    where: {
                         id: teamLeadId,
                         role: 'TEAM_LEAD',
                         status: 'ACTIVE'
                    }
               });

               if (!teamLead) {
                    return NextResponse.json({ error: 'Team lead not found' }, { status: 404 });
               }
          }

          // Update project with team lead
          const updatedProject = await prisma.project.update({
               where: { id: projectId },
               data: { teamLeadId: teamLeadId || null },
               include: {
                    manager: { select: { id: true, name: true } },
                    teamLead: { select: { id: true, name: true, email: true } }
               }
          });

          // Create notification for team lead if assigned
          if (teamLeadId) {
               await prisma.notification.create({
                    data: {
                         type: 'PROJECT_UPDATE',
                         title: 'New Project Assignment',
                         message: `You have been assigned as Team Lead for project: ${project.name}`,
                         userId: teamLeadId,
                         link: `/team-lead/projects/${projectId}`,
                         metadata: {
                              projectId,
                              projectName: project.name,
                              assignedBy: decoded.name
                         }
                    }
               });
          }

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: teamLeadId ? 'ASSIGN_TEAM_LEAD' : 'REMOVE_TEAM_LEAD',
                    entityType: 'project',
                    entityId: projectId,
                    details: {
                         projectName: project.name,
                         teamLeadId,
                         previousTeamLeadId: project.teamLeadId
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               message: teamLeadId ? 'Team lead assigned successfully' : 'Team lead removed',
               project: updatedProject
          });

     } catch (error) {
          console.error('Assign Team Lead API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}