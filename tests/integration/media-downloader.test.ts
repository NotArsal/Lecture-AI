import { describe, it, expect } from 'vitest';
import { resolveDirectMediaUrl, isValidMediaUrl } from '@/lib/media-downloader';

describe('Media Downloader URL Resolution', () => {
  it('resolves Google Drive view sharing link to direct export URL', () => {
    const shareLink =
      'https://drive.google.com/file/d/1mIX_9sm4eFVoFJeU2OOqN9tmCdkYAc70/view?usp=sharing';
    const resolved = resolveDirectMediaUrl(shareLink);
    expect(resolved).toBe(
      'https://drive.google.com/uc?export=download&id=1mIX_9sm4eFVoFJeU2OOqN9tmCdkYAc70'
    );
  });

  it('resolves Google Drive open?id= link to direct export URL', () => {
    const openLink = 'https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQrStUvWxYz';
    const resolved = resolveDirectMediaUrl(openLink);
    expect(resolved).toBe(
      'https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQrStUvWxYz'
    );
  });

  it('resolves Dropbox sharing link to direct download link (dl=1)', () => {
    const dropboxLink = 'https://www.dropbox.com/s/sample123/lecture.mp3?dl=0';
    const resolved = resolveDirectMediaUrl(dropboxLink);
    expect(resolved).toContain('dl=1');
  });

  it('leaves standard direct media URLs unchanged', () => {
    const directUrl = 'https://example.com/media/lecture.mp3';
    expect(resolveDirectMediaUrl(directUrl)).toBe(directUrl);
  });

  it('validates public URLs correctly and blocks SSRF/internal addresses', () => {
    expect(isValidMediaUrl('https://drive.google.com/file/d/123/view')).toBe(true);
    expect(isValidMediaUrl('https://example.com/audio.mp3')).toBe(true);

    // Block private/internal addresses
    expect(isValidMediaUrl('http://localhost:3000')).toBe(false);
    expect(isValidMediaUrl('http://127.0.0.1:8000')).toBe(false);
    expect(isValidMediaUrl('http://192.168.1.1/router')).toBe(false);
    expect(isValidMediaUrl('http://10.0.0.1')).toBe(false);
    expect(isValidMediaUrl('http://169.254.169.254/latest/meta-data/')).toBe(false);
    expect(isValidMediaUrl('ftp://example.com/file.mp3')).toBe(false);
  });
});
