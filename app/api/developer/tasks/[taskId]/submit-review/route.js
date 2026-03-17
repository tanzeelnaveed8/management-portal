
// app/api/developer/tasks/[taskId]/submit-review/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
     try {
          const { taskId } = await params;
          const token = request.cookies.get('accessToken')?.value;
          const { notes } = await request.json();

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'DEVELOPER') {
               return NextResponse.json(
                    { error: 'Access denied. Only developers can submit tasks for review.' },
                    { status: 403 }
               );
          }

          // Find the task and ensure it belongs to this developer
          const task = await prisma.task.findFirst({
               where: {
                    id: taskId,
                    assigneeId: decoded.id
               },
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true,
                              teamLeadId: true,
                              managerId: true
                         }
                    },
                    milestone: {
                         select: {
                              id: true
                         }
                    }
               }
          });

          if (!task) {
               return NextResponse.json(
                    { error: 'Task not found or you do not have permission to submit it' },
                    { status: 404 }
               );
          }

          // Cannot submit if already in review or completed
          if (task.status === 'REVIEW') {
               return NextResponse.json(
                    { error: 'Task is already in review' },
                    { status: 400 }
               );
          }

          // Update task to REVIEW status
          const updatedTask = await prisma.task.update({
               where: { id: taskId },
               data: {
                    status: 'REVIEW',
                    reviewNotes: notes || '',
                    reviewRequested: true,
                    updatedAt: new Date()
               },
               include: {
                    project: { select: { id: true, name: true } },
                    milestone: { select: { id: true, name: true } }
               }
          });

          // ========== RECALCULATE MILESTONE PROGRESS ==========
          if (task.milestoneId) {
               const milestoneTasks = await prisma.task.findMany({
                    where: { milestoneId: task.milestoneId },
                    select: { status: true }
               });
               const total = milestoneTasks.length;
               const completed = milestoneTasks.filter(t => t.status === 'COMPLETED').length;
               const milestoneProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

               // Determine milestone status
               const hasBlocked = milestoneTasks.some(t => t.status === 'BLOCKED');
               const hasInProgressOrReview = milestoneTasks.some(t => ['IN_PROGRESS', 'REVIEW'].includes(t.status));
               let milestoneStatus = 'PENDING';
               if (completed === total) milestoneStatus = 'COMPLETED';
               else if (hasBlocked) milestoneStatus = 'DELAYED';
               else if (hasInProgressOrReview) milestoneStatus = 'IN_PROGRESS';

               await prisma.milestone.update({
                    where: { id: task.milestoneId },
                    data: {
                         progress: milestoneProgress,
                         status: milestoneStatus
                    }
               });
          }

          // ========== RECALCULATE PROJECT PROGRESS ==========
          const projectTasks = await prisma.task.findMany({
               where: { projectId: task.project.id },
               select: { status: true }
          });
          const totalProject = projectTasks.length;
          const completedProject = projectTasks.filter(t => t.status === 'COMPLETED').length;
          const projectProgress = totalProject > 0 ? Math.round((completedProject / totalProject) * 100) : 0;

          let projectStatusUpdate = {};
          if (completedProject === totalProject && totalProject > 0) {
               projectStatusUpdate.status = 'COMPLETED';
               projectStatusUpdate.completedAt = new Date();
          }

          await prisma.project.update({
               where: { id: task.project.id },
               data: {
                    progress: projectProgress,
                    taskCount: totalProject,
                    completedTaskCount: completedProject,
                    ...projectStatusUpdate
               }
          });

          // ========== NOTIFY TEAM LEAD ==========
          if (task.project.teamLeadId) {
               await prisma.notification.create({
                    data: {
                         type: 'TASK_REVIEW',
                         title: 'Task Ready for Review',
                         message: `Task "${task.title}" is ready for your review`,
                         userId: task.project.teamLeadId,
                         link: `/team-lead/tasks/${taskId}`,
                         metadata: {
                              taskId,
                              taskTitle: task.title,
                              projectId: task.project.id,
                              projectName: task.project.name,
                              developerName: decoded.name,
                              reviewNotes: notes || null
                         }
                    }
               });
          }

          // ========== ACTIVITY LOG ==========
          await prisma.activityLog.create({
               data: {
                    action: 'SUBMIT_FOR_REVIEW',
                    entityType: 'task',
                    entityId: taskId,
                    details: {
                         taskTitle: task.title,
                         projectName: task.project.name,
                         notes: notes || null
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               message: 'Task submitted for review successfully',
               task: updatedTask
          });

     } catch (error) {
          console.error('Submit for review API Error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to submit task for review' },
               { status: 500 }
          );
     }
}