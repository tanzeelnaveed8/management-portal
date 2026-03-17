
// app/api/project-manager/projects/[projectId]/documents/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth/jwt';
import prisma from '../../../../../../lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request, { params }) {
     try {
          const { projectId } = params;
          const token = request.cookies.get('accessToken')?.value;

          if (!token) {
               return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
               );
          }

          const decoded = verifyAccessToken(token);
          if (!decoded || decoded.role !== 'PROJECT_MANAGER') {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Verify project access
          const project = await prisma.project.findFirst({
               where: {
                    id: projectId,
                    managerId: decoded.id
               }
          });

          if (!project) {
               return NextResponse.json(
                    { error: 'Project not found or access denied' },
                    { status: 404 }
               );
          }

          const formData = await request.formData();
          const file = formData.get('file');
          const documentType = formData.get('type') || 'CLIENT_REQUIREMENT';
          const description = formData.get('description');

          if (!file) {
               return NextResponse.json(
                    { error: 'No file uploaded' },
                    { status: 400 }
               );
          }

          // Validate file type
          const validTypes = [
               'application/pdf',
               'application/msword',
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
               'application/vnd.ms-excel',
               'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
               'image/jpeg',
               'image/png',
               'application/zip'
          ];

          if (!validTypes.includes(file.type)) {
               return NextResponse.json(
                    { error: 'Invalid file type. Please upload documents (PDF, DOC, XLS, images) or ZIP files.' },
                    { status: 400 }
               );
          }

          // Validate file size (max 20MB)
          if (file.size > 20 * 1024 * 1024) {
               return NextResponse.json(
                    { error: 'File too large. Maximum size is 20MB' },
                    { status: 400 }
               );
          }

          // Convert file to buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename
          const ext = path.extname(file.name);
          const filename = `project-${projectId}-${uuidv4()}${ext}`;

          // Ensure upload directory exists
          const uploadDir = path.join(process.cwd(), 'public/uploads/projects');
          await mkdir(uploadDir, { recursive: true });

          // Save file
          const filepath = path.join(uploadDir, filename);
          await writeFile(filepath, buffer);

          // Public URL
          const fileUrl = `/uploads/projects/${filename}`;

          // Create document record
          const document = await prisma.document.create({
               data: {
                    name: file.name,
                    fileName: filename,
                    fileSize: file.size,
                    fileType: file.type,
                    url: fileUrl,
                    type: documentType,
                    description,
                    projectId,
                    uploadedById: decoded.id
               }
          });

          // Log activity
          await prisma.activityLog.create({
               data: {
                    action: 'UPLOAD_DOCUMENT',
                    entityType: 'project',
                    entityId: projectId,
                    details: {
                         fileName: file.name,
                         documentType,
                         projectName: project.name
                    },
                    userId: decoded.id
               }
          });

          return NextResponse.json({
               success: true,
               message: 'Document uploaded successfully',
               document
          });

     } catch (error) {
          console.error('Document upload error:', error);
          return NextResponse.json(
               { error: 'Failed to upload document' },
               { status: 500 }
          );
     }
}