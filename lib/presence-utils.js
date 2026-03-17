

// lib/presence-utils.js
import { prisma } from './prisma';

export async function getOnlineUsers() {
     const twoMinutesAgo = new Date(Date.now() - 2 * 60000);

     const activeSessions = await prisma.session.findMany({
          where: {
               lastActive: { gte: twoMinutesAgo }
          },
          include: {
               user: {
                    select: {
                         name: true,
                         role: true,
                         avatar: true
                    }
               }
          }
     });

     // Remove duplicates (in case user has multiple tabs/devices open)
     const onlineUsers = Array.from(new Set(activeSessions.map(s => s.userId)))
          .map(id => activeSessions.find(s => s.userId === id).user);

     return onlineUsers;
}