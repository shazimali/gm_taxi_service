import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAuthenticatedAdmin } from '@/lib/auth';

// ── Security: explicit allowlist of upload destinations ──────────────────────
const ALLOWED_FOLDERS = new Set([
  'services',
  'vehicles',
  'airports',
  'locations',
  'general',
  'settings',
  'fleet',
]);

// ── Security: only allow safe image extensions ────────────────────────────────
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

export async function POST(req: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    // ── Validate folder against allowlist (prevents path traversal) ───────
    const rawFolder = (formData.get('folder') as string | null)?.trim() || 'general';
    if (!ALLOWED_FOLDERS.has(rawFolder)) {
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 });
    }
    const folder = rawFolder;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // ── Validate extension (client MIME type is spoofable — use extension) ──
    const rawExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: jpg, jpeg, png, webp, gif, avif' },
        { status: 400 }
      );
    }

    // ── Sanitize filename: strip any path separators, keep only safe chars ──
    const safeBasename = path
      .basename(file.name)
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeBasename}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── Write to the whitelisted directory only ───────────────────────────
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${folder}/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: unknown) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
