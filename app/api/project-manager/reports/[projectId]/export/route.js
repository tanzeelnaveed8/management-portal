

// app/api/project-manager/reports/[projectId]/export/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


export async function GET(request, { params }) {
     try {
          const { projectId } = params;
          const { searchParams } = new URL(request.url);
          const format = searchParams.get('format') || 'pdf';

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

          // Fetch project data with all relations
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    managerId: decoded.id
               },
               include: {
                    manager: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    teamLead: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    milestones: {
                         include: {
                              _count: {
                                   select: {
                                        tasks: true
                                   }
                              },
                              tasks: {
                                   where: {
                                        status: 'COMPLETED'
                                   }
                              }
                         },
                         orderBy: {
                              deadline: 'asc'
                         }
                    },
                    tasks: {
                         include: {
                              assignee: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              },
                              milestone: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              }
                         },
                         orderBy: [
                              { status: 'asc' },
                              { priority: 'desc' }
                         ]
                    },
                    feedbacks: {
                         orderBy: {
                              createdAt: 'desc'
                         },
                         include: {
                              createdBy: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              }
                         }
                    },
                    documents: {
                         where: {
                              type: 'CLIENT_REQUIREMENT'
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

          // Calculate metrics
          const now = new Date();
          const totalTasks = project.tasks.length;
          const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
          const overdueTasks = project.tasks.filter(t =>
               t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < now
          ).length;

          const totalMilestones = project.milestones.length;
          const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;

          const totalEstimatedHours = project.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
          const totalActualHours = project.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

          // Generate report content
          const report = {
               project: {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    priority: project.priority,
                    progress: project.progress,
                    riskLevel: project.riskLevel,
                    isDelayed: project.isDelayed,
                    startDate: project.startDate,
                    deadline: project.deadline,
                    completedAt: project.completedAt
               },
               client: {
                    name: project.clientName,
                    company: project.clientCompany,
                    email: project.clientEmail,
                    phone: project.clientPhone
               },
               team: {
                    manager: project.manager,
                    teamLead: project.teamLead
               },
               metrics: {
                    tasks: {
                         total: totalTasks,
                         completed: completedTasks,
                         inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
                         review: project.tasks.filter(t => t.status === 'REVIEW').length,
                         blocked: project.tasks.filter(t => t.status === 'BLOCKED').length,
                         overdue: overdueTasks,
                         completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
                    },
                    milestones: {
                         total: totalMilestones,
                         completed: completedMilestones,
                         inProgress: project.milestones.filter(m => m.status === 'IN_PROGRESS').length,
                         delayed: project.milestones.filter(m => m.status === 'DELAYED').length,
                         completionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
                    },
                    time: {
                         estimatedHours: totalEstimatedHours,
                         actualHours: totalActualHours,
                         variance: totalEstimatedHours > 0
                              ? Math.round(((totalActualHours - totalEstimatedHours) / totalEstimatedHours) * 100)
                              : 0,
                         efficiency: totalEstimatedHours > 0 && totalActualHours > 0
                              ? Math.round((totalEstimatedHours / totalActualHours) * 100)
                              : 0
                    },
                    financial: {
                         budget: project.budget,
                         cost: project.cost,
                         profit: (project.budget || 0) - (project.cost || 0),
                         roi: project.budget && project.cost && project.budget > 0
                              ? Math.round(((project.budget - project.cost) / project.budget) * 100)
                              : 0
                    },
                    feedback: {
                         total: project.feedbacks.length,
                         approved: project.feedbacks.filter(f => f.isApproved).length,
                         pending: project.feedbacks.filter(f => f.status === 'PENDING').length,
                         averageRating: project.feedbacks.filter(f => f.rating).reduce((sum, f) => sum + f.rating, 0) /
                              project.feedbacks.filter(f => f.rating).length || 0
                    }
               },
               milestones: project.milestones.map(m => ({
                    name: m.name,
                    status: m.status,
                    deadline: m.deadline,
                    completedAt: m.completedAt,
                    taskCount: m._count.tasks,
                    completedTasks: m.tasks.length
               })),
               recentFeedback: project.feedbacks.slice(0, 5).map(f => ({
                    content: f.content,
                    status: f.status,
                    isApproved: f.isApproved,
                    createdAt: f.createdAt,
                    from: f.createdBy.name
               })),
               generatedAt: new Date().toISOString(),
               generatedBy: decoded.name
          };

          // Generate different formats
          if (format === 'json') {
               return NextResponse.json(report);
          }
          else if (format === 'csv') {
               // Generate CSV
               const csv = generateCSV(report);
               return new NextResponse(csv, {
                    headers: {
                         'Content-Type': 'text/csv',
                         'Content-Disposition': `attachment; filename="project-${projectId}-report.csv"`
                    }
               });
          }
          else {
               // Generate HTML/PDF (simplified HTML version)
               const html = generateHTML(report);
               return new NextResponse(html, {
                    headers: {
                         'Content-Type': 'text/html',
                         'Content-Disposition': `attachment; filename="project-${projectId}-report.html"`
                    }
               });
          }

     } catch (error) {
          console.error('Report export error:', error);
          return NextResponse.json(
               { error: 'Failed to export report' },
               { status: 500 }
          );
     }
}

