

// app/api/developer/projects/[projectId]/milestones/route.js

import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
     try {
          const { projectId } = params;

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

          // Fetch milestones with task data
          const milestones = await prisma.milestone.findMany({
               where: { projectId },
               include: {
                    _count: {
                         select: {
                              tasks: true
                         }
                    },
                    tasks: {
                         where: {
                              assigneeId: decoded.id
                         },
                         select: {
                              id: true,
                              status: true,
                              priority: true,
                              deadline: true
                         },
                         orderBy: {
                              deadline: 'asc'
                         }
                    }
               },
               orderBy: [
                    { status: 'asc' },
                    { deadline: 'asc' }
               ]
          });

          // Calculate progress for each milestone
          const milestonesWithProgress = milestones.map(milestone => {
               const totalTasks = milestone.tasks.length;
               const completedTasks = milestone.tasks.filter(t => t.status === 'COMPLETED').length;
               const overdueTasks = milestone.tasks.filter(t =>
                    t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED'
               ).length;

               return {
                    id: milestone.id,
                    name: milestone.name,
                    description: milestone.description,
                    status: milestone.status,
                    deadline: milestone.deadline,
                    completedAt: milestone.completedAt,
                    totalTasks: milestone._count.tasks,
                    assignedToMe: totalTasks,
                    completedByMe: completedTasks,
                    progress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
                    overdueTasks,
                    isDelayed: milestone.isDelayed || overdueTasks > 0
               };
          });

          return NextResponse.json({ milestones: milestonesWithProgress });

     } catch (error) {
          console.error('Project milestones fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch milestones' },
               { status: 500 }
          );
     }
}