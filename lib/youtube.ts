import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { getFFmpegLocation } from '@/lib/ffmpeg';

const execPromise = promisify(exec);
const execFilePromise = promisify(execFile);

export interface YoutubeDownloadResult {
  audioPath: string;
  title: string;
  duration?: number;
}

interface YtDlpExecutable {
  cmd: string;
  argsPrefix: string[];
}

let cachedExecutable: YtDlpExecutable | null = null;

/**
 * Detect available yt-dlp executable or Python module fallback
 */
export async function getYtDlpExecutable(): Promise<YtDlpExecutable | null> {
  if (cachedExecutable) {
    return cachedExecutable;
  }

  // 1. Try direct yt-dlp binary
  try {
    await execPromise('yt-dlp --version');
    cachedExecutable = { cmd: 'yt-dlp', argsPrefix: [] };
    return cachedExecutable;
  } catch {}

  // 2. Try python -m yt_dlp
  try {
    await execPromise('python -m yt_dlp --version');
    cachedExecutable = { cmd: 'python', argsPrefix: ['-m', 'yt_dlp'] };
    return cachedExecutable;
  } catch {}

  // 3. Try python3 -m yt_dlp
  try {
    await execPromise('python3 -m yt_dlp --version');
    cachedExecutable = { cmd: 'python3', argsPrefix: ['-m', 'yt_dlp'] };
    return cachedExecutable;
  } catch {}

  return null;
}

/**
 * Check if yt-dlp is installed
 */
export async function checkYtDlpInstalled(): Promise<boolean> {
  const executable = await getYtDlpExecutable();
  return executable !== null;
}

/**
 * Download audio from YouTube video using yt-dlp
 * Returns path to downloaded audio file
 */
