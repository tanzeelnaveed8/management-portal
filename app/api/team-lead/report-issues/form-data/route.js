

// app/api/team-lead/report-issues/form-data/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

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
          if (!decoded || decoded.role !== 'TEAM_LEAD') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Get all projects where user is team lead
          const projects = await prisma.project.findMany({
               where: {
                    teamLeadId: decoded.id
               },
               select: {
                    id: true,
                    name: true,
                    status: true,
                    priority: true,
                    manager: {
                         select: {
                              id: true,
                              name: true,
                              email: true
                         }
                    },
                    milestones: {
                         select: {
                              id: true,
                              name: true,
                              status: true
                         }
                    },
                    tasks: {
                         select: {
                              id: true,
                              title: true,
                              status: true,
                              priority: true
                         }
                    }
               }
          });

          return NextResponse.json({
               projects
          });

     } catch (error) {
          console.error('Form data fetch error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch form data' },
               { status: 500 }
          );
     }
}