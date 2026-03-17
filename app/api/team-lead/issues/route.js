import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
     try {
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
                    { error: 'Access denied. Only Team Leads can report issues.' },
                    { status: 403 }
               );
          }

          const body = await request.json();
          const { projectId, title, description, severity, affectedTasks, proposedSolution } = body;

          // Validate required fields
          if (!projectId || !title || !description) {
               return NextResponse.json(
                    { error: 'Project ID, title, and description are required' },
                    { status: 400 }
               );
          }

          // Verify the project exists and team lead has access
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    teamLeadId: decoded.id
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
                    { error: 'Project not found or you do not have access' },
                    { status: 404 }
               );
          }

          // Create activity log for the issue
          await prisma.activityLog.create({
               data: {
                    action: 'REPORT_ISSUE',
                    entityType: 'project',
                    entityId: projectId,
                    details: {
                         issueTitle: title,
                         severity,
                         description,
                         proposedSolution,
                         affectedTasks: affectedTasks || []
                    },
                    userId: decoded.id
               }
          });

          // Create notification for the Project Manager
          if (project.managerId) {
               await prisma.notification.create({
                    data: {
                         type: 'SYSTEM_ALERT',
                         title: `🚨 Issue Reported: ${title}`,
                         message: `Team Lead ${decoded.name} reported an issue in project "${project.name}"`,
                         userId: project.managerId,
                         link: `/project-manager/projects/${projectId}`,
                         metadata: {
                              projectId,
                              projectName: project.name,
                              reportedBy: decoded.name,
                              severity,
                              issueTitle: title,
                              description,
                              proposedSolution: proposedSolution || null,
                              affectedTasks: affectedTasks || []
                         }
                    }
               });
          }

          // Optional: Send email notification (if you have email service)
          // await sendEmailNotification(project.manager.email, {
          //   subject: `Issue Reported: ${title}`,
          //   template: 'issue-report',
          //   data: { ... }
          // });

          return NextResponse.json({
               success: true,
               message: 'Issue reported successfully',
               data: {
                    issueId: `ISS-${Date.now()}`,
                    reportedAt: new Date().toISOString()
               }
          });

     } catch (error) {
          console.error('Report Issue API Error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to report issue' },
               { status: 500 }
          );
     }
}

// Optional: GET endpoint to fetch reported issues
export async function GET(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          const { searchParams } = new URL(request.url);
          const projectId = searchParams.get('projectId');

          // Build where clause
          const where = {};
          if (projectId) {
               where.entityId = projectId;
               where.entityType = 'project';
          }
          where.action = 'REPORT_ISSUE';

          // Fetch issues from activity logs
          const issues = await prisma.activityLog.findMany({
               where,
               include: {
                    user: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true
                         }
                    }
               },
               orderBy: {
                    createdAt: 'desc'
               }
          });

          // Parse the details JSON
          const formattedIssues = issues.map(issue => ({
               id: issue.id,
               ...issue.details,
               reportedBy: issue.user,
               reportedAt: issue.createdAt
          }));

          return NextResponse.json({ issues: formattedIssues });

     } catch (error) {
          console.error('Fetch Issues API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}