
//
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const clientSchema = z.object({
     name: z.string().min(2, 'Client name is required'),
     email: z.string().email('Valid email is required'),
     company: z.string().optional(),
     phone: z.string().optional(),
     projectName: z.string().min(3, 'Project name is required'),
     projectDescription: z.string().optional(),
     deadline: z.string().optional(),
     budget: z.number().optional()
});

// GET /api/project-manager/clients?search=&status=
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
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Parse query parameters for filtering
          const { searchParams } = new URL(request.url);
          const status = searchParams.get('status');
          const search = searchParams.get('search');

          // Get all projects managed by this PM to extract unique clients
          const projects = await prisma.project.findMany({
               where: {
                    managerId: decoded.id,
                    ...(status && status !== 'all' ? { status } : {})
               },
               include: {
                    feedbacks: {
                         orderBy: {
                              createdAt: 'desc'
                         },
                         take: 1
                    },
                    documents: {
                         where: {
                              type: 'CLIENT_REQUIREMENT'
                         }
                    },
                    _count: {
                         select: {
                              feedbacks: true,
                              documents: true
                         }
                    }
               },
               orderBy: {
                    updatedAt: 'desc'
               }
          });

          // Group projects by client email to create unique client records
          const clientMap = new Map();

          projects.forEach(project => {
               const clientKey = project.clientEmail;

               if (!clientMap.has(clientKey)) {
                    // Calculate client-level metrics
                    const clientProjects = projects.filter(p => p.clientEmail === clientKey);
                    const totalProgress = clientProjects.reduce((sum, p) => sum + (p.progress || 0), 0);
                    const avgProgress = clientProjects.length > 0
                         ? Math.round(totalProgress / clientProjects.length)
                         : 0;

                    const totalBudget = clientProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
                    const activeProjects = clientProjects.filter(p =>
                         p.status === 'ACTIVE' || p.status === 'IN_DEVELOPMENT'
                    ).length;

                    // Get latest feedback across all projects
                    const allFeedback = clientProjects.flatMap(p => p.feedbacks);
                    const latestFeedback = allFeedback.length > 0
                         ? allFeedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
                         : null;

                    // Calculate client status based on projects
                    let clientStatus = 'INACTIVE';
                    if (clientProjects.some(p => p.status === 'ACTIVE' || p.status === 'IN_DEVELOPMENT')) {
                         clientStatus = 'ACTIVE';
                    } else if (clientProjects.some(p => p.status === 'UPCOMING')) {
                         clientStatus = 'UPCOMING';
                    } else if (clientProjects.some(p => p.status === 'CLIENT_REVIEW')) {
                         clientStatus = 'REVIEW';
                    }

                    clientMap.set(clientKey, {
                         id: clientKey, // Using email as unique ID for now
                         name: project.clientName,
                         company: project.clientCompany || 'Independent',
                         email: project.clientEmail,
                         phone: project.clientPhone || 'Not provided',
                         activeProjects,
                         totalProjects: clientProjects.length,
                         totalProgress: avgProgress,
                         status: clientStatus,
                         lastFeedback: latestFeedback ? formatTimeAgo(latestFeedback.createdAt) : 'No feedback yet',
                         lastFeedbackContent: latestFeedback?.content,
                         totalBudget,
                         projects: clientProjects.map(p => ({
                              id: p.id,
                              name: p.name,
                              status: p.status,
                              progress: p.progress,
                              budget: p.budget
                         })),
                         documentCount: clientProjects.reduce((sum, p) => sum + p._count.documents, 0),
                         feedbackCount: clientProjects.reduce((sum, p) => sum + p._count.feedbacks, 0)
                    });
               }
          });

          // Convert map to array and filter by search if needed
          let clients = Array.from(clientMap.values());

          if (search) {
               const searchLower = search.toLowerCase();
               clients = clients.filter(client =>
                    client.name.toLowerCase().includes(searchLower) ||
                    client.company.toLowerCase().includes(searchLower) ||
                    client.email.toLowerCase().includes(searchLower)
               );
          }

          // Calculate overall stats
          const stats = {
               totalClients: clients.length,
               activeProjects: clients.reduce((sum, c) => sum + c.activeProjects, 0),
               pendingFeedback: clients.filter(c =>
                    c.projects.some(p => p.status === 'CLIENT_REVIEW')
               ).length,
               totalPortfolio: clients.reduce((sum, c) => sum + c.totalBudget, 0),
               clientsWithFeedback: clients.filter(c => c.feedbackCount > 0).length,
               clientsWithDocuments: clients.filter(c => c.documentCount > 0).length
          };

          return NextResponse.json({
               clients,
               stats
          });

     } catch (error) {
          console.error('Clients fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch clients' },
               { status: 500 }
          );
     }
}

// POST /api/project-manager/clients
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
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          const body = await request.json();

          // Validate input
          const validation = clientSchema.safeParse(body);
          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid input', details: validation.error.errors },
                    { status: 400 }
               );
          }

          const data = validation.data;

          // Check if client already exists (by email)
          const existingProjects = await prisma.project.findFirst({
               where: {
                    clientEmail: data.email,
                    managerId: decoded.id
               }
          });

          // Create initial project for this client
          const project = await prisma.project.create({
               data: {
                    name: data.projectName,
                    description: data.projectDescription,
                    status: 'UPCOMING',
                    startDate: new Date(),
                    deadline: data.deadline ? new Date(data.deadline) : null,
                    budget: data.budget,
                    clientName: data.name,
                    clientEmail: data.email,
                    clientCompany: data.company,
                    clientPhone: data.phone,
                    managerId: decoded.id,
                    createdById: decoded.id,
                    progress: 0
               }
          });

          // Create activity log
          await prisma.activityLog.create({
               data: {
                    action: 'CREATE_CLIENT',
                    entityType: 'project',
                    entityId: project.id,
                    details: {
                         clientName: data.name,
                         clientEmail: data.email,
                         projectName: data.projectName
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               message: existingProjects
                    ? 'Client already exists. New project created.'
                    : 'New client and project created successfully',
               client: {
                    name: data.name,
                    email: data.email,
                    company: data.company,
                    projectId: project.id
               }
          });

     } catch (error) {
          console.error('Create client error:', error);
          return NextResponse.json(
               { error: 'Failed to create client' },
               { status: 500 }
          );
     }
}

function formatTimeAgo(date) {
     const now = new Date();
     const diffMs = now - new Date(date);
     const diffMins = Math.floor(diffMs / (1000 * 60));
     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

     if (diffMins < 60) return `${diffMins}m ago`;
     if (diffHours < 24) return `${diffHours}h ago`;
     if (diffDays === 1) return 'Yesterday';
     if (diffDays < 7) return `${diffDays} days ago`;
     return new Date(date).toLocaleDateString();
}