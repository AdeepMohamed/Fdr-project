import React, { useState, useEffect, useRef } from 'react';
import { useTour } from '../../context/TourContext';
import { DEMO_SCENES } from './demoScenesData';
import { VirtualCursor } from './VirtualCursor';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Maximize2,
  Tv,
} from 'lucide-react';

export const LiveAppTourOverlay: React.FC = () => {
  const {
    isTourActive,
    isPlaying,
    currentSeconds,
    totalDuration,
    playbackSpeed,
    isVoiceoverEnabled,
    isScriptVisible,
    activeScene,
    activeSceneIndex,
    currentCursorAction,
    stopTour,
    togglePlay,
    jumpToScene,
    seek,
    setSpeed,
    toggleVoiceover,
    toggleScript,
  } = useTour();

  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [isHoveringBar, setIsHoveringBar] = useState<boolean>(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide controller while playing if user is inactive
  useEffect(() => {
    if (!isPlaying) {
      setIsControlsVisible(true);
      return;
    }

    const resetTimer = () => {
      setIsControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        if (isPlaying && !isHoveringBar) {
          setIsControlsVisible(false);
        }
      }, 2400); // Hides after 2.4s of inactivity while playing
    };

    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isPlaying, isHoveringBar]);

  if (!isTourActive) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    seek(Math.floor(fraction * totalDuration));
  };

  return (
    <>
      {/* 1. Animated Virtual Cursor floating above actual application pages */}
      <VirtualCursor cursorAction={currentCursorAction} isPlaying={isPlaying} />

      {/* 2. Top Banner Pill: Showing Active Guided Scene & Target Module */}
      <div
        style={{
          position: 'fixed',
          top: '5rem',
          left: '50%',
          transform: isControlsVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-25px)',
          opacity: isControlsVisible ? 1 : 0,
          pointerEvents: isControlsVisible ? 'auto' : 'none',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 9990,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(37, 99, 235, 0.3)',
        }}
      >
        <span className="live-badge-dot" />
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
          Live App Demo • {activeScene.chapterBadge}: {activeScene.title}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>|</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Target: <strong style={{ color: '#fff' }}>{activeScene.portalRole}</strong>
        </span>
        <button
          onClick={toggleScript}
          style={{
            background: 'none',
            border: 'none',
            color: isScriptVisible ? '#38bdf8' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: isScriptVisible ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          }}
          title={isScriptVisible ? 'Hide Narration Script' : 'Show Narration Script'}
        >
          {isScriptVisible ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{isScriptVisible ? 'Hide Script' : 'Show Script'}</span>
        </button>
      </div>

      {/* 3. Collapsible Floating Teleprompter Narration Box (Can be completely hidden) */}
      {isScriptVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '6.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '820px',
            width: '90%',
            zIndex: 9992,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.35rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                ● NARRATION SCRIPT — {activeScene.title} ({activeScene.timeRange})
              </span>
            </div>
            <button
              onClick={toggleScript}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Hide Narration Script"
            >
              <EyeOff size={12} />
              <span>Hide This Script</span>
            </button>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#f8fafc', margin: 0, fontWeight: 500 }}>
            {activeScene.narration}
          </p>
        </div>
      )}

      {/* 4. Bottom Floating Tour Director & Controller Bar (Auto-hides while playing) */}
      <div
        onMouseEnter={() => setIsHoveringBar(true)}
        onMouseLeave={() => setIsHoveringBar(false)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: isControlsVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(140%)',
          opacity: isControlsVisible ? 1 : 0,
          pointerEvents: isControlsVisible ? 'auto' : 'none',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          maxWidth: '1000px',
          width: 'calc(100% - 2rem)',
          zIndex: 9995,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          padding: '0.875rem 1.25rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(37, 99, 235, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
        {/* Timeline Scrubber */}
        <div
          onClick={handleSeek}
          style={{
            position: 'relative',
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${(currentSeconds / totalDuration) * 100}%`,
              background: 'linear-gradient(90deg, #2563eb, #38bdf8, #a855f7)',
              borderRadius: '9999px',
              transition: 'width 0.1s linear',
            }}
          />
          {DEMO_SCENES.map((s) => (
            <div
              key={s.id}
              title={`${s.chapterBadge}: ${s.title}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${(s.startSeconds / totalDuration) * 100}%`,
                width: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                zIndex: 2,
              }}
            />
          ))}
        </div>

        {/* Transport Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Left Transport controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button
              onClick={togglePlay}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '9999px',
                backgroundColor: isPlaying ? 'var(--primary-600)' : '#10b981',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)',
              }}
              title={isPlaying ? 'Pause Tour' : 'Play Tour'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '1px' }} />}
            </button>

            <button
              onClick={() => seek(0)}
              title="Restart 5-Min Tour"
              style={{
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
            </button>

            <button
              onClick={() => {
                const prev = DEMO_SCENES[Math.max(0, activeSceneIndex - 1)];
                jumpToScene(prev.id);
              }}
              disabled={activeSceneIndex <= 0}
              style={{
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: activeSceneIndex > 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: activeSceneIndex > 0 ? 'pointer' : 'not-allowed',
              }}
              title="Previous Scene"
            >
              <ChevronLeft size={14} />
            </button>

            <button
              onClick={() => {
                const next = DEMO_SCENES[Math.min(DEMO_SCENES.length - 1, activeSceneIndex + 1)];
                jumpToScene(next.id);
              }}
              disabled={activeSceneIndex >= DEMO_SCENES.length - 1}
              style={{
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: activeSceneIndex < DEMO_SCENES.length - 1 ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: activeSceneIndex < DEMO_SCENES.length - 1 ? 'pointer' : 'not-allowed',
              }}
              title="Next Scene"
            >
              <ChevronRight size={14} />
            </button>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, marginLeft: '0.25rem' }}>
              <span style={{ color: '#38bdf8' }}>{formatTime(currentSeconds)}</span>
              <span style={{ color: 'var(--text-muted)' }}> / 5:00</span>
            </div>
          </div>

          {/* Center Scene Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#fff',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(37, 99, 235, 0.4)',
                padding: '0.2rem 0.625rem',
                borderRadius: '9999px',
              }}
            >
              {activeScene.chapterBadge}: {activeScene.title}
            </span>
          </div>

          {/* Right Controls: Transcript toggle, Voiceover, Speed, Close Tour */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Transcript Toggle Button */}
            <button
              onClick={toggleScript}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: isScriptVisible ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-elevated)',
                color: isScriptVisible ? '#38bdf8' : 'var(--text-secondary)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title={isScriptVisible ? 'Hide Script' : 'Show Script'}
            >
              {isScriptVisible ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{isScriptVisible ? 'Hide Script' : 'Show Script'}</span>
            </button>

            {/* Voiceover Speech Toggle */}
            <button
              onClick={toggleVoiceover}
              style={{
                padding: '0.3rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: isVoiceoverEnabled ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-elevated)',
                color: isVoiceoverEnabled ? '#34d399' : 'var(--text-muted)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title={isVoiceoverEnabled ? 'Mute AI Voiceover' : 'Enable AI Voiceover'}
            >
              {isVoiceoverEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>

            {/* Speed Options */}
            {[1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  padding: '0.2rem 0.4rem',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: playbackSpeed === s ? 'var(--primary-600)' : 'transparent',
                  color: playbackSpeed === s ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {s}x
              </button>
            ))}

            {/* Explicit Hide / Minimize Bar Button */}
            <button
              onClick={() => setIsControlsVisible(false)}
              style={{
                padding: '0.3rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
              title="Hide controls while watching"
            >
              <ChevronDown size={13} />
              <span>Hide Bar</span>
            </button>

            {/* Exit Live Tour Button */}
            <button
              onClick={stopTour}
              style={{
                padding: '0.3rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                color: '#f43f5e',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Exit Live Tour"
            >
              <X size={13} />
              <span>Exit Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Minimal Bottom Float Pill when Bar is Hidden */}
      {!isControlsVisible && (
        <button
          onClick={() => setIsControlsVisible(true)}
          style={{
            position: 'fixed',
            bottom: '0.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9996,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.875rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#38bdf8',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease',
          }}
          title="Click to restore playback controls"
        >
          <ChevronUp size={14} />
          <span>Show Controls ({formatTime(currentSeconds)} / 5:00)</span>
        </button>
      )}
    </>
  );
};
