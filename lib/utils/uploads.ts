import { unlink } from 'fs/promises';
import path from 'path';

const UPLOADS_BASE_DIR = path.join(process.cwd(), 'public', 'uploads');

// Deletes a previously uploaded file given its public URL (e.g. "/uploads/fleet/123-abc.webp").
// No-ops for anything that isn't an /uploads/ URL (static assets, external URLs, empty values)
// and ignores "file already gone" errors so callers can call it unconditionally.
export async function deleteUploadedFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;

  const relativePath = url.replace(/^\/uploads\//, '');
  const filePath = path.join(UPLOADS_BASE_DIR, relativePath);

  if (!filePath.startsWith(UPLOADS_BASE_DIR)) return;

  try {
    await unlink(filePath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      console.error('Failed to delete uploaded file:', url, err);
    }
  }
}
