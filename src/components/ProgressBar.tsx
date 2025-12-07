import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
  startTime: number | null;
  durationSeconds: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ startTime, durationSeconds }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!startTime) {
      if (barRef.current) barRef.current.style.width = '0%';
      return;
    }

    const animate = () => {
      const now = Date.now();
      const durationMs = durationSeconds * 1000;
      const elapsed = now - startTime;
      const progress = Math.min((elapsed / durationMs) * 100, 100);

      if (barRef.current) {
        barRef.current.style.width = `${progress}%`;
      }

      if (progress < 100) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [startTime, durationSeconds]);

  return (
    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mt-4">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-75 ease-linear"
        style={{ width: '0%' }}
      />
    </div>
  );
};