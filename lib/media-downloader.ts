import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const execPromise = promisify(exec);

export interface MediaDownloadResult {
  audioPath: string;
  title: string;
  duration?: number;
}

export async function downloadMediaFromUrl(url: string): Promise<MediaDownloadResult> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const timestamp = Date.now();
  const parsedUrl = new URL(url);
  const urlPath = parsedUrl.pathname;
  const extension = path.extname(urlPath).toLowerCase() || '.mp3';
  const outputPath = path.join(uploadsDir, `media_${timestamp}${extension}`);

  try {
    console.log('[MediaDownloader] Starting download:', url);
    console.log('[MediaDownloader] Output path:', outputPath);

    await downloadFile(url, outputPath);

    const stats = await fs.stat(outputPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`[MediaDownloader] Downloaded file size: ${fileSizeMB.toFixed(2)}MB`);

    if (stats.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    const title = path.basename(urlPath, extension) || `Media_${timestamp}`;

    return {
      audioPath: outputPath,
      title,
    };
  } catch (error) {
    try {
      await fs.unlink(outputPath);
    } catch {}

    if (error instanceof Error) {
      console.error('[MediaDownloader] Download error:', error.message);
      throw new Error(`Failed to download media: ${error.message}`);
    }
    throw error;
  }
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const file = require('fs').createWriteStream(outputPath);

    const request = protocol.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LectureAI/1.0)',
        },
      },
      (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (!redirectUrl) {
            reject(new Error('Redirect without location'));
            return;
          }
          file.close();
          downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    );

    request.on('error', (err) => {
      file.close();
      reject(err);
    });

    file.on('error', (err: Error) => {
      file.close();
      reject(err);
    });
  });
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
