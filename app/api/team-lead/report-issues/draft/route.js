
// app/api/team-lead/report-issues/draft/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function POST(request) {
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

          const draft = await request.json();

          // Save draft in a separate model or as a JSON field in user settings
          // For simplicity, we'll create a special "DRAFT" notification
          const draftNotification = await prisma.notification.create({
               data: {
                    type: 'SYSTEM_ALERT',
                    title: 'DRAFT: Issue Report',
                    message: 'This is a draft issue report',
                    userId: decoded.id, // Save for self
                    metadata: {
                         ...draft,
                         isDraft: true,
                         savedAt: new Date().toISOString()
                    }
               }
          });

          return NextResponse.json({
               success: true,
               message: 'Draft saved successfully',
               draftId: draftNotification.id
          });

     } catch (error) {
          console.error('Save draft error:', error);
          return NextResponse.json(
               { error: 'Failed to save draft' },
               { status: 500 }
          );
     }
}