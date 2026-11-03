'use client';

import { useEffect, useRef, useState } from 'react';

interface MediaPlayerProps {
  sourceUrl: string;
  sourceType: 'upload' | 'youtube' | 'url';
  fileName: string;
}

export function MediaPlayer({ sourceUrl, sourceType, fileName }: MediaPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);
  const originalTopRef = useRef<number>(0);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Store original position
    if (playerRef.current && originalTopRef.current === 0) {
      originalTopRef.current = playerRef.current.getBoundingClientRect().top + window.scrollY;
    }

    const handleScroll = () => {
      if (playerRef.current && originalTopRef.current > 0) {
        const scrollY = window.scrollY;
        const shouldStick = scrollY > originalTopRef.current - 70;
        setIsSticky(shouldStick);

        // Reset position when becoming sticky
        if (shouldStick && position.x === 0 && position.y === 0) {
          setPosition({ x: window.innerWidth - 352, y: 80 }); // 352px = 320px (w-80) + 32px padding
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [position.x, position.y]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && playerRef.current) {
        const playerWidth = 320; // w-80 = 320px
        const playerHeight = playerRef.current.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newX = e.clientX - dragOffsetRef.current.x;
        let newY = e.clientY - dragOffsetRef.current.y;

        // Clamp to viewport boundaries with padding
        newX = Math.max(16, Math.min(newX, viewportWidth - playerWidth - 32)); // 16px left, 32px right
        newY = Math.max(16, Math.min(newY, viewportHeight - playerHeight - 16)); // 16px top and bottom

        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging && playerRef.current) {
        const playerWidth = 320; // w-80 = 320px
        const viewportWidth = window.innerWidth;
        const centerX = viewportWidth / 2;

        // Snap to nearest edge (left or right)
        setPosition((prev) => ({
          x: prev.x < centerX ? 16 : viewportWidth - playerWidth - 32, // 32px padding on right
          y: prev.y,
        }));
      }
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSticky) return;

    e.preventDefault(); // Prevent text selection

    const rect = playerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
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

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  };

  const getGoogleDriveEmbedUrl = (url: string): string | null => {
    try {
      if (!url) return null;
      const trimmed = url.trim();
      if (!trimmed.includes('drive.google.com')) return null;
      const match =
        trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return null;
    } catch {
      return null;
    }
  };

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-sm">{error}</span>
          </div>
          {sourceUrl && sourceUrl.startsWith('http') && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline shrink-0"
            >
              Open source ↗
            </a>
          )}
        </div>
      </div>
    );
  }

  if (sourceType === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(sourceUrl);

    if (!embedUrl) {
      return (
        <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Could not load YouTube video</span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={playerRef}
        className={`bg-red-50 rounded-lg border border-red-300 select-none ${
          isDragging ? '' : 'transition-all duration-300'
        } ${
          isSticky ? 'fixed z-40 shadow-xl w-80' : 'w-full'
        } ${isMinimized ? 'p-1.5' : isSticky ? 'p-2' : 'p-4'} ${isDragging ? 'cursor-grabbing' : isSticky ? 'cursor-grab' : ''}`}
        style={isSticky ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg
            className={`${isSticky ? 'w-3 h-3' : 'w-4 h-4'} text-red-600`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className={`${isSticky ? 'text-[10px]' : 'text-xs'} font-medium text-red-900`}>
            YouTube
          </span>
          <span className={`${isSticky ? 'text-[10px]' : 'text-xs'} text-gray-500 truncate flex-1`}>
            {fileName}
          </span>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-0.5 hover:bg-red-100 rounded transition-colors"
            title={isMinimized ? 'Expand player' : 'Minimize player'}
          >
            <svg
              className={`${isSticky ? 'w-3 h-3' : 'w-4 h-4'} text-red-700`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMinimized ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              )}
            </svg>
          </button>
        </div>
        <div
          className={`relative w-full ${isMinimized ? 'hidden' : ''}`}
          style={{ paddingBottom: '56.25%' }}
        >
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full rounded-md"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (sourceType === 'upload') {
    const isAudio = !fileName.match(/\.(mp4|mov|mkv)$/i) && !sourceUrl.match(/\.(mp4|mov|mkv)$/i);

    return (
      <div
        ref={playerRef}
        className={`bg-indigo-50/80 rounded-xl border border-indigo-200 select-none shadow-sm ${
          isDragging ? '' : 'transition-all duration-300'
        } ${
          isSticky ? 'fixed z-40 shadow-xl w-80' : 'w-full'
        } ${isMinimized ? 'p-1.5' : isSticky ? 'p-2' : 'p-4'} ${isDragging ? 'cursor-grabbing' : isSticky ? 'cursor-grab' : ''}`}
        style={isSticky ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="p-1 rounded bg-indigo-100 text-indigo-700">
            <svg
              className={`${isSticky ? 'w-3 h-3' : 'w-4 h-4'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </div>
          <span className={`${isSticky ? 'text-[10px]' : 'text-xs'} font-semibold text-indigo-950`}>
            {isAudio ? 'Audio' : 'Media'}
          </span>
          <span
            className={`${isSticky ? 'text-[10px]' : 'text-xs'} text-indigo-700 truncate flex-1 font-medium`}
          >
            {fileName}
          </span>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-0.5 hover:bg-indigo-100 rounded transition-colors text-indigo-700"
            title={isMinimized ? 'Expand player' : 'Minimize player'}
          >
            <svg
              className={`${isSticky ? 'w-3 h-3' : 'w-4 h-4'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMinimized ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              )}
            </svg>
          </button>
        </div>
        <div className={isMinimized ? 'hidden' : ''}>
          {isAudio ? (
            <audio
              controls
              preload="metadata"
              className="w-full h-10 outline-none rounded-lg"
              onError={() => setError('Failed to load audio')}
            >
              <source src={sourceUrl} />
              Your browser does not support audio playback.
            </audio>
          ) : (
            <video
              controls
              preload="metadata"
              className="w-full rounded-md"
              onError={() => setError('Failed to load media')}
            >
              <source src={sourceUrl} />
              Your browser does not support video playback.
            </video>
          )}
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  const googleDriveEmbedUrl = getGoogleDriveEmbedUrl(sourceUrl);
  if (googleDriveEmbedUrl) {
    return (
      <div
        ref={playerRef}
        className={`bg-amber-50/90 rounded-xl border border-amber-300 select-none shadow-sm ${
          isDragging ? '' : 'transition-all duration-300'
        } ${
          isSticky ? 'fixed z-40 shadow-xl w-80' : 'w-full'
        } ${isMinimized ? 'p-1.5' : isSticky ? 'p-2' : 'p-4'} ${isDragging ? 'cursor-grabbing' : isSticky ? 'cursor-grab' : ''}`}
        style={isSticky ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[10px] font-bold tracking-wide uppercase">
            Drive
          </div>
          <span className={`${isSticky ? 'text-[10px]' : 'text-xs'} font-semibold text-amber-950`}>
            Google Drive
          </span>
          <span
            className={`${isSticky ? 'text-[10px]' : 'text-xs'} text-amber-800 truncate flex-1 font-medium`}
          >
            {fileName}
          </span>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-0.5 hover:bg-amber-100 rounded transition-colors text-amber-700"
            title={isMinimized ? 'Expand player' : 'Minimize player'}
          >
            <svg
              className={`${isSticky ? 'w-3 h-3' : 'w-4 h-4'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMinimized ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              )}
            </svg>
          </button>
        </div>
        <div
          className={`relative w-full ${isMinimized ? 'hidden' : ''}`}
          style={{ paddingBottom: '56.25%' }}
        >
          <iframe
            src={googleDriveEmbedUrl}
            className="absolute top-0 left-0 w-full h-full rounded-md border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // For direct media URLs
  const isAudio =
    !fileName.match(/\.(mp4|mov|mkv|webm|avi)$/i) && !sourceUrl.match(/\.(mp4|mov|mkv|webm|avi)$/i);

  return (
    <div
      ref={playerRef}
      className={`bg-blue-50 rounded-lg border border-blue-300 select-none ${
        isDragging ? '' : 'transition-all duration-300'
      } ${
        isSticky ? 'fixed z-40 shadow-xl w-80' : 'w-full'
      } ${isMinimized ? 'p-1.5' : isSticky ? 'p-2' : 'p-4'} ${isDragging ? 'cursor-grabbing' : isSticky ? 'cursor-grab' : ''}`}
      style={isSticky ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <svg
          className={`${isSticky ? 'w-3 h-3' : 'w-4 h-4'} text-blue-600`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className={`${isSticky ? 'text-[10px]' : 'text-xs'} font-medium text-blue-900`}>
          {isAudio ? 'Audio' : 'Media'}
        </span>
        <span className={`${isSticky ? 'text-[10px]' : 'text-xs'} text-blue-700 truncate flex-1`}>
          {fileName}
        </span>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-0.5 hover:bg-blue-100 rounded transition-colors"
          title={isMinimized ? 'Expand player' : 'Minimize player'}
        >
          <svg
            className={`${isSticky ? 'w-3 h-3' : 'w-4 h-4'} text-blue-700`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMinimized ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            )}
          </svg>
        </button>
      </div>
      <video
        controls
        preload="metadata"
        className={`w-full rounded-md ${isMinimized ? 'hidden' : ''}`}
        onError={() => setError('Failed to load media')}
      >
        <source src={sourceUrl} />
        Your browser does not support video playback.
      </video>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
