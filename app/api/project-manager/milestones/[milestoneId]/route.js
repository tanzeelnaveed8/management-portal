// app/api/project-manager/milestones/[milestoneId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function PATCH(request, { params }) {
     try {
          const { milestoneId } = await params;
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

          const milestone = await prisma.milestone.findFirst({
               where: { id: milestoneId },
               include: { project: true }
          });

          if (!milestone || milestone.project.managerId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Milestone not found or access denied' },
                    { status: 404 }
               );
          }

          const body = await request.json();
          const { name, description, deadline, startDate, status } = body;

          const updateData = {};
          if (name !== undefined) updateData.name = name;
          if (description !== undefined) updateData.description = description;
          if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
          if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
          if (status !== undefined) updateData.status = status;

          const updated = await prisma.milestone.update({
               where: { id: milestoneId },
               data: updateData
          });

          return NextResponse.json({ milestone: updated });
     } catch (error) {
          console.error('Milestone update error:', error);
          return NextResponse.json(
               { error: 'Failed to update milestone' },
               { status: 500 }
          );
     }
}
