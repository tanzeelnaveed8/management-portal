
// app/api/team-lead/developers/[developerId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { developerId } = await params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Fetch developer with detailed information
          const developer = await prisma.user.findUnique({
               where: { id: developerId },
               select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    jobTitle: true,
                    department: true,
                    status: true,
                    isActive: true,
                    skills: true,
                    currentWorkload: true,
                    bio: true,
                    phone: true,
                    timezone: true,
                    createdAt: true,
                    updatedAt: true,
                    assignedTasks: {
                         include: {
                              project: {
                                   select: {
                                        id: true,
                                        name: true,
                                        status: true
                                   }
                              }
                         },
                         orderBy: {
                              createdAt: 'desc'
                         }
                    }
               }
          });

          if (!developer) {
               return NextResponse.json(
                    { error: 'Developer not found' },
                    { status: 404 }
               );
          }

          // Calculate detailed statistics
          const now = new Date();
          const tasks = developer.assignedTasks || [];

          const stats = {
               total: tasks.length,
               completed: tasks.filter(t => t.status === 'COMPLETED').length,
               inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
               review: tasks.filter(t => t.status === 'REVIEW').length,
               notStarted: tasks.filter(t => t.status === 'NOT_STARTED').length,
               blocked: tasks.filter(t => t.status === 'BLOCKED').length,
               overdue: tasks.filter(t =>
                    t.status !== 'COMPLETED' &&
                    t.deadline &&
                    new Date(t.deadline) < now
               ).length,
               byPriority: {
                    critical: tasks.filter(t => t.priority === 'CRITICAL').length,
                    high: tasks.filter(t => t.priority === 'HIGH').length,
                    medium: tasks.filter(t => t.priority === 'MEDIUM').length,
                    low: tasks.filter(t => t.priority === 'LOW').length
               }
          };

          // Get project distribution
          const projects = {};
          tasks.forEach(task => {
               if (task.project) {
                    if (!projects[task.project.id]) {
                         projects[task.project.id] = {
                              id: task.project.id,
                              name: task.project.name,
                              status: task.project.status,
                              tasks: []
                         };
                    }
                    projects[task.project.id].tasks.push(task);
               }
          });

          const projectList = Object.values(projects).map(proj => ({
               ...proj,
               taskCount: proj.tasks.length,
               completedCount: proj.tasks.filter(t => t.status === 'COMPLETED').length
          }));

          // Calculate workload metrics
          const activeTasks = tasks.filter(t =>
               ['IN_PROGRESS', 'REVIEW'].includes(t.status)
          ).length;

          const workload = {
               current: activeTasks,
               max: 8, // Configurable
               percentage: Math.min(100, Math.round((activeTasks / 8) * 100)),
               estimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
               actualHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
          };

          return NextResponse.json({
               developer: {
                    ...developer,
                    stats,
                    projects: projectList,
                    workload
               }
          });

     } catch (error) {
          console.error('Developer details fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch developer details' },
               { status: 500 }
          );
     }
}