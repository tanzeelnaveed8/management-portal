
// app/api/team-lead/tasks/[taskId]/assign/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function PATCH(request, { params }) {
     try {
          const { taskId } = await params;
          const { developerId } = await request.json();
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
                    { error: 'Access denied. Only Team Leads can assign tasks.' },
                    { status: 403 }
               );
          }

          // Get the task with project details to verify team lead has access
          const task = await prisma.task.findFirst({
               where: { id: taskId },
               include: {
                    project: {
                         select: {
                              id: true,
                              teamLeadId: true,
                              name: true
                         }
                    }
               }
          });

          if (!task) {
               return NextResponse.json(
                    { error: 'Task not found' },
                    { status: 404 }
               );
          }

          // Verify this team lead has access to this project
          if (task.project.teamLeadId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Access denied. You are not the team lead for this project.' },
                    { status: 403 }
               );
          }

          // If developerId is provided, verify the developer exists and has correct role
          if (developerId) {
               const developer = await prisma.user.findFirst({
                    where: {
                         id: developerId,
                         role: 'DEVELOPER',
                         status: 'ACTIVE'
                    }
               });

               if (!developer) {
                    return NextResponse.json(
                         { error: 'Developer not found or inactive' },
                         { status: 404 }
                    );
               }
          }

          // Update the task with the new assignee
          const updatedTask = await prisma.task.update({
               where: { id: taskId },
               data: {
                    assigneeId: developerId || null,
                    status: developerId ? 'NOT_STARTED' : task.status // Reset status if unassigning
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
               }
          });

          // Log the activity
          await prisma.activityLog.create({
               data: {
                    action: developerId ? 'ASSIGN_TASK' : 'UNASSIGN_TASK',
                    entityType: 'task',
                    entityId: taskId,
                    details: {
                         taskTitle: task.title,
                         projectName: task.project.name,
                         developerId: developerId || null
                    },
                    userId: decoded.id
               }
          });

          // If assigning to a developer, send notification
          if (developerId) {
               await prisma.notification.create({
                    data: {
                         type: 'TASK_ASSIGNED',
                         title: 'New Task Assigned',
                         message: `You have been assigned task: ${task.title} in project ${task.project.name}`,
                         userId: developerId,
                         link: `/developer/tasks/${taskId}`,
                         metadata: {
                              taskId,
                              projectId: task.project.id,
                              assignedBy: decoded.name
                         }
                    }
               });
          } else {
               // If unassigning, notify the previous assignee if exists
               if (task.assigneeId) {
                    await prisma.notification.create({
                         data: {
                              type: 'TASK_ASSIGNED',
                              title: 'Task Unassigned',
                              message: `Task "${task.title}" has been unassigned from you`,
                              userId: task.assigneeId,
                              link: `/developer/tasks`,
                              metadata: {
                                   taskId,
                                   projectId: task.project.id
                              }
                         }
                    });
               }
          }

          return NextResponse.json({
               success: true,
               message: developerId ? 'Task assigned successfully' : 'Task unassigned successfully',
               task: updatedTask
          });

     } catch (error) {
          console.error('Assign Task API Error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to assign task' },
               { status: 500 }
          );
     }
}