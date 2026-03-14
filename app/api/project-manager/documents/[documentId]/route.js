// app/api/project-manager/documents/[documentId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth/jwt';
import prisma from '../../../../../lib/prisma';

export async function DELETE(request, { params }) {
     try {
          const { documentId } = await params;
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

          const document = await prisma.document.findFirst({
               where: { id: documentId },
               include: { project: true }
          });

          if (!document || !document.project || document.project.managerId !== decoded.id) {
               return NextResponse.json(
                    { error: 'Document not found or access denied' },
                    { status: 404 }
               );
          }

          await prisma.document.delete({
               where: { id: documentId }
          });

          return NextResponse.json({
               success: true,
               message: 'Document deleted successfully'
          });
     } catch (error) {
          console.error('Document delete error:', error);
          return NextResponse.json(
               { error: 'Failed to delete document' },
               { status: 500 }
          );
     }
}
