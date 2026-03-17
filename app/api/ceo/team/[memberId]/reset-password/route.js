

// app/api/ceo/team/[memberId]/reset-password/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request, { params }) {
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

          // Generate random password
          const newPassword = crypto.randomBytes(8).toString('hex');
          const hashedPassword = await bcrypt.hash(newPassword, 10);

          // Update user password
          await prisma.user.update({
               where: { id: memberId },
               data: { password: hashedPassword }
          });

          // In a real app, you would send an email here
          console.log(`Password reset for user ${memberId}: ${newPassword}`);

          return NextResponse.json({
               message: 'Password reset successfully',
               // In development, return the password (remove in production)
               ...(process.env.NODE_ENV === 'development' && { newPassword })
          });
     } catch (error) {
          console.error('Password reset error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}