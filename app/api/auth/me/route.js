//Get Current User API
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded) {
               return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
               );
          }

          const user = await prisma.user.findUnique({
               where: { id: decoded.id },
               select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                    jobTitle: true,
                    department: true,
                    lastLoginAt: true
               }
          });

          if (!user) {
               return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
               );
          }

          return NextResponse.json({ user });
     } catch (error) {
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}