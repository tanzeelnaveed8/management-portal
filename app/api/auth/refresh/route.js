

// app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
     try {
          const refreshToken = request.cookies.get('refreshToken')?.value;

          if (!refreshToken) {
               return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
          }

          // Verify refresh token
          const decoded = verifyRefreshToken(refreshToken);
          if (!decoded) {
               return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
          }

          // Find session
          const session = await prisma.session.findUnique({
               where: { sessionToken: refreshToken },
               include: { user: true }
          });

          if (!session || session.expires < new Date()) {
               return NextResponse.json({ error: 'Session expired' }, { status: 401 });
          }

          // Generate new tokens
          const { accessToken, refreshToken: newRefreshToken } = generateTokens({
               id: session.user.id,
               email: session.user.email,
               role: session.user.role,
               name: session.user.name
          });

          // Update session
          await prisma.session.update({
               where: { id: session.id },
               data: {
                    sessionToken: newRefreshToken,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
               }
          });

          const response = NextResponse.json({ success: true });

          response.cookies.set('accessToken', accessToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'lax',
               path: '/',
               maxAge: 60 * 60 * 24 // 1 day
          });

          response.cookies.set('refreshToken', newRefreshToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict',
               path: '/',
               maxAge: 7 * 24 * 60 * 60 // 7 days
          });

          return response;

     } catch (error) {
          console.error('Refresh error:', error);
          return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
     }
}