// app/api/user/profile/avatar/route.js
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
          if (!decoded) {
               return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
               );
          }

          const formData = await request.formData();
          const file = formData.get('avatar');

          if (!file) {
               return NextResponse.json(
                    { error: 'No file uploaded' },
                    { status: 400 }
               );
          }

          // If Cloudinary is configured, use it
          if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
               const { v2: cloudinary } = await import('cloudinary');
               cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET
               });

               const bytes = await file.arrayBuffer();
               const buffer = Buffer.from(bytes);

               const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                         { folder: 'avatars', public_id: `user-${decoded.id}-${Date.now()}`, resource_type: 'auto' },
                         (err, result) => (err ? reject(err) : resolve(result))
                    ).end(buffer);
               });

               const avatarUrl = uploadResult.secure_url;

               await prisma.user.update({
                    where: { id: decoded.id },
                    data: { avatar: avatarUrl }
               });

               return NextResponse.json({ avatar: avatarUrl });
          }

          // Accept URL in body as fallback (e.g. from client-side upload)
          return NextResponse.json(
               { error: 'Avatar upload not configured. Set CLOUDINARY_* env variables or provide avatar URL in profile update.' },
               { status: 501 }
          );
     } catch (error) {
          console.error('Avatar upload error:', error);
          return NextResponse.json(
               { error: 'Failed to upload avatar' },
               { status: 500 }
          );
     }
}

export async function DELETE(request) {
     try {
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

          await prisma.user.update({
               where: { id: decoded.id },
               data: { avatar: null }
          });

          return NextResponse.json({ success: true, avatar: null });
     } catch (error) {
          console.error('Avatar remove error:', error);
          return NextResponse.json(
               { error: 'Failed to remove avatar' },
               { status: 500 }
          );
     }
}
