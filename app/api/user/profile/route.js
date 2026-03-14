
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
     try {
          // Get token from cookies
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          // Verify token
          const decoded = verifyAccessToken(token);
          if (!decoded) {
               return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
               );
          }

          // Fetch user with related data
          const user = await prisma.user.findUnique({
               where: { id: decoded.id },
               select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    avatar: true,
                    phone: true,
                    department: true,
                    jobTitle: true,
                    createdAt: true,
                    lastLoginAt: true,
                    // Get task counts
                    _count: {
                         select: {
                              assignedTasks: true,
                              createdTasks: true
                         }
                    },
                    // Get recent activity
                    assignedTasks: {
                         where: {
                              status: 'COMPLETED'
                         },
                         select: {
                              id: true
                         }
                    }
               }
          });

          if (!user) {
               return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
               );
          }

          // Calculate additional stats
          const totalTasks = user._count.assignedTasks;
          const completedTasks = user.assignedTasks.length;

          // Format response
          const userProfile = {
               ...user,
               stats: {
                    totalTasks,
                    completedTasks,
                    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
               }
          };

          // Remove sensitive data
          delete userProfile._count;
          delete userProfile.assignedTasks;

          return NextResponse.json({ user: userProfile });

     } catch (error) {
          console.error('Profile fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch profile' },
               { status: 500 }
          );
     }
}