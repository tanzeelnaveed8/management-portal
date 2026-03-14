// app/api/project-manager/clients/[clientEmail]/feedback/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          // IMPORTANT: Unwrap params Promise
          const { clientEmail } = await params;
          const decodedEmail = decodeURIComponent(clientEmail);

          console.log('Fetching feedback for client email:', decodedEmail);

          const token = request.cookies.get('accessToken')?.value;

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

          // Get all projects for this client
          const projects = await prisma.project.findMany({
               where: {
                    managerId: decoded.id,
                    clientEmail: decodedEmail
               },
               select: {
                    id: true,
                    name: true
               }
          });

          const projectIds = projects.map(p => p.id);

          if (projectIds.length === 0) {
               return NextResponse.json(
                    {
                         feedbacks: [], stats: {
                              total: 0, approved: 0, pending: 0, rejected: 0, revisions: 0, averageRating: 0
                         }
                    }
               );
          }

          // Get all feedback for these projects
          const feedbacks = await prisma.clientFeedback.findMany({
               where: {
                    projectId: {
                         in: projectIds
                    }
               },
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    createdBy: {
                         select: {
                              id: true,
                              name: true,
                              role: true
                         }
                    },
                    attachments: true
               },
               orderBy: {
                    createdAt: 'desc'
               }
          });

          // Calculate feedback statistics
          const stats = {
               total: feedbacks.length,
               approved: feedbacks.filter(f => f.isApproved).length,
               pending: feedbacks.filter(f => f.status === 'PENDING').length,
               rejected: feedbacks.filter(f => f.status === 'REJECTED').length,
               revisions: feedbacks.reduce((sum, f) => sum + (f.revisionCount || 0), 0),
               averageRating: feedbacks.filter(f => f.rating).length > 0
                    ? Number((feedbacks.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) /
                         feedbacks.filter(f => f.rating).length).toFixed(1))
                    : 0
          };

          return NextResponse.json({
               feedbacks,
               stats
          });

     } catch (error) {
          console.error('Client feedback fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch feedback: ' + error.message },
               { status: 500 }
          );
     }
}