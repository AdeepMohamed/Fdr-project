import React, { useState, useEffect, useRef } from 'react';
import { DEMO_SCENES, DemoScene, CursorAction } from '../components/demo/demoScenesData';
import { SceneStage } from '../components/demo/SceneStage';
import { VirtualCursor } from '../components/demo/VirtualCursor';
import { useTour } from '../context/TourContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Tv,
  MousePointer,
  Layers,
  Award,
  Eye,
  EyeOff,
  Compass,
} from 'lucide-react';

export const LiveDemo: React.FC = () => {
  const { startLiveAppTour } = useTour();
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [isScriptVisible, setIsScriptVisible] = useState<boolean>(false); // Hidden by default!

  const containerRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const totalDuration = 300; // 5 minutes exactly (300 seconds)

  // Find active scene based on currentSeconds
  const activeSceneIndex = DEMO_SCENES.findIndex(
    (s) => currentSeconds >= s.startSeconds && currentSeconds < s.endSeconds
  );
  const activeScene: DemoScene =
    activeSceneIndex !== -1 ? DEMO_SCENES[activeSceneIndex] : DEMO_SCENES[DEMO_SCENES.length - 1];

  const elapsedInScene = currentSeconds - activeScene.startSeconds;

  // Find active cursor action for this instant
  const currentCursorAction: CursorAction | undefined = [...activeScene.cursorPath]
    .reverse()
    .find((action) => elapsedInScene >= action.timeOffset) || activeScene.cursorPath[0];

  // Main playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 100 / playbackSpeed;
    const interval = setInterval(() => {
      setCurrentSeconds((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return Math.min(totalDuration, Number((prev + 0.1).toFixed(1)));
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Voiceover Web Speech Synthesis Integration
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    if (!isVoiceoverEnabled || !isPlaying) {
      window.speechSynthesis.cancel();
      return;
    }

    // Trigger speech synthesis when scene starts
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeScene.narration);
    utterance.rate = 1.05 * playbackSpeed;
    utterance.pitch = 1.0;
    speechRef.current = utterance;

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [activeScene.id, isVoiceoverEnabled, isPlaying, playbackSpeed]);

  // Keyboard shortcuts (Space to toggle play/pause, Left/Right arrow to seek)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowRight') {
        setCurrentSeconds((s) => Math.min(totalDuration, s + 5));
      } else if (e.code === 'ArrowLeft') {
        setCurrentSeconds((s) => Math.max(0, s - 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleJumpToScene = (scene: DemoScene) => {
    setCurrentSeconds(scene.startSeconds);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentSeconds(Math.floor(fraction * totalDuration));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        maxWidth: '1360px',
        margin: '0 auto',
        padding: isFullscreen ? '1.5rem' : '0',
        backgroundColor: isFullscreen ? 'var(--bg-primary)' : 'transparent',
        minHeight: isFullscreen ? '100vh' : 'auto',
      }}
    >
      {/* Top Banner & Control Deck */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #ef4444, #f43f5e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
            }}
          >
            <Tv size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                FDR SmartTrack — 5-Minute Live Interactive Demo
              </h1>
              <span className="live-demo-nav-btn" style={{ padding: '0.15rem 0.6rem', fontSize: '0.6875rem' }}>
                <span className="live-badge-dot" /> LIVE SHOWCASE
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              AICTE Problem Statement 26265 • Full 10-Scene Animated Walkthrough with Virtual Cursor & Narration
            </div>
          </div>
        </div>

        {/* Studio Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Play Live in Real Application Button */}
          <button
            onClick={() => startLiveAppTour(activeScene.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid rgba(56, 189, 248, 0.6)',
              background: 'linear-gradient(135deg, #1d4ed8, #0284c7)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
              transition: 'all 0.2s ease',
            }}
            title="Launch autonomous live tour directly across the real application pages!"
          >
            <Sparkles size={15} />
            <span>Play Live in Real Application ↗</span>
          </button>

          {/* Interactive Mode Switcher */}
          <button
            onClick={() => setIsInteractiveMode(!isInteractiveMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.45rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: isInteractiveMode ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-elevated)',
              color: isInteractiveMode ? '#38bdf8' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <MousePointer size={14} />
            {isInteractiveMode ? 'Cursor: Visible' : 'Auto-Cursor Active'}
          </button>

          {/* Voiceover Speech Toggle */}
          <button
            onClick={() => setIsVoiceoverEnabled(!isVoiceoverEnabled)}
            title={isVoiceoverEnabled ? 'Mute AI Voiceover' : 'Enable AI Voiceover'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.45rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: isVoiceoverEnabled ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-elevated)',
              color: isVoiceoverEnabled ? '#34d399' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isVoiceoverEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{isVoiceoverEnabled ? 'Voiceover ON' : 'Muted'}</span>
          </button>

          {/* Speed Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '0.2rem',
            }}
          >
            {[1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                style={{
                  padding: '0.25rem 0.5rem',
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
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Screen Video Simulator Stage */}
      <div className="demo-screen-container" style={{ position: 'relative' }}>
        {/* Render Stage for Active Scene */}
        <SceneStage scene={activeScene} elapsedInScene={elapsedInScene} />

        {/* Animated Virtual Cursor */}
        <VirtualCursor cursorAction={currentCursorAction} isPlaying={isPlaying} />
      </div>

      {/* Teleprompter Subtitle & Closed Captions Box (Hideable / Collapsible) */}
      {isScriptVisible ? (
        <div className="demo-teleprompter" style={{ animation: 'fadeIn 0.25s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ● NARRATION SCRIPT — {activeScene.title} ({activeScene.timeRange})
            </span>
            <button
              onClick={() => setIsScriptVisible(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Hide this narration box"
            >
              <EyeOff size={13} />
              <span>Hide This Script</span>
            </button>
          </div>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
            {activeScene.narration}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setIsScriptVisible(true)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
            title="Display the speech narration text"
          >
            <Eye size={14} />
            <span>Show Narration Transcript</span>
          </button>
        </div>
      )}

      {/* Chapter Rail Quick Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {DEMO_SCENES.map((scene) => {
          const isCurrent = scene.id === activeScene.id;
          const isPast = currentSeconds >= scene.endSeconds;

          return (
            <button
              key={scene.id}
              onClick={() => handleJumpToScene(scene)}
              style={{
                flex: '0 0 auto',
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: isCurrent
                  ? '1px solid var(--primary-500)'
                  : isPast
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid var(--border-subtle)',
                backgroundColor: isCurrent
                  ? 'rgba(37, 99, 235, 0.2)'
                  : isPast
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'var(--bg-surface)',
                color: isCurrent
                  ? '#ffffff'
                  : isPast
                  ? '#34d399'
                  : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>
                {scene.chapterBadge} • {scene.durationSeconds}s
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', marginTop: '0.125rem' }}>
                {scene.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Master Timeline & Transport Player Bar */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
        }}
      >
        {/* Interactive Scrubbing Timeline */}
        <div
          onClick={handleSeek}
          style={{
            position: 'relative',
            width: '100%',
            height: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '9999px',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {/* Elapsed Progress Bar */}
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

          {/* Chapter Tick Marks */}
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
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                zIndex: 2,
              }}
            />
          ))}
        </div>

        {/* Transport Buttons & Time Displays */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Play / Pause Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '9999px',
                backgroundColor: isPlaying ? 'var(--primary-600)' : '#10b981',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isPlaying
                  ? '0 0 15px rgba(37, 99, 235, 0.5)'
                  : '0 0 15px rgba(16, 185, 129, 0.5)',
                transition: 'all 0.2s ease',
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>

            {/* Restart from beginning */}
            <button
              onClick={() => {
                setCurrentSeconds(0);
                setIsPlaying(true);
              }}
              title="Restart 5-Minute Tour"
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} />
            </button>

            {/* Previous Scene */}
            <button
              onClick={() => {
                const prev = DEMO_SCENES[Math.max(0, activeSceneIndex - 1)];
                handleJumpToScene(prev);
              }}
              disabled={activeSceneIndex <= 0}
              title="Previous Scene"
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: activeSceneIndex > 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: activeSceneIndex > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Next Scene */}
            <button
              onClick={() => {
                const next = DEMO_SCENES[Math.min(DEMO_SCENES.length - 1, activeSceneIndex + 1)];
                handleJumpToScene(next);
              }}
              disabled={activeSceneIndex >= DEMO_SCENES.length - 1}
              title="Next Scene"
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: activeSceneIndex < DEMO_SCENES.length - 1 ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: activeSceneIndex < DEMO_SCENES.length - 1 ? 'pointer' : 'not-allowed',
              }}
            >
              <ChevronRight size={16} />
            </button>

            {/* Time Stamp Counter */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginLeft: '0.5rem',
              }}
            >
              <span style={{ color: '#38bdf8' }}>{formatTime(currentSeconds)}</span>
              <span style={{ color: 'var(--text-muted)' }}> / 5:00</span>
            </div>
          </div>

          {/* Current Chapter Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Segment:</span>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: '#f8fafc',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid rgba(37, 99, 235, 0.3)',
              }}
            >
              {activeScene.chapterBadge}: {activeScene.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
