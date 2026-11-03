import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/media/route';
import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

describe('Media Streaming API (/api/media)', () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const testFileName = `test_media_${Date.now()}.mp3`;
  const testFilePath = path.join(uploadsDir, testFileName);
  const sampleContent = Buffer.from('FAKE-AUDIO-STREAM-DATA-1234567890');

  beforeEach(async () => {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(testFilePath, sampleContent);
  });

  afterEach(async () => {
    await fs.unlink(testFilePath).catch(() => {});
  });

  it('returns 400 when file parameter is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/media');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Missing file parameter');
  });

  it('returns 400 for path traversal attempts', async () => {
    const req = new NextRequest('http://localhost:3000/api/media?file=..%2F..%2Fpackage.json');
    const res = await GET(req);
    // path.basename('../../package.json') is 'package.json' which is not in uploads, or error
    expect([400, 404]).toContain(res.status);
  });

  it('returns 404 when file does not exist', async () => {
    const req = new NextRequest('http://localhost:3000/api/media?file=nonexistent_file_99999.mp3');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('streams full audio file with 200 OK and Accept-Ranges', async () => {
    const req = new NextRequest(`http://localhost:3000/api/media?file=${testFileName}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Accept-Ranges')).toBe('bytes');
    expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
    expect(res.headers.get('Content-Length')).toBe(sampleContent.length.toString());
  });

  it('handles Range requests with 206 Partial Content', async () => {
    const req = new NextRequest(`http://localhost:3000/api/media?file=${testFileName}`, {
      headers: {
        range: 'bytes=0-9',
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(206);
    expect(res.headers.get('Content-Range')).toBe(`bytes 0-9/${sampleContent.length}`);
    expect(res.headers.get('Content-Length')).toBe('10');
    expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
  });

  it('returns 416 for invalid range bounds', async () => {
    const req = new NextRequest(`http://localhost:3000/api/media?file=${testFileName}`, {
      headers: {
        range: `bytes=${sampleContent.length + 500}-${sampleContent.length + 600}`,
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(416);
  });
});
