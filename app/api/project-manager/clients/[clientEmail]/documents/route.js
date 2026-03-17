// app/api/project-manager/clients/[clientEmail]/documents/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          // IMPORTANT: Unwrap params Promise
          const { clientEmail } = await params;
          const decodedEmail = decodeURIComponent(clientEmail);

          console.log('Fetching documents for client email:', decodedEmail);

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
                    id: true
               }
          });

          const projectIds = projects.map(p => p.id);

          if (projectIds.length === 0) {
               return NextResponse.json({ documents: [] });
          }

          // Get all documents for these projects
          const documents = await prisma.document.findMany({
               where: {
                    projectId: {
                         in: projectIds
                    },
                    type: 'CLIENT_REQUIREMENT'
               },
               include: {
                    project: {
                         select: {
                              id: true,
                              name: true
                         }
                    },
                    uploadedBy: {
                         select: {
                              id: true,
                              name: true
                         }
                    }
               },
               orderBy: {
                    uploadedAt: 'desc'
               }
          });

          return NextResponse.json({ documents });

     } catch (error) {
          console.error('Client documents fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch documents: ' + error.message },
               { status: 500 }
          );
     }
}