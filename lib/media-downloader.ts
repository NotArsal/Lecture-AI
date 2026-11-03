import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { URL } from 'url';

export interface MediaDownloadResult {
  audioPath: string;
  title: string;
  duration?: number;
  isVideo?: boolean;
}

const MIME_TO_EXT: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-matroska': '.mkv',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/aac': '.aac',
  'audio/ogg': '.ogg',
  'audio/webm': '.webm',
  'audio/flac': '.flac',
};

/**
 * Resolves cloud sharing links (e.g. Google Drive, Dropbox) into direct media stream URLs
 */
export function resolveDirectMediaUrl(url: string): string {
  try {
    const trimmed = url.trim();

    // 1. Google Drive URLs
    // Formats:
    // https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing
    // https://drive.google.com/open?id=<FILE_ID>
    // https://docs.google.com/file/d/<FILE_ID>/...
    if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
      const match =
        trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
        trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }

    // 2. Dropbox URLs
    if (trimmed.includes('dropbox.com')) {
      const u = new URL(trimmed);
      u.searchParams.set('dl', '1');
      return u.toString();
    }

    return trimmed;
  } catch {
    return url;
  }
}

function parseFilenameFromHeaders(
  contentDisposition: string | null,
  contentType: string | null,
  fallbackTitle: string
): { filename: string; extension: string; title: string } {
  let filename = '';

  if (contentDisposition) {
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i);
    if (utf8Match) {
      try {
        filename = decodeURIComponent(utf8Match[1]);
      } catch {}
    }

    if (!filename) {
      const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
      if (quotedMatch) {
        filename = quotedMatch[1].trim();
      } else {
        const unquotedMatch = contentDisposition.match(/filename=([^;\s]+)/i);
        if (unquotedMatch) {
          filename = unquotedMatch[1].trim();
        }
      }
    }
  }

  let extension = '';
  if (filename) {
    extension = path.extname(filename).toLowerCase();
  }

  if (!extension && contentType) {
    const cleanType = contentType.split(';')[0].trim().toLowerCase();
    extension = MIME_TO_EXT[cleanType] || '';
  }

  if (!extension) {
    extension = '.mp3';
  }

  const title = filename ? path.basename(filename, extension) : fallbackTitle;

  return {
    filename: filename || `${title}${extension}`,
    extension,
    title,
  };
}

export async function downloadMediaFromUrl(rawUrl: string): Promise<MediaDownloadResult> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const directUrl = resolveDirectMediaUrl(rawUrl);
  const timestamp = Date.now();
  console.log('[MediaDownloader] Starting download:', rawUrl);
  if (directUrl !== rawUrl) {
    console.log('[MediaDownloader] Resolved direct URL:', directUrl);
  }

  let response = await fetch(directUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  let contentType = (response.headers.get('content-type') || '').toLowerCase();

  // Handle Google Drive virus scan warning for large files
  if (contentType.includes('text/html') && directUrl.includes('drive.google.com')) {
    const htmlText = await response.text();
    const confirmMatch =
      htmlText.match(/href="(\/uc\?export=download[^"]+confirm=[^"]+)"/i) ||
      htmlText.match(/href="(https:\/\/[^"]+confirm=[^"]+)"/i) ||
      htmlText.match(/action="(https:\/\/[^"]+confirm=[^"]+)"/i);

    if (confirmMatch) {
      let confirmUrl = confirmMatch[1].replace(/&amp;/g, '&');
      if (confirmUrl.startsWith('/')) {
        confirmUrl = `https://drive.google.com${confirmUrl}`;
      }
      console.log('[MediaDownloader] Following Google Drive confirmation URL...');
      response = await fetch(confirmUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        redirect: 'follow',
      });
      contentType = (response.headers.get('content-type') || '').toLowerCase();
    }
  }

  if (contentType.includes('text/html')) {
    throw new Error(
      'The provided URL returned a webpage (HTML) rather than a direct audio or video file. ' +
        'If this is a Google Drive link, make sure permissions are set to "Anyone with the link can view". ' +
        'If this is a YouTube video, please use the YouTube tab instead.'
    );
  }

  if (!response.body) {
    throw new Error('Downloaded file stream is empty');
  }

  const defaultTitle = `Media_${timestamp}`;
  const { extension, title } = parseFilenameFromHeaders(
    response.headers.get('content-disposition'),
    contentType,
    defaultTitle
  );

  const outputPath = path.join(uploadsDir, `media_${timestamp}${extension}`);
  console.log('[MediaDownloader] Output path:', outputPath);

  const fileStream = createWriteStream(outputPath);
  await pipeline(Readable.fromWeb(response.body as any), fileStream);

  const stats = await fs.stat(outputPath);
  const fileSizeMB = stats.size / (1024 * 1024);
  console.log(`[MediaDownloader] Downloaded file size: ${fileSizeMB.toFixed(2)}MB`);

  if (stats.size === 0) {
    await fs.unlink(outputPath).catch(() => {});
    throw new Error('Downloaded file is empty (0 bytes)');
  }

  const isVideo =
    /\.(mp4|mov|mkv|avi|webm)$/i.test(outputPath) || contentType.startsWith('video/');

  return {
    audioPath: outputPath,
    title,
    isVideo,
  };
}

export function isValidMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Prevent SSRF: block localhost, loopback, link-local, and private networks
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    // Check private IPv4 ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const octet1 = parseInt(match[1], 10);
      const octet2 = parseInt(match[2], 10);
      if (octet1 === 10) return false;
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
      if (octet1 === 192 && octet2 === 168) return false;
    }

    return true;
  } catch {
    return false;
  }
}
