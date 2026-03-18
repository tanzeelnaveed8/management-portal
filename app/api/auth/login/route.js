
// app/api/auth/login/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { comparePassword } from '../../../../lib/auth/password';
import { generateTokens } from '../../../../lib/auth/jwt';

export async function POST(request) {
     try {
          const body = await request.json();
          const email = body.email?.toLowerCase(); // Standardize casing
          const { password } = body;


          // Validate input
          if (!email || !password) {
               return NextResponse.json(
                    { error: 'Email and password are required' },
                    { status: 400 }
               );
          }

          // Find user by email
          const user = await prisma.user.findUnique({
               where: { email },
               select: {
                    id: true,
                    email: true,
                    password: true,
                    name: true,
                    role: true,
                    status: true,
                    avatar: true
               }
          });

          // Check if user exists
          if (!user) {
               return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
               );
          }

          // Check if user is active
          if (user.status !== 'ACTIVE') {
               return NextResponse.json(
                    { error: 'Account is not active. Please contact admin.' },
                    { status: 403 }
               );
          }

          // Verify password
          const isValidPassword = await comparePassword(password, user.password);
          if (!isValidPassword) {
               return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
               );
          }

          // Update last login
          await prisma.user.update({
               where: { id: user.id },
               data: { lastLoginAt: new Date() }
          });

          // Generate tokens
          const { accessToken, refreshToken } = generateTokens({
               id: user.id,
               email: user.email,
               role: user.role,
               name: user.name
          });

          // Create session
          await prisma.session.create({
               data: {
                    sessionToken: refreshToken,
                    userId: user.id,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
               }
          });

          // Remove password from response
          const { password: _, ...userWithoutPassword } = user;

          // Set cookies
          const response = NextResponse.json({ user: userWithoutPassword });


          response.cookies.set('accessToken', accessToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'lax',
               path: '/',
               maxAge: 60 * 60 * 24 // 1 day
          });

          response.cookies.set('refreshToken', refreshToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict',
               path: '/',
               maxAge: 7 * 24 * 60 * 60 // 7 days
          });

         
          return response;

     } catch (error) {
          console.error('Login error:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}