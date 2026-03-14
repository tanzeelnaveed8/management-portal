// app/api/ceo/team/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;
          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'CEO') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Fetch all users with safe field selection
          const users = await prisma.user.findMany({
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
                    createdAt: true,
                    updatedAt: true,
                    lastLoginAt: true,
                    emailVerified: true,
                    // Include counts of relations
                    _count: {
                         select: {
                              projectsManaged: true,
                              projectsLed: true,
                              assignedTasks: true
                         }
                    }
               },
               orderBy: { createdAt: 'desc' }
          });

          // Calculate stats
          const stats = {
               total: users.length,
               active: users.filter(u => u.status === 'ACTIVE').length,
               pending: users.filter(u => u.status === 'PENDING').length,
               suspended: users.filter(u => u.status === 'SUSPENDED').length,
               ceo: users.filter(u => u.role === 'CEO').length,
               projectManagers: users.filter(u => u.role === 'PROJECT_MANAGER').length,
               teamLeads: users.filter(u => u.role === 'TEAM_LEAD').length,
               developers: users.filter(u => u.role === 'DEVELOPER').length
          };

          return NextResponse.json({ members: users, stats });
     } catch (error) {
          console.error('Team fetch error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}

export async function POST(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;
          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'CEO') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          const body = await request.json();
          const { name, email, password, role, department, jobTitle, phone } = body;

          // Validate required fields
          if (!name || !email || !password || !role) {
               return NextResponse.json(
                    { error: 'Missing required fields' },
                    { status: 400 }
               );
          }

          // Check if user exists
          const existingUser = await prisma.user.findUnique({
               where: { email }
          });

          if (existingUser) {
               return NextResponse.json(
                    { error: 'User already exists' },
                    { status: 400 }
               );
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create user
          const user = await prisma.user.create({
               data: {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    status: 'ACTIVE',
                    department: department || null,
                    jobTitle: jobTitle || null,
                    phone: phone || null,
                    emailVerified: true
               },
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
                    createdAt: true
               }
          });

          return NextResponse.json(
               {
                    message: 'Team member created successfully',
                    member: user
               },
               { status: 201 }
          );
     } catch (error) {
          console.error('Team creation error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}