export async function downloadYoutubeAudio(url: string): Promise<YoutubeDownloadResult> {
  // Check if yt-dlp is installed
  const executable = await getYtDlpExecutable();
  if (!executable) {
    throw new Error(
      'yt-dlp is not installed. Please install it:\n' +
        'macOS: brew install yt-dlp\n' +
        'Linux: sudo apt install yt-dlp or pip install yt-dlp\n' +
        'Windows: winget install yt-dlp or pip install yt-dlp'
    );
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const timestamp = Date.now();
  const outputTemplate = path.join(uploadsDir, `youtube_${timestamp}`);

  try {
    console.log('[YouTube] Starting download:', url);

    // Use yt-dlp to download audio only
    // -x: extract audio
    // --audio-format mp3: convert to mp3
    // --audio-quality 0: best quality
    // -o: output template (without extension - yt-dlp will add .mp3)
    // --max-filesize 500M: limit to 500MB to avoid extremely long videos
    // --no-playlist: only download single video, not playlist
    // --newline: output newlines for easier parsing
    // --no-simulate: actually download (not just simulate)
    const ffmpegLocation = getFFmpegLocation();
    const args = [
      ...executable.argsPrefix,
      '-x',
      '--audio-format',
      'mp3',
      '--audio-quality',
      '0',
      '--max-filesize',
      '500M',
      '--no-playlist',
      '--newline',
      '--no-simulate',
      ...(ffmpegLocation ? ['--ffmpeg-location', ffmpegLocation] : []),
      '-o',
      `${outputTemplate}.%(ext)s`,
      '--print',
      'title',
      '--print',
      'duration',
      url,
    ];

    console.log('[YouTube] Executing yt-dlp with arguments for URL:', url);
    console.log('[YouTube] Expected output file pattern:', `${outputTemplate}.*`);

    let stdout: string;
    let stderr: string;

    try {
      const result = await execFilePromise(executable.cmd, args, {
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for longer output
        timeout: 5 * 60 * 1000, // 5 minutes timeout for long videos
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (execError: any) {
      console.error('[YouTube] Command execution failed:', execError);
      console.error('[YouTube] Error stdout:', execError.stdout);
      console.error('[YouTube] Error stderr:', execError.stderr);

      // Check if it's a timeout
      if (execError.killed && execError.signal === 'SIGTERM') {
        throw new Error('Download timeout (video too long). Try a shorter video.');
      }
      // Check if it's a filesize limit
      if (
        execError.stderr?.includes('max-filesize') ||
        execError.message?.includes('max-filesize')
      ) {
        throw new Error('Video is too large (>500MB). Try a shorter video.');
      }
      // Check if video is unavailable or private
      if (
        execError.stderr?.includes('Private video') ||
        execError.stderr?.includes('unavailable')
      ) {
        throw new Error('Video is private or unavailable');
      }

      throw new Error(`yt-dlp error: ${execError.stderr || execError.message || 'Unknown error'}`);
    }

    if (stderr) {
      console.log('[YouTube] stderr:', stderr);

      // Check for warnings that might indicate issues
      if (stderr.includes('ERROR')) {
        throw new Error(`yt-dlp error in stderr: ${stderr}`);
      }
    }

    console.log('[YouTube] stdout:', stdout);

    // Parse output: title, duration (no filepath in output)
    const lines = stdout
      .trim()
      .split('\n')
      .filter((line) => line.trim());
    console.log('[YouTube] Parsed lines:', lines);

    const title = lines[0]?.trim() || 'YouTube Video';
    const durationStr = lines[1]?.trim();
    const duration = durationStr ? parseFloat(durationStr) : undefined;

    console.log('[YouTube] Parsed data:', { title, duration });

    // Wait a bit for file system to sync (especially on macOS)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Since we don't get filepath from output, find the downloaded file by pattern
    // yt-dlp will create file as: youtube_<timestamp>.mp3
    const extensions = ['.mp3', '.webm', '.m4a', '.opus', '.ogg', '.aac'];
    let finalAudioPath: string | null = null;

    console.log('[YouTube] Looking for file with base path:', outputTemplate);

    for (const ext of extensions) {
      const testPath = `${outputTemplate}${ext}`;
      console.log('[YouTube] Checking path:', testPath);
      const exists = await fs.stat(testPath).catch(() => null);
      if (exists) {
        finalAudioPath = testPath;
        console.log('[YouTube] Found audio file with extension:', ext, 'at', testPath);
        break;
      }
    }

    if (!finalAudioPath) {
      // List files in uploads directory for debugging
      const files = await fs.readdir(uploadsDir);
      console.log('[YouTube] Files in uploads directory:', files);
      console.log('[YouTube] Looking for pattern: youtube_' + timestamp);

      // Try to find any file that matches our timestamp pattern
      const matchingFile = files.find((f) => f.startsWith(`youtube_${timestamp}`));
      if (matchingFile) {
        finalAudioPath = path.join(uploadsDir, matchingFile);
        console.log('[YouTube] Found matching file by pattern:', matchingFile);
      } else {
        throw new Error(
          `Audio file not found with pattern youtube_${timestamp}.*. Files in directory: ${files.join(', ')}`
        );
      }
    }

    console.log('[YouTube] Download successful:', { audioPath: finalAudioPath, title, duration });

    return {
      audioPath: finalAudioPath,
      title,
      duration,
    };
  } catch (error) {
    console.error('[YouTube] Download failed:', error);
    throw new Error(
      `Failed to download YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate YouTube URL
 */
export function isValidYoutubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return (
      hostname === 'www.youtube.com' ||
      hostname === 'youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'm.youtube.com'
    );
  } catch {
    return false;
  }
}

/**
 * Extract video ID from YouTube URL
 */
export function getYoutubeVideoId(url: string): string | null {
  try {
    if (!url) return null;
    const trimmed = url.trim();
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    let videoId: string | null = null;

    if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1]?.split(/[?#&/]/)[0];
      } else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1]?.split(/[?#&/]/)[0];
      } else if (urlObj.pathname.startsWith('/live/')) {
        videoId = urlObj.pathname.split('/live/')[1]?.split(/[?#&/]/)[0];
      } else if (urlObj.pathname.startsWith('/v/')) {
        videoId = urlObj.pathname.split('/v/')[1]?.split(/[?#&/]/)[0];
      } else {
        videoId = urlObj.searchParams.get('v');
      }
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
    }

    if (videoId) {
      videoId = videoId.split(/[?#&]/)[0];
    }

    return videoId || null;
  } catch {
    return null;
  }
}
