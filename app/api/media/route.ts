import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs, createReadStream } from 'fs';
import { Readable } from 'stream';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const MIME_MAP: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.webm': 'audio/webm',
  '.flac': 'audio/flac',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
};

/**
 * Streaming media endpoint for uploaded audio/video files
 * Supports HTTP Range requests for seamless audio seeking/scrubbing
 * GET /api/media?file=<filename>
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawFile = searchParams.get('file');

    if (!rawFile) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
    }

    // Prevent directory traversal attacks
    const safeFilename = path.basename(rawFile);
    if (!safeFilename || safeFilename === '.' || safeFilename.includes('..')) {
      return NextResponse.json({ error: 'Invalid file parameter' }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, safeFilename);

    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    if (!stats.isFile()) {
      return NextResponse.json({ error: 'Invalid media file' }, { status: 400 });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';
    const totalSize = stats.size;

    const range = request.headers.get('range');

    if (range) {
      // Parse Range header: bytes=start-end
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${totalSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(fileStream) as ReadableStream<Uint8Array>;

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Full stream response
    const fileStream = createReadStream(filePath);
    const webStream = Readable.toWeb(fileStream) as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': totalSize.toString(),
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Media API] Error streaming media:', error);
    return NextResponse.json({ error: 'Internal server error streaming media' }, { status: 500 });
  }
}
