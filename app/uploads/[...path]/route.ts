import { NextResponse, NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const relativePath = resolvedParams.path.join('/');
    const filePath = path.join(process.cwd(), 'public', 'uploads', relativePath);

    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('File serving error:', err);
    return new NextResponse('File not found', { status: 404 });
  }
}
