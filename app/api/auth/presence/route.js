
// app/api/auth/presence/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
     try {
          const accessToken = req.cookies.get('accessToken')?.value;
          if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          const { payload } = await jwtVerify(accessToken, JWT_SECRET);

          // Update the lastActive timestamp for this user's latest session
          await prisma.session.updateMany({
               where: {
                    userId: payload.id,
                    expires: { gte: new Date() } // Only update non-expired sessions
               },
               data: { lastActive: new Date() }
          });

          return NextResponse.json({ success: true });
     } catch (error) {
          return NextResponse.json({ error: 'Session pulse failed' }, { status: 401 });
     }
}