

import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

// Validation schema
const updateSchema = z.object({
     name: z.string().min(2, 'Name must be at least 2 characters').optional(),
     phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional().nullable(),
     jobTitle: z.string().optional().nullable(),
     department: z.string().optional().nullable(),
});

export async function PUT(request) {
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

          // Parse and validate request body
          const body = await request.json();
          const validation = updateSchema.safeParse(body);

          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid data', details: validation.error.errors },
                    { status: 400 }
               );
          }

          const updateData = validation.data;

          // Update user
          const updatedUser = await prisma.user.update({
               where: { id: decoded.id },
               data: updateData,
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
                    updatedAt: true
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'UPDATE_PROFILE',
                    entityType: 'user',
                    entityId: decoded.id,
                    details: { updatedFields: Object.keys(updateData) },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               message: 'Profile updated successfully',
               user: updatedUser
          });

     } catch (error) {
          console.error('Profile update error:', error);
          return NextResponse.json(
               { error: 'Failed to update profile' },
               { status: 500 }
          );
     }
}