function generateCSV(report) {
     const rows = [];

     // Project Info
     rows.push(['Project Report', report.project.name]);
     rows.push(['Generated', new Date(report.generatedAt).toLocaleString()]);
     rows.push([]);

     // Metrics
     rows.push(['Metric', 'Value']);
     rows.push(['Status', report.project.status]);
     rows.push(['Progress', `${report.project.progress}%`]);
     rows.push(['Risk Level', report.project.riskLevel]);
     rows.push(['Tasks Completed', `${report.metrics.tasks.completed}/${report.metrics.tasks.total}`]);
     rows.push(['Milestones Completed', `${report.metrics.milestones.completed}/${report.metrics.milestones.total}`]);
     rows.push(['Budget', `$${report.metrics.financial.budget || 0}`]);
     rows.push(['Actual Cost', `$${report.metrics.financial.cost || 0}`]);
     rows.push(['ROI', `${report.metrics.financial.roi || 0}%`]);

     return rows.map(row => row.join(',')).join('\n');
}

function generateHTML(report) {
     return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Project Report - ${report.project.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2563eb; }
        .section { margin: 30px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .label { font-size: 12px; color: #6b7280; }
        .value { font-size: 18px; font-weight: bold; color: #111827; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f3f4f6; }
      </style>
    </head>
    <body>
      <h1>Project Report: ${report.project.name}</h1>
      <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
      
      <div class="section">
        <h2>Project Overview</h2>
        <div class="metric">
          <div class="label">Status</div>
          <div class="value">${report.project.status}</div>
        </div>
        <div class="metric">
          <div class="label">Progress</div>
          <div class="value">${report.project.progress}%</div>
        </div>
        <div class="metric">
          <div class="label">Risk Level</div>
          <div class="value">${report.project.riskLevel}</div>
        </div>
      </div>
      
      <div class="section">
        <h2>Client Information</h2>
        <p><strong>Name:</strong> ${report.client.name}</p>
        <p><strong>Company:</strong> ${report.client.company || 'N/A'}</p>
        <p><strong>Email:</strong> ${report.client.email}</p>
        <p><strong>Phone:</strong> ${report.client.phone || 'N/A'}</p>
      </div>
      
      <div class="section">
        <h2>Task Metrics</h2>
        <div class="metric">
          <div class="label">Total Tasks</div>
          <div class="value">${report.metrics.tasks.total}</div>
        </div>
        <div class="metric">
          <div class="label">Completed</div>
          <div class="value">${report.metrics.tasks.completed}</div>
        </div>
        <div class="metric">
          <div class="label">Completion Rate</div>
          <div class="value">${report.metrics.tasks.completionRate}%</div>
        </div>
        <div class="metric">
          <div class="label">Overdue</div>
          <div class="value">${report.metrics.tasks.overdue}</div>
        </div>
      </div>
      
      <div class="section">
        <h2>Financial Summary</h2>
        <div class="metric">
          <div class="label">Budget</div>
          <div class="value">$${report.metrics.financial.budget?.toLocaleString() || 0}</div>
        </div>
        <div class="metric">
          <div class="label">Actual Cost</div>
          <div class="value">$${report.metrics.financial.cost?.toLocaleString() || 0}</div>
        </div>
        <div class="metric">
          <div class="label">ROI</div>
          <div class="value">${report.metrics.financial.roi || 0}%</div>
        </div>
      </div>
      
      <div class="section">
        <h2>Recent Feedback</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Content</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${report.recentFeedback.map(f => `
              <tr>
                <td>${new Date(f.createdAt).toLocaleDateString()}</td>
                <td>${f.content}</td>
                <td>${f.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
}
// export async function GET(request, { params }) {
//      try {
//           const { projectId } = params;
//           const { searchParams } = new URL(request.url);
//           const format = searchParams.get('format') || 'pdf';

//           const token = request.cookies.get('accessToken')?.value;

//           if (!token) {
//                return NextResponse.json(
//                     { error: 'Not authenticated' },
//                     { status: 401 }
//                );
//           }

//           const decoded = verifyAccessToken(token);
//           if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
//                return NextResponse.json(
//                     { error: 'Access denied' },
//                     { status: 403 }
//                );
//           }

//           // Fetch project data with all relations
//           const project = await prisma.project.findFirst({
//                where: {
//                     id: projectId,
//                     managerId: decoded.id
//                },
//                include: {
//                     manager: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true
//                          }
//                     },
//                     teamLead: {
//                          select: {
//                               id: true,
//                               name: true,
//                               email: true
//                          }
//                     },
//                     milestones: {
//                          include: {
//                               _count: {
//                                    select: {
//                                         tasks: true
//                                    }
//                               },
//                               tasks: {
//                                    where: {
//                                         status: 'COMPLETED'
//                                    }
//                               }
//                          },
//                          orderBy: {
//                               deadline: 'asc'
//                          }
//                     },
//                     tasks: {
//                          include: {
//                               assignee: {
//                                    select: {
//                                         id: true,
//                                         name: true
//                                    }
//                               },
//                               milestone: {
//                                    select: {
//                                         id: true,
//                                         name: true
//                                    }
//                               }
//                          },
//                          orderBy: [
//                               { status: 'asc' },
//                               { priority: 'desc' }
//                          ]
//                     },
//                     feedbacks: {
//                          orderBy: {
//                               createdAt: 'desc'
//                          },
//                          include: {
//                               createdBy: {
//                                    select: {
//                                         id: true,
//                                         name: true
//                                    }
//                               }
//                          }
//                     },
//                     documents: {
//                          where: {
//                               type: 'CLIENT_REQUIREMENT'
//                          }
//                     }
//                }
//           });

//           if (!project) {
//                return NextResponse.json(
//                     { error: 'Project not found or access denied' },
//                     { status: 404 }
//                );
//           }

//           // Calculate metrics
//           const now = new Date();
//           const totalTasks = project.tasks.length;
//           const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
//           const overdueTasks = project.tasks.filter(t =>
//                t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < now
//           ).length;

//           const totalMilestones = project.milestones.length;
//           const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;

//           const totalEstimatedHours = project.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
//           const totalActualHours = project.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

//           // Generate report data
//           const report = {
//                project: {
//                     id: project.id,
//                     name: project.name,
//                     description: project.description,
//                     status: project.status,
//                     priority: project.priority,
//                     progress: project.progress,
//                     riskLevel: project.riskLevel,
//                     isDelayed: project.isDelayed,
//                     startDate: project.startDate,
//                     deadline: project.deadline,
//                     completedAt: project.completedAt
//                },
//                client: {
//                     name: project.clientName,
//                     company: project.clientCompany || 'Independent',
//                     email: project.clientEmail,
//                     phone: project.clientPhone || 'Not provided'
//                },
//                team: {
//                     manager: project.manager,
//                     teamLead: project.teamLead
//                },
//                metrics: {
//                     tasks: {
//                          total: totalTasks,
//                          completed: completedTasks,
//                          inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
//                          review: project.tasks.filter(t => t.status === 'REVIEW').length,
//                          blocked: project.tasks.filter(t => t.status === 'BLOCKED').length,
//                          overdue: overdueTasks,
//                          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
//                     },
//                     milestones: {
//                          total: totalMilestones,
//                          completed: completedMilestones,
//                          inProgress: project.milestones.filter(m => m.status === 'IN_PROGRESS').length,
//                          delayed: project.milestones.filter(m => m.status === 'DELAYED').length,
//                          completionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
//                     },
//                     time: {
//                          estimatedHours: totalEstimatedHours,
//                          actualHours: totalActualHours,
//                          variance: totalEstimatedHours > 0
//                               ? Math.round(((totalActualHours - totalEstimatedHours) / totalEstimatedHours) * 100)
//                               : 0,
//                          efficiency: totalEstimatedHours > 0 && totalActualHours > 0
//                               ? Math.round((totalEstimatedHours / totalActualHours) * 100)
//                               : 0
//                     },
//                     financial: {
//                          budget: project.budget || 0,
//                          cost: project.cost || 0,
//                          profit: (project.budget || 0) - (project.cost || 0),
//                          roi: project.budget && project.cost && project.budget > 0
//                               ? Math.round(((project.budget - project.cost) / project.budget) * 100)
//                               : 0
//                     }
//                },
//                milestones: project.milestones.map(m => ({
//                     name: m.name,
//                     status: m.status,
//                     deadline: m.deadline,
//                     completedAt: m.completedAt,
//                     taskCount: m._count.tasks,
//                     completedTasks: m.tasks.length
//                })),
//                recentFeedback: project.feedbacks.slice(0, 5).map(f => ({
//                     content: f.content,
//                     status: f.status,
//                     isApproved: f.isApproved,
//                     createdAt: f.createdAt,
//                     from: f.createdBy.name
//                })),
//                generatedAt: new Date().toISOString(),
//                generatedBy: decoded.name
//           };

//           // Handle different export formats
//           if (format === 'json') {
//                return NextResponse.json(report);
//           }
//           else if (format === 'csv') {
//                const csv = generateCSV(report);
//                return new NextResponse(csv, {
//                     headers: {
//                          'Content-Type': 'text/csv',
//                          'Content-Disposition': `attachment; filename="project-${projectId}-report.csv"`
//                     }
//                });
//           }
//           else if (format === 'pdf') {
//                // Generate PDF
//                const pdfBuffer = await generatePDF(report);

//                return new NextResponse(pdfBuffer, {
//                     headers: {
//                          'Content-Type': 'application/pdf',
//                          'Content-Disposition': `attachment; filename="project-${projectId}-report.pdf"`
//                     }
//                });
//           }
//           else {
//                // Generate HTML
//                const html = generateHTML(report);
//                return new NextResponse(html, {
//                     headers: {
//                          'Content-Type': 'text/html',
//                          'Content-Disposition': `attachment; filename="project-${projectId}-report.html"`
//                     }
//                });
//           }

//      } catch (error) {
//           console.error('Report export error:', error);
//           return NextResponse.json(
//                { error: 'Failed to export report: ' + error.message },
//                { status: 500 }
//           );
//      }
// }

// function generateCSV(report) {
//      const rows = [];

//      // Project Info
//      rows.push(['Project Report', report.project.name]);
//      rows.push(['Generated', new Date(report.generatedAt).toLocaleString()]);
//      rows.push([]);

//      // Metrics
//      rows.push(['Metric', 'Value']);
//      rows.push(['Status', report.project.status]);
//      rows.push(['Progress', `${report.project.progress}%`]);
//      rows.push(['Risk Level', report.project.riskLevel]);
//      rows.push(['Tasks Completed', `${report.metrics.tasks.completed}/${report.metrics.tasks.total}`]);
//      rows.push(['Milestones Completed', `${report.metrics.milestones.completed}/${report.metrics.milestones.total}`]);
//      rows.push(['Budget', `$${report.metrics.financial.budget || 0}`]);
//      rows.push(['Actual Cost', `$${report.metrics.financial.cost || 0}`]);
//      rows.push(['ROI', `${report.metrics.financial.roi || 0}%`]);

//      return rows.map(row => row.join(',')).join('\n');
// }

// async function generatePDF(report) {
//      // Create new PDF document
//      const doc = new jsPDF();

//      // Set document properties
//      doc.setProperties({
//           title: `Project Report - ${report.project.name}`,
//           subject: 'Project Status Report',
//           author: report.generatedBy,
//           creator: 'Project Management System'
//      });

//      let yPos = 20;
//      const pageWidth = doc.internal.pageSize.width;
//      const margin = 20;

//      // Helper function to safely convert any value to string
//      const safeString = (value) => {
//           if (value === null || value === undefined) return 'N/A';
//           if (typeof value === 'string') return value;
//           if (typeof value === 'number') return value.toString();
//           if (value instanceof Date) return value.toLocaleDateString();
//           return String(value);
//      };

//      // Helper function to add section headers
//      const addSectionHeader = (title) => {
//           doc.setFontSize(16);
//           doc.setFont('helvetica', 'bold');
//           doc.setTextColor(37, 99, 235); // Accent color
//           doc.text(title, margin, yPos);
//           yPos += 8;
//           doc.setDrawColor(200, 200, 200);
//           doc.line(margin, yPos, pageWidth - margin, yPos);
//           yPos += 8;
//      };

//      // Helper function to add text with safe string conversion
//      const addText = (label, value, isBold = false) => {
//           doc.setFontSize(11);
//           if (isBold) {
//                doc.setFont('helvetica', 'bold');
//                doc.setTextColor(0, 0, 0);
//           } else {
//                doc.setFont('helvetica', 'normal');
//                doc.setTextColor(100, 100, 100);
//           }

//           // Check if we need a new page
//           if (yPos > 270) {
//                doc.addPage();
//                yPos = 20;
//           }

//           const safeValue = safeString(value);
//           doc.text(`${label}: ${safeValue}`, margin, yPos);
//           yPos += 6;
//      };

//      // Helper function to add key-value pairs in columns with safe string conversion
//      const addKeyValueColumns = (items, columns = 2) => {
//           const colWidth = (pageWidth - 2 * margin) / columns;

//           items.forEach((item, index) => {
//                const col = index % columns;
//                const row = Math.floor(index / columns);
//                const xPos = margin + col * colWidth;
//                const yBase = yPos + row * 12;

//                doc.setFontSize(10);
//                doc.setFont('helvetica', 'bold');
//                doc.setTextColor(0, 0, 0);
//                doc.text(item.label, xPos, yBase);

//                doc.setFont('helvetica', 'normal');
//                doc.setTextColor(80, 80, 80);

//                const safeValue = safeString(item.value);
//                doc.text(safeValue, xPos, yBase + 5);
//           });

//           yPos += Math.ceil(items.length / columns) * 15;
//      };

//      // Title
//      doc.setFontSize(24);
//      doc.setFont('helvetica', 'bold');
//      doc.setTextColor(0, 0, 0);
//      doc.text('Project Report', margin, yPos);
//      yPos += 10;

//      // Project Name
//      doc.setFontSize(18);
//      doc.setTextColor(37, 99, 235);
//      doc.text(report.project.name, margin, yPos);
//      yPos += 15;

//      // Generated Info
//      doc.setFontSize(10);
//      doc.setFont('helvetica', 'italic');
//      doc.setTextColor(150, 150, 150);
//      doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, margin, yPos);
//      doc.text(`Generated by: ${report.generatedBy}`, pageWidth - margin - 60, yPos);
//      yPos += 15;

//      // Project Overview
//      addSectionHeader('Project Overview');

//      const overviewItems = [
//           { label: 'Status', value: report.project.status },
//           { label: 'Progress', value: `${report.project.progress}%` },
//           { label: 'Risk Level', value: report.project.riskLevel },
//           { label: 'Priority', value: report.project.priority },
//           { label: 'Start Date', value: report.project.startDate ? new Date(report.project.startDate).toLocaleDateString() : 'N/A' },
//           { label: 'Deadline', value: report.project.deadline ? new Date(report.project.deadline).toLocaleDateString() : 'N/A' }
//      ];

//      addKeyValueColumns(overviewItems, 3);
//      yPos += 5;

//      // Client Information
//      addSectionHeader('Client Information');

//      const clientItems = [
//           { label: 'Name', value: report.client.name },
//           { label: 'Company', value: report.client.company },
//           { label: 'Email', value: report.client.email },
//           { label: 'Phone', value: report.client.phone }
//      ];

//      addKeyValueColumns(clientItems, 2);
//      yPos += 5;

//      // Task Metrics
//      addSectionHeader('Task Metrics');

//      const taskItems = [
//           { label: 'Total Tasks', value: report.metrics.tasks.total },
//           { label: 'Completed', value: report.metrics.tasks.completed },
//           { label: 'In Progress', value: report.metrics.tasks.inProgress },
//           { label: 'Review', value: report.metrics.tasks.review },
//           { label: 'Blocked', value: report.metrics.tasks.blocked },
//           { label: 'Overdue', value: report.metrics.tasks.overdue },
//           { label: 'Completion Rate', value: `${report.metrics.tasks.completionRate}%` }
//      ];

//      addKeyValueColumns(taskItems, 3);
//      yPos += 5;

//      // Milestone Metrics
//      addSectionHeader('Milestone Metrics');

//      const milestoneItems = [
//           { label: 'Total Milestones', value: report.metrics.milestones.total },
//           { label: 'Completed', value: report.metrics.milestones.completed },
//           { label: 'In Progress', value: report.metrics.milestones.inProgress },
//           { label: 'Delayed', value: report.metrics.milestones.delayed },
//           { label: 'Completion Rate', value: `${report.metrics.milestones.completionRate}%` }
//      ];

//      addKeyValueColumns(milestoneItems, 3);
//      yPos += 5;

//      // Time & Financial Metrics
//      addSectionHeader('Time & Financial Metrics');

//      const timeItems = [
//           { label: 'Estimated Hours', value: `${report.metrics.time.estimatedHours}h` },
//           { label: 'Actual Hours', value: `${report.metrics.time.actualHours}h` },
//           { label: 'Variance', value: `${report.metrics.time.variance > 0 ? '+' : ''}${report.metrics.time.variance}%` },
//           { label: 'Efficiency', value: `${report.metrics.time.efficiency}%` },
//           { label: 'Budget', value: `$${report.metrics.financial.budget.toLocaleString()}` },
//           { label: 'Actual Cost', value: `$${report.metrics.financial.cost.toLocaleString()}` },
//           { label: 'Profit', value: `$${report.metrics.financial.profit.toLocaleString()}` },
//           { label: 'ROI', value: `${report.metrics.financial.roi}%` }
//      ];

//      addKeyValueColumns(timeItems, 2);
//      yPos += 10;

//      // Milestones Table
//      if (report.milestones && report.milestones.length > 0) {
//           // Check if we need a new page
//           if (yPos > 200) {
//                doc.addPage();
//                yPos = 20;
//           }

//           addSectionHeader('Milestones');

//           const tableColumn = ['Milestone', 'Status', 'Deadline', 'Tasks', 'Completed'];
//           const tableRows = [];

//           report.milestones.forEach(milestone => {
//                const milestoneRow = [
//                     safeString(milestone.name),
//                     safeString(milestone.status),
//                     milestone.deadline ? new Date(milestone.deadline).toLocaleDateString() : 'N/A',
//                     safeString(milestone.taskCount),
//                     safeString(milestone.completedTasks)
//                ];
//                tableRows.push(milestoneRow);
//           });

//           doc.autoTable({
//                head: [tableColumn],
//                body: tableRows,
//                startY: yPos,
//                margin: { left: margin, right: margin },
//                styles: { fontSize: 9, cellPadding: 3 },
//                headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
//                alternateRowStyles: { fillColor: [245, 245, 245] }
//           });

//           yPos = doc.lastAutoTable.finalY + 10;
//      }

//      // Recent Feedback
//      if (report.recentFeedback && report.recentFeedback.length > 0) {
//           // Check if we need a new page
//           if (yPos > 250) {
//                doc.addPage();
//                yPos = 20;
//           }

//           addSectionHeader('Recent Feedback');

//           report.recentFeedback.forEach((feedback, index) => {
//                doc.setFontSize(10);
//                doc.setFont('helvetica', 'bold');
//                doc.setTextColor(37, 99, 235);

//                const fromText = safeString(feedback.from);
//                const dateText = feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'Unknown date';
//                doc.text(`${fromText} - ${dateText}`, margin, yPos);
//                yPos += 5;

//                doc.setFont('helvetica', 'normal');
//                doc.setTextColor(80, 80, 80);

//                // Handle long text
//                const contentText = safeString(feedback.content);
//                const splitText = doc.splitTextToSize(`"${contentText}"`, pageWidth - 2 * margin);
//                doc.text(splitText, margin, yPos);
//                yPos += splitText.length * 5 + 5;

//                if (feedback.isApproved) {
//                     doc.setFont('helvetica', 'bold');
//                     doc.setTextColor(34, 197, 94);
//                     doc.text('✓ Approved', margin, yPos);
//                     yPos += 8;
//                }

//                // Add separator between feedback items
//                if (index < report.recentFeedback.length - 1) {
//                     doc.setDrawColor(220, 220, 220);
//                     doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
//                     yPos += 4;
//                }
//           });
//      }

//      // Footer
//      const pageCount = doc.internal.getNumberOfPages();
//      for (let i = 1; i <= pageCount; i++) {
//           doc.setPage(i);
//           doc.setFontSize(8);
//           doc.setTextColor(150, 150, 150);
//           doc.text(
//                `Generated by Project Management System - Page ${i} of ${pageCount}`,
//                margin,
//                doc.internal.pageSize.height - 10
//           );
//      }

//      // Return PDF as buffer
//      return Buffer.from(doc.output('arraybuffer'));
// }

// function generateHTML(report) {
//      return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>Project Report - ${report.project.name}</title>
//       <style>
//         body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
//         h1 { color: #2563eb; font-size: 28px; }
//         h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 30px; }
//         .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
//         .section { margin: 25px 0; }
//         .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
//         .card { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
//         .label { color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
//         .value { font-size: 18px; font-weight: bold; color: #111827; }
//         table { width: 100%; border-collapse: collapse; margin: 15px 0; }
//         th { background: #2563eb; color: white; padding: 10px; text-align: left; }
//         td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
//         tr:nth-child(even) { background: #f9fafb; }
//         .feedback { border-left: 4px solid #2563eb; padding: 10px 20px; margin: 15px 0; background: #f9fafb; }
//         .approved { color: #059669; font-weight: bold; }
//         .footer { margin-top: 50px; text-align: center; color: #9ca3af; font-size: 12px; }
//       </style>
//     </head>
//     <body>
//       <div class="header">
//         <div>
//           <h1>Project Report</h1>
//           <h2>${report.project.name}</h2>
//         </div>
//         <div style="text-align: right;">
//           <p><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</p>
//           <p><strong>Generated by:</strong> ${report.generatedBy}</p>
//         </div>
//       </div>

//       <div class="section">
//         <h2>Project Overview</h2>
//         <div class="grid">
//           <div class="card">
//             <div class="label">Status</div>
//             <div class="value">${report.project.status}</div>
//           </div>
//           <div class="card">
//             <div class="label">Progress</div>
//             <div class="value">${report.project.progress}%</div>
//           </div>
//           <div class="card">
//             <div class="label">Risk Level</div>
//             <div class="value">${report.project.riskLevel}</div>
//           </div>
//           <div class="card">
//             <div class="label">Priority</div>
//             <div class="value">${report.project.priority}</div>
//           </div>
//         </div>
//       </div>

//       <div class="section">
//         <h2>Client Information</h2>
//         <div class="grid">
//           <div class="card">
//             <div class="label">Name</div>
//             <div class="value">${report.client.name}</div>
//           </div>
//           <div class="card">
//             <div class="label">Company</div>
//             <div class="value">${report.client.company}</div>
//           </div>
//           <div class="card">
//             <div class="label">Email</div>
//             <div class="value">${report.client.email}</div>
//           </div>
//           <div class="card">
//             <div class="label">Phone</div>
//             <div class="value">${report.client.phone}</div>
//           </div>
//         </div>
//       </div>

//       <div class="section">
//         <h2>Task Metrics</h2>
//         <div class="grid">
//           <div class="card">
//             <div class="label">Total Tasks</div>
//             <div class="value">${report.metrics.tasks.total}</div>
//           </div>
//           <div class="card">
//             <div class="label">Completed</div>
//             <div class="value" style="color: #059669;">${report.metrics.tasks.completed}</div>
//           </div>
//           <div class="card">
//             <div class="label">In Progress</div>
//             <div class="value" style="color: #2563eb;">${report.metrics.tasks.inProgress}</div>
//           </div>
//           <div class="card">
//             <div class="label">Review</div>
//             <div class="value" style="color: #d97706;">${report.metrics.tasks.review}</div>
//           </div>
//           <div class="card">
//             <div class="label">Blocked</div>
//             <div class="value" style="color: #dc2626;">${report.metrics.tasks.blocked}</div>
//           </div>
//           <div class="card">
//             <div class="label">Completion Rate</div>
//             <div class="value">${report.metrics.tasks.completionRate}%</div>
//           </div>
//         </div>
//       </div>

//       <div class="section">
//         <h2>Milestone Metrics</h2>
//         <div class="grid">
//           <div class="card">
//             <div class="label">Total Milestones</div>
//             <div class="value">${report.metrics.milestones.total}</div>
//           </div>
//           <div class="card">
//             <div class="label">Completed</div>
//             <div class="value" style="color: #059669;">${report.metrics.milestones.completed}</div>
//           </div>
//           <div class="card">
//             <div class="label">In Progress</div>
//             <div class="value" style="color: #2563eb;">${report.metrics.milestones.inProgress}</div>
//           </div>
//           <div class="card">
//             <div class="label">Delayed</div>
//             <div class="value" style="color: #dc2626;">${report.metrics.milestones.delayed}</div>
//           </div>
//         </div>
//       </div>

//       <div class="section">
//         <h2>Time & Financial Metrics</h2>
//         <div class="grid">
//           <div class="card">
//             <div class="label">Estimated Hours</div>
//             <div class="value">${report.metrics.time.estimatedHours}h</div>
//           </div>
//           <div class="card">
//             <div class="label">Actual Hours</div>
//             <div class="value">${report.metrics.time.actualHours}h</div>
//           </div>
//           <div class="card">
//             <div class="label">Variance</div>
//             <div class="value" style="color: ${report.metrics.time.variance > 0 ? '#dc2626' : '#059669'}">
//               ${report.metrics.time.variance > 0 ? '+' : ''}${report.metrics.time.variance}%
//             </div>
//           </div>
//           <div class="card">
//             <div class="label">Efficiency</div>
//             <div class="value">${report.metrics.time.efficiency}%</div>
//           </div>
//           <div class="card">
//             <div class="label">Budget</div>
//             <div class="value">$${report.metrics.financial.budget.toLocaleString()}</div>
//           </div>
//           <div class="card">
//             <div class="label">Actual Cost</div>
//             <div class="value">$${report.metrics.financial.cost.toLocaleString()}</div>
//           </div>
//           <div class="card">
//             <div class="label">Profit</div>
//             <div class="value" style="color: ${report.metrics.financial.profit > 0 ? '#059669' : '#dc2626'}">
//               $${report.metrics.financial.profit.toLocaleString()}
//             </div>
//           </div>
//           <div class="card">
//             <div class="label">ROI</div>
//             <div class="value" style="color: ${report.metrics.financial.roi > 0 ? '#059669' : '#dc2626'}">
//               ${report.metrics.financial.roi}%
//             </div>
//           </div>
//         </div>
//       </div>

//       ${report.milestones.length > 0 ? `
//         <div class="section">
//           <h2>Milestones</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>Milestone</th>
//                 <th>Status</th>
//                 <th>Deadline</th>
//                 <th>Tasks</th>
//                 <th>Completed</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${report.milestones.map(m => `
//                 <tr>
//                   <td><strong>${m.name}</strong></td>
//                   <td>
//                     <span style="
//                       padding: 3px 8px;
//                       border-radius: 12px;
//                       font-size: 12px;
//                       ${m.status === 'COMPLETED' ? 'background: #d1fae5; color: #059669;' :
//                m.status === 'DELAYED' ? 'background: #fee2e2; color: #dc2626;' :
//                     m.status === 'IN_PROGRESS' ? 'background: #dbeafe; color: #2563eb;' :
//                          'background: #f3f4f6; color: #4b5563;'}
//                     ">
//                       ${m.status}
//                     </span>
//                   </td>
//                   <td>${m.deadline ? new Date(m.deadline).toLocaleDateString() : 'N/A'}</td>
//                   <td>${m.taskCount}</td>
//                   <td>${m.completedTasks}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>
//         </div>
//       ` : ''}

//       ${report.recentFeedback.length > 0 ? `
//         <div class="section">
//           <h2>Recent Feedback</h2>
//           ${report.recentFeedback.map(f => `
//             <div class="feedback">
//               <p style="margin: 0 0 5px 0;"><strong>${f.from}</strong> - ${new Date(f.createdAt).toLocaleDateString()}</p>
//               <p style="margin: 0 0 5px 0; font-style: italic;">"${f.content}"</p>
//               ${f.isApproved ? '<p class="approved">✓ Approved</p>' : ''}
//             </div>
//           `).join('')}
//         </div>
//       ` : ''}

//       <div class="footer">
//         <p>Generated by Project Management System</p>
//       </div>
//     </body>
//     </html>
//   `;
// }