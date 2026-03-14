

// app/api/ceo/notifications/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth/jwt';
import prisma from '../../../../lib/prisma';

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

          // Fetch notifications for CEO
          const notifications = await prisma.notification.findMany({
               where: {
                    userId: decoded.id,
                    OR: [
                         { isRead: false },
                         { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Last 7 days
                    ]
               },
               orderBy: { createdAt: 'desc' },
               take: 20
          });

          const unreadCount = notifications.filter(n => !n.isRead).length;

          return NextResponse.json({
               notifications,
               unreadCount
          });

     } catch (error) {
          console.error('Notifications API Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}

export async function PATCH(request) {
     try {
          const token = request.cookies.get('accessToken')?.value;
          const { notificationId, markAllAsRead } = await request.json();

          if (!token) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'CEO') {
               return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          if (markAllAsRead) {
               await prisma.notification.updateMany({
                    where: {
                         userId: decoded.id,
                         isRead: false
                    },
                    data: {
                         isRead: true,
                         readAt: new Date()
                    }
               });
          } else if (notificationId) {
               await prisma.notification.update({
                    where: { id: notificationId },
                    data: {
                         isRead: true,
                         readAt: new Date()
                    }
               });
          }

          return NextResponse.json({ success: true });

     } catch (error) {
          console.error('Notification Update Error:', error);
          return NextResponse.json(
               { error: error.message },
               { status: 500 }
          );
     }
}