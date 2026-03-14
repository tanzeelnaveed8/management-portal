import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';
import cloudinary from '../../../../../lib/cloudinary';

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

          const formData = await request.formData();
          const file = formData.get('file');
          const projectId = formData.get('projectId');

          if (!file) {
               return NextResponse.json(
                    { error: 'No file uploaded' },
                    { status: 400 }
               );
          }

          // Validate file type
          const validTypes = [
               'image/jpeg', 'image/png', 'image/gif', 'image/webp',
               'application/pdf', 'text/plain', 'application/json',
               'application/zip', 'application/x-zip-compressed'
          ];

          if (!validTypes.includes(file.type)) {
               return NextResponse.json(
                    { error: 'Invalid file type. Please upload images, PDF, text, or ZIP files.' },
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

          // Convert file to buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Upload to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
               const uploadStream = cloudinary.uploader.upload_stream(
                    {
                         folder: 'issue-reports',          // optional folder in Cloudinary
                         public_id: `issue-${Date.now()}-${Math.round(Math.random() * 1000)}`,
                         resource_type: 'auto',            // auto-detect file type
                    },
                    (error, result) => {
                         if (error) reject(error);
                         else resolve(result);
                    }
               );
               uploadStream.end(buffer);
          });

          // Cloudinary returns secure_url and public_id
          const fileUrl = uploadResult.secure_url;
          const publicId = uploadResult.public_id;

          // Optionally create a document record in the database
          let document = null;
          if (projectId) {
               document = await prisma.document.create({
                    data: {
                         name: file.name,
                         fileName: publicId,                 // store Cloudinary public_id
                         fileSize: file.size,
                         fileType: file.type,
                         url: fileUrl,                        // Cloudinary URL
                         type: 'PROJECT_DOC',
                         projectId,
                         uploadedById: decoded.id,
                    },
               });
          }

          return NextResponse.json({
               success: true,
               fileUrl,                                 // Cloudinary URL
               fileName: file.name,
               fileSize: file.size,
               publicId,                                // optional, for deletion later
               document,
          });
     } catch (error) {
          console.error('Cloudinary upload error:', error);
          return NextResponse.json(
               { error: 'Failed to upload file to Cloudinary' },
               { status: 500 }
          );
     }
}