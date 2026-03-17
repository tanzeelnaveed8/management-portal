
// app/api/team-lead/tasks/[taskId]/report/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';


export async function POST(request, { params }) {
     try {
          // ✅ FIX: Await the params
          const { taskId } = await params;
          const { issue, priority, description } = await request.json();

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

          // Get task with project info
          const task = await prisma.task.findUnique({
               where: { id: taskId },
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true,
                              managerId: true,
                              teamLeadId: true
                         }
                    },
                    assignee: {
                         select: {
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

          // Verify team lead has access
          if (task.project.teamLeadId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          if (!task.project.managerId) {
               return NextResponse.json(
                    { error: 'No project manager assigned to this project' },
                    { status: 400 }
               );
          }

          // Create issue report as a high-priority notification
          await prisma.notification.create({
               data: {
                    type: 'SYSTEM_ALERT',
                    title: `Issue Reported: ${issue}`,
                    message: `${decoded.name} reported an issue on task "${task.title}": ${description}`,
                    link: `/team-lead/tasks/${taskId}`,
                    userId: task.project.managerId,
                    metadata: {
                         taskId,
                         taskTitle: task.title,
                         projectId: task.project.id,
                         projectName: task.project.name,
                         developer: task.assignee?.name,
                         issue,
                         priority,
                         reportedBy: decoded.name,
                         reportedAt: new Date().toISOString()
                    }
               }
          });

          // Create activity log
          await prisma.activityLog.create({
               data: {
                    action: 'REPORT_ISSUE',
                    entityType: 'task',
                    entityId: taskId,
                    details: {
                         issue,
                         priority,
                         description,
                         reportedTo: task.project.managerId
                    },
                    userId: decoded.id
               }
          });

          // Optionally, update task status if critical
          if (priority === 'HIGH' || priority === 'CRITICAL') {
               await prisma.task.update({
                    where: { id: taskId },
                    data: {
                         status: 'BLOCKED',
                         reviewNotes: `BLOCKED: ${issue} - ${description}`
                    }
               });
          }

          return NextResponse.json({
               success: true,
               message: 'Issue reported to project manager successfully'
          });

     } catch (error) {
          console.error('Report issue error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to report issue' },
               { status: 500 }
          );
     }
}