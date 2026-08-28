'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import type { MutationResult, LectureNotes, UploadedFile, ProcessingState } from '@/types';
import { validateFile } from '@/utils/validateFile';
import {
  extractAudioFromVideo,
  cleanupTempFile,
  compressAudioIfNeeded,
  checkFFmpegAvailable,
  getFFmpegValidationDetails,
} from '@/lib/ffmpeg';
import { transcribeAudio, summarizeTranscript, translateTranscript } from '@/lib/ai';
import { saveUploadedFile, cleanupUploadedFile } from '@/lib/upload';
import { promises as fs } from 'fs';
import { rateLimiter, RATE_LIMITS, getClientId, formatTimeRemaining } from '@/lib/rate-limiter';
import { downloadMediaFromUrl, isValidMediaUrl } from '@/lib/media-downloader';
import { downloadYoutubeAudio, isValidYoutubeUrl } from '@/lib/youtube';
import { formatTranscript } from '@/lib/ai';
import { formatApiError } from '@/utils/format-api-error';


async function processAudioPipeline(
  originalAudioPath: string,
  originalFilename: string,
  language: 'english' | 'hinglish',
  customGroqKey?: string,
  sourceUrl?: string,
  sourceType?: 'upload' | 'youtube' | 'url'
): Promise<MutationResult<LectureNotes>> {
  let currentAudioPath = originalAudioPath;
  let compressedAudio: string | null = null;
  
  try {
    const stats = await fs.stat(currentAudioPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`[Pipeline] Audio size: ${fileSizeMB.toFixed(2)}MB`);

    if (fileSizeMB > 24) {
      console.log('[Pipeline] Audio too large, compressing...');
      compressedAudio = await compressAudioIfNeeded(currentAudioPath, 24);
      currentAudioPath = compressedAudio;
    }

    const transcriptionResult = await transcribeAudio(currentAudioPath, {
      language: language === 'hinglish' ? 'id' : 'en',
      customGroqKey
    });

    let transcriptText = transcriptionResult.text;
    if (language === 'hinglish') {
      transcriptText = await translateTranscript(transcriptText, 'hinglish', { customGroqKey });
    }

    const formattedTranscript = await formatTranscript(transcriptText, language, { customGroqKey });
    const lectureNotes = await summarizeTranscript(transcriptText, originalFilename, {
      language,
      detailLevel: 'detailed',
      customGroqKey
    });

    return {
      success: true,
      data: {
        ...lectureNotes,
        transcript: formattedTranscript,
        metadata: {
          ...lectureNotes.metadata,
          sourceUrl,
          sourceType: sourceType || 'upload',
        },
      },
    };
  } catch (error) {
    throw error;
  } finally {
    if (compressedAudio && compressedAudio !== originalAudioPath) {
      await cleanupUploadedFile(compressedAudio).catch(() => {});
    }
  }
}

