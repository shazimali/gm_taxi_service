import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { path: string[] } | Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePathParts = resolvedParams.path || [];

    // Base directory for dynamic user uploads
    const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads');
    const safeFilePath = path.join(uploadsBaseDir, ...filePathParts);

    // Prevent directory traversal attacks
    if (!safeFilePath.startsWith(uploadsBaseDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fileBuffer = await readFile(safeFilePath);
    const ext = path.extname(safeFilePath).toLowerCase();

    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.webp') contentType = 'image/webp';
    if (ext === '.gif') contentType = 'image/gif';
    if (ext === '.svg') contentType = 'image/svg+xml';
    if (ext === '.avif') contentType = 'image/avif';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return new NextResponse('Image Not Found', { status: 404 });
  }
}
