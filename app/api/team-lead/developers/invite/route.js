

// app/api/team-lead/developers/invite/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';
import { sendInviteEmail } from '../../../../../lib/email';

export async function POST(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;
          const body = await request.json();

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || !['TEAM_LEAD', 'PROJECT_MANAGER', 'CEO'].includes(decoded.role)) {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Validate required fields
          const { email, name, jobTitle, department, skills } = body;

          if (!email || !name) {
               return NextResponse.json(
                    { error: 'Email and name are required' },
                    { status: 400 }
               );
          }

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
               where: { email }
          });

          if (existingUser) {
               return NextResponse.json(
                    { error: 'User with this email already exists' },
                    { status: 400 }
               );
          }

          // Generate invitation token
          const inviteToken = crypto.randomUUID();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7); // Token valid for 7 days

          // Create invitation
          const invitation = await prisma.invitation.create({
               data: {
                    email,
                    token: inviteToken,
                    role: 'DEVELOPER',
                    invitedById: decoded.id,
                    expiresAt,
                    metadata: {
                         name,
                         jobTitle,
                         department,
                         skills: skills || []
                    }
               }
          });

          // Send invitation email
          try {
               await sendInviteEmail({
                    to: email,
                    name,
                    inviteToken,
                    invitedBy: decoded.name
               });
          } catch (emailError) {
               console.error('Failed to send invitation email:', emailError);
               // Don't fail the request, but log the error
          }

          return NextResponse.json({
               message: 'Invitation sent successfully',
               invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    expiresAt: invitation.expiresAt
               }
          }, { status: 201 });

     } catch (error) {
          console.error('Developer invitation error:', error);
          return NextResponse.json(
               { error: 'Failed to send invitation' },
               { status: 500 }
          );
     }
}