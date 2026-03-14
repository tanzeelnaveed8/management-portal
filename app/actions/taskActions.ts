

// app/actions/taskActions.ts
'use server'
import { prisma } from "../../lib/prisma";

export async function updateTaskStatusAction(taskId: string, newStatus: any) {
  return await prisma.task.update({
    where: { id: taskId },
    data: { 
      status: newStatus,
      // If moving to COMPLETED, auto-set the timestamp
      completedAt: newStatus === 'COMPLETED' ? new Date() : null 
    },
  });
}