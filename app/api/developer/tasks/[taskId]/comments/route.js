// app/api/developer/tasks/[taskId]/comments/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
     try {
          // ✅ IMPORTANT: Await the params
          const { taskId } = await params;
          const { content, parentId } = await request.json();

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

          // Validate input
          if (!content || content.trim().length === 0) {
               return NextResponse.json(
                    { error: 'Comment content is required' },
                    { status: 400 }
               );
          }

          // Check if task exists
          const task = await prisma.task.findUnique({
               where: { id: taskId },
               include: {
                    project: {
                         select: {
                              id: true,
                              teamLeadId: true,
                              managerId: true
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

          // Verify access
          const hasAccess = task.assigneeId === decoded.id ||
               task.project.teamLeadId === decoded.id ||
               task.project.managerId === decoded.id ||
               decoded.role === 'CEO';

          if (!hasAccess) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Create comment
          const comment = await prisma.comment.create({
               data: {
                    content,
                    taskId,
                    authorId: decoded.id,
                    parentId: parentId || null
               },
               include: {
                    author: {
                         select: {
                              id: true,
                              name: true,
                              avatar: true,
                              role: true
                         }
                    }
               }
          });

          // Create notifications for relevant users
          const notifyUserIds = new Set();

          // Notify task assignee if different from commenter
          if (task.assigneeId && task.assigneeId !== decoded.id) {
               notifyUserIds.add(task.assigneeId);
          }

          // Notify team lead
          if (task.project.teamLeadId && task.project.teamLeadId !== decoded.id) {
               notifyUserIds.add(task.project.teamLeadId);
          }

          // Notify project manager
          if (task.project.managerId && task.project.managerId !== decoded.id) {
               notifyUserIds.add(task.project.managerId);
          }

          // Create notifications
          for (const userId of notifyUserIds) {
               await prisma.notification.create({
                    data: {
                         type: 'TASK_COMMENT',
                         title: 'New Comment on Task',
                         message: `${decoded.name} commented on ${task.title}`,
                         link: `/developer/tasks/${taskId}`,
                         userId,
                         metadata: {
                              taskId,
                              taskTitle: task.title,
                              commentId: comment.id,
                              commenterName: decoded.name
                         }
                    }
               });
          }

          return NextResponse.json({
               success: true,
               comment
          });

     } catch (error) {
          console.error('Add comment error:', error);
          return NextResponse.json(
               { error: 'Failed to add comment' },
               { status: 500 }
          );
     }
}

export async function GET(request, { params }) {
     try {
          // ✅ IMPORTANT: Await the params here too
          const { taskId } = await params;

          // Get token from cookies
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          // Verify token
          const decoded = verifyAccessToken(token);
          if (!decoded) {
               return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
               );
          }

          // Fetch comments
          const comments = await prisma.comment.findMany({
               where: {
                    taskId,
                    parentId: null // Top-level comments only
               },
               include: {
                    author: {
                         select: {
                              id: true,
                              name: true,
                              avatar: true,
                              role: true
                         }
                    },
                    replies: {
                         include: {
                              author: {
                                   select: {
                                        id: true,
                                        name: true,
                                        avatar: true
                                   }
                              }
                         },
                         orderBy: {
                              createdAt: 'asc'
                         }
                    }
               },
               orderBy: {
                    createdAt: 'desc'
               }
          });

          return NextResponse.json({ comments });

     } catch (error) {
          console.error('Fetch comments error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch comments' },
               { status: 500 }
          );
     }
}