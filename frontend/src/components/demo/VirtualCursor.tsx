import React, { useEffect, useState } from 'react';
import { CursorAction } from './demoScenesData';

interface VirtualCursorProps {
  cursorAction?: CursorAction;
  isPlaying: boolean;
}

export const VirtualCursor: React.FC<VirtualCursorProps> = ({ cursorAction, isPlaying }) => {
  const [clickEffect, setClickEffect] = useState<boolean>(false);

  useEffect(() => {
    if (!cursorAction || !isPlaying) return;

    if (cursorAction.action === 'click') {
      setClickEffect(true);
      const timer = setTimeout(() => setClickEffect(false), 700);
      return () => clearTimeout(timer);
    }
  }, [cursorAction, isPlaying]);

  if (!cursorAction) return null;

  return (
    <div
      className="virtual-cursor-pointer"
      style={{
        left: `${cursorAction.x}%`,
        top: `${cursorAction.y}%`,
        transform: cursorAction.action === 'click' ? 'scale(0.92)' : 'scale(1)',
      }}
    >
      {/* Click ripple animation */}
      {clickEffect && <div className="cursor-click-ring" />}

      {/* Modern gradient cursor pointer SVG */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6)) drop-shadow(0 0 10px rgba(56, 189, 248, 0.7))',
        }}
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.88c.45 0 .67-.54.35-.85L5.85 2.86a.5.5 0 0 0-.35.35z"
          fill="#38bdf8"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="8" r="2.5" fill="#ffffff" opacity="0.8" />
      </svg>

      {/* Action Tooltip Tag */}
      {cursorAction.label && (
        <div className="cursor-tooltip-tag">
          {cursorAction.action === 'click' && '👆 '}
          {cursorAction.action === 'type' && '⌨️ '}
          {cursorAction.action === 'highlight' && '🔍 '}
          {cursorAction.label}
        </div>
      )}
    </div>
  );
};
