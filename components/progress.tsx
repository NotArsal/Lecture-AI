'use client';

import { useState, useEffect } from 'react';

interface ProgressIndicatorProps {
  progress: number;
  step: string;
  details?: string;
  estimatedTime?: string;
}

const WAVE_FRAMES = [
  ' ▂▃▄▅▆▇█▇▆▅▄▃▂   ▂▃▄▅▆▇█▇▆▅▄▃ ',
  '▂▃▄▅▆▇█▇▆▅▄▃▂   ▂▃▄▅▆▇█▇▆▅▄▃▂',
  '▃▄▅▆▇█▇▆▅▄▃▂   ▂▃▄▅▆▇█▇▆▅▄▃▂ ',
  '▄▅▆▇█▇▆▅▄▃▂   ▂▃▄▅▆▇█▇▆▅▄▃▂ ▂',
  '▅▆▇█▇▆▅▄▃▂   ▂▃▄▅▆▇█▇▆▅▄▃▂ ▂▃',
  '▆▇█▇▆▅▄▃▂   ▂▃▄▅▆▇█▇▆▅▄▃▂ ▂▃▄',
  '▇█▇▆▅▄▃▂   ▂▃▄▅▆▇█▇▆▅▄▃▂ ▂▃▄▅',
  '█▇▆▅▄▃▂   ▂▃▄▅▆▇█▇▆▅▄▃▂ ▂▃▄▅▆',
];

const stepIcons: Record<string, string> = {
  'Validating file': '🔍',
  'Uploading file': '📤',
  'Extracting audio': '🎵',
  'Compressing audio': '🗜️',
  'Transcribing audio': '🎙️',
  'Generating notes': '📝',
  Complete: '✅',
};

export function ProgressIndicator({
  progress,
  step,
  details,
  estimatedTime,
}: ProgressIndicatorProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (progress >= 100) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % WAVE_FRAMES.length);
    }, 140);
    return () => clearInterval(interval);
  }, [progress]);

  const icon = Object.entries(stepIcons).find(([key]) => step.includes(key))?.[1] || '⏳';

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* ASCII Soundwave Terminal Visualizer (ascii-magic inspired) */}
      {progress < 100 && (
        <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 pb-1 border-b border-slate-800/80">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI AUDIO PIPELINE
            </span>
            <span className="text-[10px] text-slate-500">Groq Whisper • Gemini</span>
          </div>
          <div className="text-center py-1 tracking-widest text-emerald-400 font-bold select-none text-sm">
            {WAVE_FRAMES[frameIndex]}
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800/60">
            <span className="truncate max-w-[200px]">{step}</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {/* Main progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700 flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            {step}
          </span>
          <span className="text-primary-600 font-semibold">{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine effect */}
            {progress < 100 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      {details && (
        <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
          <span className="font-mono">{details}</span>
        </div>
      )}

      {/* Estimated time */}
      {estimatedTime && progress < 100 && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Est. time: {estimatedTime}</span>
        </div>
      )}

      {/* Processing steps indicator */}
      <div className="flex gap-2 pt-2">
        {['Validate', 'Upload', 'Extract', 'Transcribe', 'Generate'].map((s, i) => {
          const isActive = progress > i * 20;
          const isCurrent = progress >= i * 20 && progress < (i + 1) * 20;
          return (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                isActive
                  ? isCurrent
                    ? 'bg-primary-600 animate-pulse'
                    : 'bg-primary-400'
                  : 'bg-gray-200'
              }`}
              title={s}
            />
          );
        })}
      </div>
    </div>
  );
}
