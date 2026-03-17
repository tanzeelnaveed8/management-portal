
// app/api/developer/tasks/[taskId]/status/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

function determineMilestoneStatus(tasks) {
     const total = tasks.length;
     if (total === 0) return 'PENDING';

     const completed = tasks.filter(t => t.status === 'COMPLETED').length;
     const hasBlocked = tasks.some(t => t.status === 'BLOCKED');
     const hasInProgressOrReview = tasks.some(t => ['IN_PROGRESS', 'REVIEW'].includes(t.status));

     if (completed === total) return 'COMPLETED';
     if (hasBlocked) return 'DELAYED';
     if (hasInProgressOrReview) return 'IN_PROGRESS';
     return 'PENDING';
}
///////////
export async function PATCH(request, { params }) {
     try {
          const { taskId } = await params;
          const token = request.cookies.get('accessToken')?.value;
          const { status, reviewNotes } = await request.json();

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'DEVELOPER') {
               return NextResponse.json(
                    { error: 'Access denied. Only developers can update task status.' },
                    { status: 403 }
               );
          }

          const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED'];
          if (!validStatuses.includes(status)) {
               return NextResponse.json(
                    { error: 'Invalid status value' },
                    { status: 400 }
               );
          }
          const task = await prisma.task.findFirst({
               where: { id: taskId, assigneeId: decoded.id },
               include: {
                    project: { select: { id: true, name: true, teamLeadId: true, managerId: true } },
                    milestone: { select: { id: true } }
               }
          });

          if (!task) {
               return NextResponse.json({ error: 'Task not found' }, { status: 404 });
          }

          // Update task itself
          const updateData = { status, updatedAt: new Date() };
          if (status === 'IN_PROGRESS' && task.status === 'NOT_STARTED') updateData.startDate = new Date();
          if (status === 'COMPLETED') updateData.completedAt = new Date();
          if (status === 'REVIEW' && reviewNotes) {
               updateData.reviewNotes = reviewNotes;
               updateData.reviewRequested = true;
          }

          const updatedTask = await prisma.task.update({
               where: { id: taskId },
               data: updateData,
               include: { project: { select: { id: true, name: true } }, milestone: { select: { id: true, name: true } } }
          });

          // ========== RECALCULATE MILESTONE ==========
          if (task.milestoneId) {
               const milestoneTasks = await prisma.task.findMany({
                    where: { milestoneId: task.milestoneId },
                    select: { status: true }
               });

               const total = milestoneTasks.length;
               const completed = milestoneTasks.filter(t => t.status === 'COMPLETED').length;
               const milestoneProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
               const milestoneStatus = determineMilestoneStatus(milestoneTasks);

               await prisma.milestone.update({
                    where: { id: task.milestoneId },
                    data: { progress: milestoneProgress, status: milestoneStatus }
               });
          }

          // ========== RECALCULATE PROJECT ==========
          const projectTasks = await prisma.task.findMany({
               where: { projectId: task.project.id },
               select: { status: true }
          });

          const totalProject = projectTasks.length;
          const completedProject = projectTasks.filter(t => t.status === 'COMPLETED').length;
          const projectProgress = totalProject > 0 ? Math.round((completedProject / totalProject) * 100) : 0;

          let projectStatusUpdate = {};
          const allProjectTasksCompleted = completedProject === totalProject && totalProject > 0;
          if (allProjectTasksCompleted) {
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

          // ========== NOTIFICATIONS ==========
          if (status === 'REVIEW' && task.project.teamLeadId) {
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
                              reviewNotes: reviewNotes || null
                         }
                    }
               });
          }

          if (status === 'BLOCKED' && task.project.managerId) {
               await prisma.notification.create({
                    data: {
                         type: 'SYSTEM_ALERT',
                         title: 'Task Blocked - Attention Required',
                         message: `Task "${task.title}" has been marked as blocked`,
                         userId: task.project.managerId,
                         link: `/project-manager/tasks/${taskId}`,
                         metadata: {
                              taskId,
                              taskTitle: task.title,
                              projectId: task.project.id,
                              projectName: task.project.name,
                              developerName: decoded.name
                         }
                    }
               });
          }

          // ========== ACTIVITY LOG ==========
          await prisma.activityLog.create({
               data: {
                    action: 'UPDATE_TASK_STATUS',
                    entityType: 'task',
                    entityId: taskId,
                    details: {
                         oldStatus: task.status,
                         newStatus: status,
                         taskTitle: task.title,
                         projectName: task.project.name,
                         reviewNotes: reviewNotes || null
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               message: 'Task status updated successfully',
               task: updatedTask
          });


     } catch (error) {
          console.error('Update Task Status API Error:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}