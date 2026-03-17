

// app/api/team-lead/tasks/[taskId]/issues/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;
          const body = await request.json();

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Validate required fields
          const { projectId, title, description, severity, affectedTasks, proposedSolution } = body;

          if (!projectId || !title || !description) {
               return NextResponse.json(
                    { error: 'Project, title, and description are required' },
                    { status: 400 }
               );
          }

          // Verify project access
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    OR: [
                         { teamLeadId: decoded.id },
                         { managerId: decoded.id }
                    ]
               },
               include: {
                    manager: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    }
               }
          });

          if (!project) {
               return NextResponse.json(
                    { error: 'Project not found or access denied' },
                    { status: 404 }
               );
          }

          // Create issue (using ActivityLog as issues for now)
          const issue = await prisma.activityLog.create({
               data: {
                    action: 'REPORT_ISSUE',
                    entityType: 'project',
                    entityId: projectId,
                    userId: decoded.id,
                    details: {
                         title,
                         description,
                         severity: severity || 'MEDIUM',
                         affectedTasks: affectedTasks || [],
                         proposedSolution,
                         status: 'OPEN',
                         reportedAt: new Date().toISOString(),
                         projectName: project.name,
                         projectManager: project.manager
                    }
               }
          });

          // Create notification for project manager
          if (project.managerId) {
               await prisma.notification.create({
                    data: {
                         type: 'SYSTEM_ALERT',
                         title: `Issue Reported: ${title}`,
                         message: `Team Lead reported an issue in ${project.name}`,
                         userId: project.managerId,
                         link: `/project-manager/projects/${projectId}/issues`,
                         metadata: {
                              issueId: issue.id,
                              severity,
                              reportedBy: decoded.name
                         }
                    }
               });
          }

          return NextResponse.json({
               message: 'Issue reported successfully',
               issue: {
                    id: issue.id,
                    title,
                    severity,
                    status: 'OPEN',
                    createdAt: issue.createdAt
               }
          }, { status: 201 });

     } catch (error) {
          console.error('Issue reporting error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}