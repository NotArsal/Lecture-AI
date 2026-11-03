import { describe, it, expect } from 'vitest';
import { getYtDlpExecutable, isValidYoutubeUrl, getYoutubeVideoId } from '@/lib/youtube';
import { getFFmpegLocation } from '@/lib/ffmpeg';

describe('YouTube Integration & Path Resolution', () => {
  it('should detect yt-dlp executable or handle missing installation gracefully', async () => {
    const executable = await getYtDlpExecutable();
    if (executable) {
      expect(typeof executable.cmd).toBe('string');
      expect(Array.isArray(executable.argsPrefix)).toBe(true);
    } else {
      expect(executable).toBeNull();
    }
  });

  it('should resolve ffmpeg location directory or return null when not found', () => {
    const location = getFFmpegLocation();
    if (location !== null) {
      expect(typeof location).toBe('string');
    } else {
      expect(location).toBeNull();
    }
  });

  it('should validate valid and invalid youtube URLs', () => {
    expect(isValidYoutubeUrl('https://www.youtube.com/watch?v=GyJkC1hql2E')).toBe(true);
    expect(isValidYoutubeUrl('https://youtu.be/GyJkC1hql2E')).toBe(true);
    expect(isValidYoutubeUrl('https://example.com/video.mp4')).toBe(false);
  });

  it('should extract video ID correctly from various formats', () => {
    expect(getYoutubeVideoId('https://www.youtube.com/watch?v=GyJkC1hql2E')).toBe('GyJkC1hql2E');
    expect(getYoutubeVideoId('https://youtu.be/GyJkC1hql2E?si=123')).toBe('GyJkC1hql2E');
    expect(getYoutubeVideoId('https://www.youtube.com/shorts/GyJkC1hql2E')).toBe('GyJkC1hql2E');
    expect(getYoutubeVideoId('https://youtube.com/live/GyJkC1hql2E')).toBe('GyJkC1hql2E');
    expect(getYoutubeVideoId('https://www.youtube.com/embed/GyJkC1hql2E')).toBe('GyJkC1hql2E');
    expect(getYoutubeVideoId('youtu.be/GyJkC1hql2E')).toBe('GyJkC1hql2E');
    expect(getYoutubeVideoId('https://invalid.com')).toBeNull();
  });
});
