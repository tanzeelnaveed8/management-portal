// app/api/team-lead/tasks/[taskId]/comments/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
     try {
          const { taskId } = await params;
          const token = request.cookies.get('accessToken')?.value;
          const { content } = await request.json();

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'TEAM_LEAD') {
               return NextResponse.json(
                    { error: 'Access denied. Only Team Leads can comment.' },
                    { status: 403 }
               );
          }

          if (!content || content.trim() === '') {
               return NextResponse.json(
                    { error: 'Comment content is required' },
                    { status: 400 }
               );
          }

          // Verify task belongs to team lead's project
          const task = await prisma.task.findUnique({
               where: { id: taskId },
               include: {
                    project: {
                         select: { teamLeadId: true }
                    }
               }
          });

          if (!task || task.project.teamLeadId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Access denied. Task not found or you do not have permission.' },
                    { status: 403 }
               );
          }

          // Create comment
          const comment = await prisma.comment.create({
               data: {
                    content,
                    taskId,
                    authorId: decoded.id
               },
               include: {
                    author: {
                         select: {
                              id: true,
                              name: true,
                              role: true,
                              avatar: true
                         }
                    }
               }
          });

          // Notify task assignee if exists
          if (task.assigneeId) {
               await prisma.notification.create({
                    data: {
                         type: 'TASK_ASSIGNED',
                         title: 'New Comment on Your Task',
                         message: `${decoded.name} commented: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                         userId: task.assigneeId,
                         link: `/developer/tasks/${taskId}`,
                         metadata: {
                              taskId,
                              commentId: comment.id
                         }
                    }
               });
          }

          return NextResponse.json({
               success: true,
               comment
          });

     } catch (error) {
          console.error('Add Comment API Error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to add comment' },
               { status: 500 }
          );
     }
}