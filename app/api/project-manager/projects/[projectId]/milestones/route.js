
// app/api/project-manager/projects/[projectId]/milestones/route.js

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

          // Validate input
          const { name, description, deadline, startDate } = body;
          if (!name || name.trim() === '') {
               return NextResponse.json(
                    { error: 'Milestone name is required' },
                    { status: 400 }
               );
          }

          // Create milestone
          const milestone = await prisma.milestone.create({
               data: {
                    name,
                    description: description || '',
                    startDate: startDate ? new Date(startDate) : null,
                    deadline: deadline ? new Date(deadline) : null,
                    projectId,
                    status: 'PENDING'
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'CREATE_MILESTONE',
                    entityType: 'project',
                    entityId: projectId,
                    details: {
                         milestoneName: name,
                         projectName: project.name
                    },
                    userId: decoded.id
               }
          });

          // Notify team lead if assigned
          if (project.teamLeadId) {
               await prisma.notification.create({
                    data: {
                         type: 'MILESTONE_REACHED',
                         title: 'New Milestone Added',
                         message: `Milestone "${name}" added to project ${project.name}`,
                         link: `/team-lead/projects/${projectId}`,
                         userId: project.teamLeadId,
                         metadata: {
                              projectId,
                              milestoneId: milestone.id
                         }
                    }
               });
          }

          return NextResponse.json({
               success: true,
               message: 'Milestone created successfully',
               milestone
          }, { status: 201 });

     } catch (error) {
          console.error('Create Milestone API Error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to create milestone' },
               { status: 500 }
          );
     }
}

// Optional GET endpoint – if you need to fetch milestones separately
export async function GET(request, { params }) {
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

          const milestones = await prisma.milestone.findMany({
               where: {
                    projectId,
                    project: { managerId: decoded.id }
               },
               include: {
                    tasks: { select: { id: true, status: true } }
               },
               orderBy: { deadline: 'asc' }
          });

          const milestonesWithProgress = milestones.map(m => {
               const total = m.tasks.length;
               const completed = m.tasks.filter(t => t.status === 'COMPLETED').length;
               return {
                    ...m,
                    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
                    tasksCount: total,
                    completedTasks: completed
               };
          });

          return NextResponse.json({ milestones: milestonesWithProgress });

     } catch (error) {
          console.error('Fetch Milestones API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}