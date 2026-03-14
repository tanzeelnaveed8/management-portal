

import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
     try {
          const { taskId } = params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded) {
               return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
               );
          }

          const attachments = await prisma.document.findMany({
               where: {
                    taskId,
                    OR: [
                         { type: 'TASK_ATTACHMENT' },
                         { type: 'PROJECT_DOC' }
                    ]
               },
               orderBy: {
                    uploadedAt: 'desc'
               }
          });

          return NextResponse.json({ attachments });

     } catch (error) {
          console.error('Fetch attachments error:', error);
          return NextResponse.json(
               { error: 'Failed to fetch attachments' },
               { status: 500 }
          );
     }
}

export async function POST(request, { params }) {
     try {
          const { taskId } = params;
          const formData = await request.formData();
          const file = formData.get('file');

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

          if (!file) {
               return NextResponse.json(
                    { error: 'No file uploaded' },
                    { status: 400 }
               );
          }

          // Verify task exists and team lead has access
          const task = await prisma.task.findUnique({
               where: { id: taskId },
               include: {
                    project: {
                         select: { teamLeadId: true }
                    }
               }
          });

          if (!task || task.project.teamLeadId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Validate file type
          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/zip'];
          if (!validTypes.includes(file.type)) {
               return NextResponse.json(
                    { error: 'Invalid file type' },
                    { status: 400 }
               );
          }

          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
               return NextResponse.json(
                    { error: 'File too large. Maximum size is 10MB' },
                    { status: 400 }
               );
          }

          // Save file
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const uploadDir = path.join(process.cwd(), 'public/uploads/approvals');
          await fs.mkdir(uploadDir, { recursive: true });

          const fileName = `approval-${taskId}-${Date.now()}-${file.name}`;
          const filePath = path.join(uploadDir, fileName);
          await fs.writeFile(filePath, buffer);

          // Create document record
          const document = await prisma.document.create({
               data: {
                    name: file.name,
                    fileName,
                    fileSize: file.size,
                    fileType: file.type,
                    url: `/uploads/approvals/${fileName}`,
                    type: 'TASK_ATTACHMENT',
                    taskId,
                    uploadedById: decoded.id
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'UPLOAD_ATTACHMENT',
                    entityType: 'task',
                    entityId: taskId,
                    details: {
                         fileName: file.name,
                         fileSize: file.size
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               attachment: document
          });

     } catch (error) {
          console.error('Upload attachment error:', error);
          return NextResponse.json(
               { error: 'Failed to upload attachment' },
               { status: 500 }
          );
     }
}