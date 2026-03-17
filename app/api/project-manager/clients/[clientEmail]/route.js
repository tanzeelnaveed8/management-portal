// app/api/project-manager/clients/[clientEmail]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          // IMPORTANT: Unwrap params Promise in Next.js 15
          const { clientEmail } = await params;
          const decodedEmail = decodeURIComponent(clientEmail);

          console.log('Fetching client details for email:', decodedEmail);

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
               include: {
                    teamLead: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              avatar: true
                         }
                    },
                    _count: {
                         select: {
                              milestones: true,
                              tasks: true,
                              documents: true,
                              feedbacks: true
                         }
                    }
               },
               orderBy: {
                    createdAt: 'desc'
               }
          });

          console.log(`Found ${projects.length} projects for client`);

          if (projects.length === 0) {
               return NextResponse.json(
                    { error: 'Client not found' },
                    { status: 404 }
               );
          }

          // Get additional data for each project
          const projectsWithDetails = await Promise.all(projects.map(async (project) => {
               // Get milestone progress
               const milestones = await prisma.milestone.findMany({
                    where: { projectId: project.id },
                    select: {
                         id: true,
                         name: true,
                         status: true,
                         deadline: true,
                         progress: true,
                         isDelayed: true
                    },
                    orderBy: { deadline: 'asc' }
               });

               // Get recent feedback
               const recentFeedback = await prisma.clientFeedback.findMany({
                    where: { projectId: project.id },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: {
                         createdBy: {
                              select: { name: true, role: true }
                         }
                    }
               });

               // Get pending reviews
               const pendingReviews = await prisma.task.count({
                    where: {
                         projectId: project.id,
                         status: 'REVIEW'
                    }
               });

               return {
                    id: project.id,
                    name: project.name,
                    status: project.status,
                    progress: project.progress,
                    budget: project.budget,
                    cost: project.cost,
                    startDate: project.startDate,
                    deadline: project.deadline,
                    isDelayed: project.isDelayed,
                    teamLead: project.teamLead,
                    milestoneCount: project._count.milestones,
                    taskCount: project._count.tasks,
                    documentCount: project._count.documents,
                    feedbackCount: project._count.feedbacks,
                    pendingReviews,
                    milestones,
                    recentFeedback
               };
          }));

          // Get all feedback across projects
          const allFeedbacks = await prisma.clientFeedback.findMany({
               where: {
                    projectId: {
                         in: projects.map(p => p.id)
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
               },
               take: 50 // Limit to latest 50 feedbacks
          });

          // Get all documents
          const allDocuments = await prisma.document.findMany({
               where: {
                    projectId: {
                         in: projects.map(p => p.id)
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
                              name: true
                         }
                    }
               },
               orderBy: {
                    uploadedAt: 'desc'
               },
               take: 50
          });

          // Aggregate client data
          const client = {
               email: decodedEmail,
               name: projects[0].clientName,
               company: projects[0].clientCompany || 'Independent',
               phone: projects[0].clientPhone || 'Not provided',
               projects: projectsWithDetails,
               feedbacks: allFeedbacks,
               documents: allDocuments,
               totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
               totalCost: projects.reduce((sum, p) => sum + (p.cost || 0), 0),
               activeProjects: projects.filter(p =>
                    ['ACTIVE', 'IN_DEVELOPMENT'].includes(p.status)
               ).length,
               completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
               stats: {
                    totalProjects: projects.length,
                    totalFeedbacks: allFeedbacks.length,
                    totalDocuments: allDocuments.length,
                    approvedFeedbacks: allFeedbacks.filter(f => f.isApproved).length,
                    pendingFeedbacks: allFeedbacks.filter(f => f.status === 'PENDING').length,
                    averageRating: allFeedbacks.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) /
                         (allFeedbacks.filter(f => f.rating).length || 1)
               }
          };

          return NextResponse.json({ client });

     } catch (error) {
          console.error('Client details fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch client details: ' + error.message },
               { status: 500 }
          );
     }
}