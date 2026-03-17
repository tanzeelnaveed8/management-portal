
// app/api/ceo/team/[memberId]/status/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';

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

          const { status } = await request.json();

          // Validate status
          const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'];
          if (!validStatuses.includes(status)) {
               return NextResponse.json(
                    { error: 'Invalid status value' },
                    { status: 400 }
               );
          }

          const updatedUser = await prisma.user.update({
               where: { id: memberId },
               data: { status },
               select: {
                    id: true,
                    name: true,
                    email: true,
                    status: true
               }
          });

          return NextResponse.json({ member: updatedUser });
     } catch (error) {
          console.error('Status update error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}