export async function createTranscriptionMutation(
  formData: FormData
): Promise<MutationResult<LectureNotes>> {
  try {
    // Get client identifier for rate limiting
    const headersList = await headers();
    const clientId = getClientId(new Request('http://localhost', { headers: headersList }));

    // Check hourly rate limit (10 transcriptions per hour)
    const hourlyAllowed = rateLimiter.check(
      `transcription:hourly:${clientId}`,
      RATE_LIMITS.TRANSCRIPTION.MAX_REQUESTS,
      RATE_LIMITS.TRANSCRIPTION.WINDOW_MS
    );

    if (!hourlyAllowed) {
      const status = rateLimiter.getStatus(`transcription:hourly:${clientId}`);
      const resetIn = status ? formatTimeRemaining(status.resetTime) : 'soon';
      return {
        success: false,
        error: `Rate limit exceeded. You can only transcribe ${RATE_LIMITS.TRANSCRIPTION.MAX_REQUESTS} files per hour on the free tier. Please try again in ${resetIn}.`,
      };
    }

    // Check daily rate limit (50 transcriptions per day)
    const dailyAllowed = rateLimiter.check(
      `transcription:daily:${clientId}`,
      RATE_LIMITS.DAILY.MAX_TRANSCRIPTIONS,
      RATE_LIMITS.DAILY.WINDOW_MS
    );

    if (!dailyAllowed) {
      const status = rateLimiter.getStatus(`transcription:daily:${clientId}`);
      const resetIn = status ? formatTimeRemaining(status.resetTime) : 'tomorrow';
      return {
        success: false,
        error: `Daily limit exceeded. You can transcribe up to ${RATE_LIMITS.DAILY.MAX_TRANSCRIPTIONS} files per day on the free tier. Resets in ${resetIn}.`,
      };
    }

    const file = formData.get('file') as File | null;
    const youtubeUrl = formData.get('youtubeUrl') as string | null;
    const mediaUrl = formData.get('mediaUrl') as string | null;
    const language = (formData.get('language') as 'english' | 'hinglish') || 'english';
    const customGroqKey = formData.get('customGroqKey') as string | null;

    if (!file && !youtubeUrl && !mediaUrl) {
      return {
        success: false,
        error: 'No file, YouTube URL, or media URL provided',
      };
    }

    // Handle Media URL (generic URL download)
    if (mediaUrl) {
      if (!isValidMediaUrl(mediaUrl)) {
        return {
          success: false,
          error: 'Invalid media URL',
        };
      }

      let downloadedAudio: { audioPath: string; title: string } | null = null;
      let compressedAudio: string | null = null;

      try {
        downloadedAudio = await downloadMediaFromUrl(mediaUrl);
        const result = await processAudioPipeline(
          downloadedAudio.audioPath,
          `${downloadedAudio.title}.mp3`,
          language,
          customGroqKey || undefined,
          mediaUrl,
          'url'
        );
        await cleanupUploadedFile(downloadedAudio.audioPath).catch(() => {});
        return result;
      } catch (error) {
        if (downloadedAudio?.audioPath) await cleanupUploadedFile(downloadedAudio.audioPath).catch(() => {});
        throw error;
      }
    }

    // Handle YouTube URL
    if (youtubeUrl) {
      if (!isValidYoutubeUrl(youtubeUrl)) {
        return {
          success: false,
          error: 'Invalid YouTube URL',
        };
      }

      let downloadedAudio: { audioPath: string; title: string } | null = null;
      let compressedAudio: string | null = null;

      try {
        downloadedAudio = await downloadYoutubeAudio(youtubeUrl);
        const result = await processAudioPipeline(
          downloadedAudio.audioPath,
          `${downloadedAudio.title}.mp3`,
          language,
          customGroqKey || undefined,
          youtubeUrl,
          'youtube'
        );
        await cleanupUploadedFile(downloadedAudio.audioPath).catch(() => {});
        return result;
      } catch (error) {
        if (downloadedAudio?.audioPath) await cleanupUploadedFile(downloadedAudio.audioPath).catch(() => {});
        throw error;
      }
    }

    // Handle regular file upload
    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    const validation = validateFile(file.type, file.size, file.name);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Check FFmpeg availability for video files
    if (validation.fileType === 'video' && !checkFFmpegAvailable()) {
      return {
        success: false,
        error: getFFmpegValidationDetails(),
      };
    }

    const uploadedFile = await saveUploadedFile(file);
    let audioPath = uploadedFile.filepath;
    let tempAudioPath: string | null = null;

    try {
      if (validation.fileType === 'video') {
        const extractionResult = await extractAudioFromVideo(uploadedFile.filepath);
        tempAudioPath = extractionResult.audioPath;
        audioPath = tempAudioPath;
      }

      const result = await processAudioPipeline(
        audioPath,
        file.name,
        language,
        customGroqKey || undefined,
        undefined,
        'upload'
      );
      return result;
    } catch (error) {
      throw error;
    } finally {
      await cleanupUploadedFile(uploadedFile.filepath).catch(() => {});
      if (tempAudioPath) await cleanupUploadedFile(tempAudioPath).catch(() => {});
    }
  } catch (error) {
    console.error('Transcription failed:', error);
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function validateFileMutation(
  formData: FormData
): Promise<MutationResult<{ fileType: string; size: number }>> {
  try {
    const file = formData.get('file') as File | null;

    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    const validation = validateFile(file.type, file.size, file.name);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    return {
      success: true,
      data: {
        fileType: validation.fileType || 'unknown',
        size: file.size,
      },
    };
  } catch (error) {
    console.error('File validation failed:', error);
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getProcessingStatusAction(
  processingId: string
): Promise<MutationResult<ProcessingState>> {
  return {
    success: true,
    data: {
      step: 'complete',
      progress: 100,
      message: 'Processing complete',
    },
  };
}

export async function cleanupFilesAction(filePaths: string[]): Promise<MutationResult<void>> {
  try {
    await Promise.all(filePaths.map((path) => cleanupUploadedFile(path)));

    return {
      success: true,
    };
  } catch (error) {
    console.error('Cleanup failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed',
    };
  }
}


