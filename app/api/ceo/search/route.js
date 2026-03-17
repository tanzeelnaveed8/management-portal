
// app/api/ceo/search/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;
          const { searchParams } = new URL(request.url);
          const query = searchParams.get('q') || '';

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'CEO') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          if (query.length < 2) {
               return NextResponse.json({ results: [] });
          }

          // Search projects
          const projects = await prisma.project.findMany({
               where: {
                    OR: [
                         { name: { contains: query, mode: 'insensitive' } },
                         { clientName: { contains: query, mode: 'insensitive' } },
                         { description: { contains: query, mode: 'insensitive' } }
                    ]
               },
               select: {
                    id: true,
                    name: true,
                    clientName: true,
                    status: true,
                    manager: {
                         select: { name: true }
                    }
               },
               take: 5
          });

          // Search users (managers, team leads)
          const users = await prisma.user.findMany({
               where: {
                    OR: [
                         { name: { contains: query, mode: 'insensitive' } },
                         { email: { contains: query, mode: 'insensitive' } }
                    ],
                    role: { in: ['PROJECT_MANAGER', 'TEAM_LEAD'] }
               },
               select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatar: true
               },
               take: 5
          });

          return NextResponse.json({
               results: {
                    projects: projects.map(p => ({
                         id: p.id,
                         title: p.name,
                         subtitle: `Client: ${p.clientName} | Manager: ${p.manager?.name}`,
                         type: 'project',
                         status: p.status,
                         link: `/ceo/projects/${p.id}`
                    })),
                    users: users.map(u => ({
                         id: u.id,
                         title: u.name,
                         subtitle: `${u.role} | ${u.email}`,
                         type: 'user',
                         role: u.role,
                         avatar: u.avatar,
                         link: `/ceo/users/${u.id}`
                    }))
               }
          });

     } catch (error) {
          console.error('Search API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}