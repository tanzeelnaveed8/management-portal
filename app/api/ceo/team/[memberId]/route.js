// app/api/ceo/team/[memberId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt'; // Keep relative path
import prisma from '../../../../../lib/prisma'; // Keep relative path

export async function PATCH(request, { params }) {
     try {
          const { memberId } = await params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'CEO') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          const body = await request.json();

          // Remove fields that shouldn't be directly updated
          const {
               id, // Don't update ID
               password, // Don't update password here (use dedicated endpoint)
               createdAt,
               updatedAt,
               lastLoginAt,
               _count, // Remove relation counts
               projectsManaged,
               projectsLed,
               assignedTasks,
               createdTasks,
               createdProjects,
               comments,
               documents,
               notifications,
               sessions,
               feedbacks,
               activityLogs,
               ...updateData // Only keep safe fields
          } = body;

          const updatedUser = await prisma.user.update({
               where: { id: memberId },
               data: updateData, // Use filtered data
               select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    department: true,
                    jobTitle: true,
                    phone: true,
                    avatar: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true
               }
          });

          return NextResponse.json({ member: updatedUser });
     } catch (error) {
          console.error('Team update error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}