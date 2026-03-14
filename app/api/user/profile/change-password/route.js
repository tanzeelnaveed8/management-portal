
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import { comparePassword, hashPassword } from '../../../../../lib/auth/password';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const passwordSchema = z.object({
     currentPassword: z.string().min(1, 'Current password is required'),
     newPassword: z.string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
          .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
          .regex(/[0-9]/, 'Password must contain at least one number')
          .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export async function POST(request) {
     try {
          // Get token
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

          // Parse and validate request
          const body = await request.json();
          const validation = passwordSchema.safeParse(body);

          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid password', details: validation.error.errors },
                    { status: 400 }
               );
          }

          const { currentPassword, newPassword } = validation.data;

          // Get user with password
          const user = await prisma.user.findUnique({
               where: { id: decoded.id },
               select: { password: true }
          });

          if (!user) {
               return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
               );
          }

          // Verify current password
          const isValid = await comparePassword(currentPassword, user.password);
          if (!isValid) {
               return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 401 }
               );
          }

          // Hash new password
          const hashedPassword = await hashPassword(newPassword);

          // Update password
          await prisma.user.update({
               where: { id: decoded.id },
               data: { password: hashedPassword }
          });

          // Delete all sessions except current one (invalidate other devices)
          const currentSession = request.cookies.get('refreshToken')?.value;

          await prisma.session.deleteMany({
               where: {
                    userId: decoded.id,
                    NOT: currentSession ? { sessionToken: currentSession } : {}
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'CHANGE_PASSWORD',
                    entityType: 'user',
                    entityId: decoded.id,
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               message: 'Password changed successfully. Other devices have been logged out.'
          });

     } catch (error) {
          console.error('Password change error:', error);
          return NextResponse.json(
               { error: 'Failed to change password' },
               { status: 500 }
          );
     }
}