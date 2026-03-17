// app/api/team-lead/developers/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
     try {
          console.log('[Developers API] Starting request...');

          // Get token from cookies
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          // Verify token and get user
          const decoded = verifyAccessToken(token);
          if (!decoded) {
               return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
               );
          }

          // Check if user has appropriate role
          if (!['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json(
                    { error: 'Access denied. Required role: TEAM_LEAD, PROJECT_MANAGER, or CEO' },
                    { status: 403 }
               );
          }

          // Parse query parameters
          const { searchParams } = new URL(request.url);
          const search = searchParams.get('search') || '';
          const department = searchParams.get('department');
          const status = searchParams.get('status');
          const workloadFilter = searchParams.get('workload');

          // Build filter conditions
          const where = {
               role: 'DEVELOPER'
          };

          // Add status filter - using the correct 'status' field from schema
          if (status && status !== 'ALL' && status !== '') {
               // Map UI status to database enum values
               if (status === 'ACTIVE') {
                    where.status = 'ACTIVE';
               } else if (status === 'INACTIVE') {
                    where.status = { in: ['PENDING', 'INACTIVE'] }; // Adjust based on your enum
               }
          }

          // Add department filter
          if (department && department !== 'ALL' && department !== '') {
               where.department = department;
          }

          // Add search filter
          if (search) {
               where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { jobTitle: { contains: search, mode: 'insensitive' } }
               ];
          }

          // Fetch developers with correct schema fields
          const developers = await prisma.user.findMany({
               where,
               select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    jobTitle: true,
                    department: true,
                    status: true, // Using 'status' instead of 'isActive'
                    phone: true,
                    createdAt: true,
                    lastLoginAt: true,
                    // Include task statistics through relation
                    assignedTasks: {
                         select: {
                              id: true,
                              status: true,
                              priority: true,
                              deadline: true,
                              project: {
                                   select: {
                                        id: true,
                                        name: true
                                   }
                              }
                         }
                    }
               },
               orderBy: [
                    { name: 'asc' }
               ]
          });

          // Calculate workload and statistics for each developer
          const now = new Date();
          const developersWithStats = developers.map(dev => {
               const tasks = dev.assignedTasks || [];

               // Calculate task statistics
               const completed = tasks.filter(t => t.status === 'COMPLETED').length;
               const ongoing = tasks.filter(t => ['IN_PROGRESS', 'REVIEW'].includes(t.status)).length;
               const overdue = tasks.filter(t =>
                    t.status !== 'COMPLETED' &&
                    t.deadline &&
                    new Date(t.deadline) < now
               ).length;

               // Calculate workload based on active tasks
               const activeTasks = tasks.filter(t =>
                    ['IN_PROGRESS', 'REVIEW', 'NOT_STARTED'].includes(t.status)
               ).length;

               // Max workload threshold (configurable)
               const maxWorkload = 8;
               const workload = Math.min(100, Math.round((activeTasks / maxWorkload) * 100));

               // Filter by workload if specified
               if (workloadFilter) {
                    if (workloadFilter === 'HIGH' && workload <= 70) return null;
                    if (workloadFilter === 'MEDIUM' && (workload <= 30 || workload > 70)) return null;
                    if (workloadFilter === 'LOW' && workload > 30) return null;
               }

               // Map status to UI-friendly format
               const uiStatus = dev.status === 'ACTIVE' ? 'ACTIVE' :
                    dev.status === 'PENDING' ? 'PENDING' : 'INACTIVE';

               return {
                    id: dev.id,
                    name: dev.name,
                    email: dev.email,
                    avatar: dev.avatar,
                    jobTitle: dev.jobTitle || 'Developer',
                    department: dev.department || 'Engineering',
                    status: uiStatus,
                    phone: dev.phone,
                    lastActive: dev.lastLoginAt,
                    stats: {
                         completed,
                         ongoing,
                         overdue,
                         total: tasks.length
                    },
                    workload,
                    currentTasks: activeTasks,
                    maxWorkload,
                    recentTasks: tasks.slice(0, 3).map(t => ({
                         id: t.id,
                         title: t.title,
                         status: t.status,
                         priority: t.priority,
                         deadline: t.deadline,
                         project: t.project
                    }))
               };
          }).filter(Boolean); // Remove null entries from workload filtering

          // Get unique departments for filters
          const departments = [...new Set(developers
               .map(d => d.department)
               .filter(Boolean))];

          // Calculate workload distribution
          const workloadDistribution = {
               low: developersWithStats.filter(d => d.workload <= 30).length,
               medium: developersWithStats.filter(d => d.workload > 30 && d.workload <= 70).length,
               high: developersWithStats.filter(d => d.workload > 70).length
          };

          return NextResponse.json({
               developers: developersWithStats,
               filters: {
                    departments,
                    totalCount: developersWithStats.length,
                    workloadDistribution
               }
          });

     } catch (error) {
          console.error('[Developers API] Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}