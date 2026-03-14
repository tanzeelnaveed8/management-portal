
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
     try {
          const { developerId } = await params;
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
                    { error: 'Access denied. Only Team Leads can deactivate developers.' },
                    { status: 403 }
               );
          }

          // Verify developer exists
          const developer = await prisma.user.findFirst({
               where: {
                    id: developerId,
                    role: 'DEVELOPER'
               },
               include: {
                    assignedTasks: {
                         where: {
                              status: {
                                   notIn: ['COMPLETED']
                              }
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

          // Start a transaction
          const result = await prisma.$transaction(async (tx) => {
               // Update developer status to INACTIVE
               const updatedDeveloper = await tx.user.update({
                    where: { id: developerId },
                    data: {
                         status: 'INACTIVE'
                    },
                    select: {
                         id: true,
                         name: true,
                         email: true,
                         status: true
                    }
               });

               // Unassign all active tasks (set assigneeId to null)
               await tx.task.updateMany({
                    where: {
                         assigneeId: developerId,
                         status: {
                              notIn: ['COMPLETED']
                         }
                    },
                    data: {
                         assigneeId: null,
                         status: 'NOT_STARTED' // Reset status
                    }
               });

               // Create notification for Project Manager
               await tx.notification.create({
                    data: {
                         type: 'SYSTEM_ALERT',
                         title: 'Developer Deactivated',
                         message: `${developer.name} has been deactivated. Their tasks have been unassigned.`,
                         userId: decoded.id,
                         metadata: {
                              developerId,
                              developerName: developer.name,
                              taskCount: developer.assignedTasks.length,
                              deactivatedBy: decoded.name
                         }
                    }
               });

               // Log activity
               await tx.activityLog.create({
                    data: {
                         action: 'DEACTIVATE_DEVELOPER',
                         entityType: 'user',
                         entityId: developerId,
                         details: {
                              developerName: developer.name,
                              taskCount: developer.assignedTasks.length
                         },
                         userId: decoded.id
                    }
               });

               return updatedDeveloper;
          });

          return NextResponse.json({
               success: true,
               message: 'Developer deactivated successfully',
               developer: result
          });

     } catch (error) {
          console.error('Deactivate developer error:', error);
          return NextResponse.json(
               { error: error.message || 'Failed to deactivate developer' },
               { status: 500 }
          );
     }
}