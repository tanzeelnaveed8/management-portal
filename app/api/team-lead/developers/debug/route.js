export const runtime = 'nodejs';

// app/api/team-lead/developers/debug/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function GET(request) {
     if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Not available' }, { status: 404 });
     }
     try {
          const token = request.cookies.get('accessToken')?.value;

          // Step 1: Check token
          if (!token) {
               return NextResponse.json({ step: 1, error: 'No token' }, { status: 401 });
          }

          // Step 2: Verify token
          const decoded = verifyAccessToken(token);
          if (!decoded) {
               return NextResponse.json({ step: 2, error: 'Invalid token' }, { status: 401 });
          }

          // Step 3: Check role
          if (!['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ step: 3, error: 'Invalid role', role: decoded.role }, { status: 403 });
          }

          // Step 4: Test database connection
          try {
               await prisma.$queryRaw`SELECT 1`;
          } catch (dbError) {
               return NextResponse.json({
                    step: 4,
                    error: 'Database connection failed',
                    details: dbError.message
               }, { status: 500 });
          }

          // Step 5: Check if User table exists and count records
          let userCount = 0;
          try {
               userCount = await prisma.user.count();
          } catch (countError) {
               return NextResponse.json({
                    step: 5,
                    error: 'Cannot count users',
                    details: countError.message
               }, { status: 500 });
          }

          // Step 6: Try to find developers with minimal fields
          let developers = [];
          try {
               developers = await prisma.user.findMany({
                    where: { role: 'DEVELOPER' },
                    take: 5,
                    select: {
                         id: true,
                         name: true,
                         email: true,
                         role: true
                    }
               });
          } catch (findError) {
               return NextResponse.json({
                    step: 6,
                    error: 'Cannot find developers',
                    details: findError.message,
                    code: findError.code
               }, { status: 500 });
          }

          // Step 7: Try to include assignedTasks
          let developersWithTasks = [];
          try {
               developersWithTasks = await prisma.user.findMany({
                    where: { role: 'DEVELOPER' },
                    take: 2,
                    include: {
                         assignedTasks: {
                              take: 5,
                              select: {
                                   id: true,
                                   status: true
                              }
                         }
                    }
               });
          } catch (includeError) {
               return NextResponse.json({
                    step: 7,
                    error: 'Cannot include tasks',
                    details: includeError.message,
                    code: includeError.code
               }, { status: 500 });
          }

          return NextResponse.json({
               success: true,
               steps: {
                    token: '✅',
                    verification: '✅',
                    role: '✅',
                    dbConnection: '✅',
                    userCount,
                    developersFound: developers.length,
                    sampleData: developers,
                    includeTest: developersWithTasks.length
               }
          });

     } catch (error) {
          return NextResponse.json({
               step: 'final',
               error: error.message,
               stack: error.stack
          }, { status: 500 });
     }
}

// Run this in browser console when on your team-lead page
// fetch('/api/team-lead/developers/debug')
//      .then(res => res.json())
//      .then(data => console.log('Debug result:', data))
//      .catch(err => console.error('Debug fetch error:', err));