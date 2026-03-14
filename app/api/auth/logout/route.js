// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; // Using absolute alias is safer

export async function POST(request) {
     try {
          const refreshToken = request.cookies.get('refreshToken')?.value;

          // Only attempt DB deletion if a token exists
          if (refreshToken) {
               try {
                    await prisma.session.deleteMany({
                         where: { sessionToken: refreshToken }
                    });
               } catch (dbError) {
                    // Log DB error but don't stop the logout process
                    console.error("Prisma Logout Error:", dbError);
               }
          }

          const response = NextResponse.json({
               message: 'Logged out successfully',
               success: true
          });

          // Clear cookies regardless of DB success
          response.cookies.set('accessToken', '', {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'lax',
               maxAge: 0,
               path: '/'
          });

          response.cookies.set('refreshToken', '', {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'lax',
               maxAge: 0,
               path: '/'
          });

          return response;
     } catch (error) {
          console.error("Global Logout Error:", error);
          return NextResponse.json(
               { error: 'Internal Server Error' },
               { status: 500 }
          );
     }
}