import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEMO_SCENES, DemoScene, CursorAction } from '../components/demo/demoScenesData';
import { useAuth } from './AuthContext';

export interface TourSceneTarget {
  route: string;
  role?: 'admin' | 'official' | 'college1';
  scrollTargetY?: number;
}

export const SCENE_APP_TARGETS: Record<number, TourSceneTarget> = {
  1: { route: '/', role: 'admin', scrollTargetY: 0 },
  2: { route: '/', role: 'admin', scrollTargetY: 200 },
  3: { route: '/fdrs/new', role: 'college1', scrollTargetY: 0 },
  4: { route: '/fdrs/5', role: 'official', scrollTargetY: 350 },
  5: { route: '/maturities', role: 'official', scrollTargetY: 0 },
  6: { route: '/verifications', role: 'official', scrollTargetY: 0 },
  7: { route: '/renewals', role: 'official', scrollTargetY: 0 },
  8: { route: '/releases', role: 'official', scrollTargetY: 0 },
  9: { route: '/audit', role: 'admin', scrollTargetY: 0 },
  10: { route: '/', role: 'admin', scrollTargetY: 0 },
};

interface TourContextType {
  isTourActive: boolean;
  isPlaying: boolean;
  currentSeconds: number;
  totalDuration: number;
  playbackSpeed: number;
  isVoiceoverEnabled: boolean;
  isScriptVisible: boolean;
  activeScene: DemoScene;
  activeSceneIndex: number;
  elapsedInScene: number;
  currentCursorAction?: CursorAction;
  startLiveAppTour: (sceneId?: number) => void;
  stopTour: () => void;
  togglePlay: () => void;
  jumpToScene: (sceneId: number) => void;
  seek: (seconds: number) => void;
  setSpeed: (speed: number) => void;
  toggleVoiceover: () => void;
  toggleScript: () => void;
  setScriptVisible: (visible: boolean) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState<boolean>(true);
  const [isScriptVisible, setIsScriptVisible] = useState<boolean>(false); // Hidden by default as requested!

  const totalDuration = 300; // 5 minutes exactly

  const navigate = useNavigate();
  const location = useLocation();
  const { switchDemoRole, user } = useAuth();
  const currentSceneIdRef = useRef<number>(1);

  // Determine active scene
  const activeSceneIndex = DEMO_SCENES.findIndex(
    (s) => currentSeconds >= s.startSeconds && currentSeconds < s.endSeconds
  );
  const activeScene: DemoScene =
    activeSceneIndex !== -1 ? DEMO_SCENES[activeSceneIndex] : DEMO_SCENES[DEMO_SCENES.length - 1];

  const elapsedInScene = currentSeconds - activeScene.startSeconds;

  // Active cursor action in the scene
  const currentCursorAction: CursorAction | undefined = [...activeScene.cursorPath]
    .reverse()
    .find((action) => elapsedInScene >= action.timeOffset) || activeScene.cursorPath[0];

  // Automatic application navigation and role switching based on active scene
  useEffect(() => {
    if (!isTourActive) return;

    if (currentSceneIdRef.current !== activeScene.id) {
      currentSceneIdRef.current = activeScene.id;
      const target = SCENE_APP_TARGETS[activeScene.id];

      if (target) {
        // Switch role if required and not currently matched
        if (target.role) {
          const targetEmail = {
            admin: 'admin@aicte.gov.in',
            official: 'official@aicte.gov.in',
            college1: 'director@delhitech.edu.in',
          }[target.role];

          if (user?.email !== targetEmail) {
            switchDemoRole(target.role).catch(() => {});
          }
        }

        // Navigate to the relevant route if not already on it
        if (location.pathname !== target.route) {
          navigate(target.route);
        }

        // Scroll to target area if specified
        if (target.scrollTargetY !== undefined) {
          setTimeout(() => {
            window.scrollTo({ top: target.scrollTargetY, behavior: 'smooth' });
          }, 300);
        }
      }
    }
  }, [activeScene.id, isTourActive, location.pathname, navigate, switchDemoRole, user?.email]);

  // Main playback timer loop
  useEffect(() => {
    if (!isTourActive || !isPlaying) return;

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
  }, [isTourActive, isPlaying, playbackSpeed]);

  // Web Speech Synthesis Voiceover
  useEffect(() => {
    if (!isTourActive || !('speechSynthesis' in window)) return;

    if (!isVoiceoverEnabled || !isPlaying) {
      window.speechSynthesis.cancel();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeScene.narration);
    utterance.rate = 1.05 * playbackSpeed;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [activeScene.id, isTourActive, isVoiceoverEnabled, isPlaying, playbackSpeed]);

  const startLiveAppTour = (sceneId = 1) => {
    setIsTourActive(true);
    setIsPlaying(true);
    const scene = DEMO_SCENES.find((s) => s.id === sceneId) || DEMO_SCENES[0];
    setCurrentSeconds(scene.startSeconds);
    currentSceneIdRef.current = -1; // Force trigger target navigation
  };

  const stopTour = () => {
    setIsTourActive(false);
    setIsPlaying(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const togglePlay = () => setIsPlaying((p) => !p);

  const jumpToScene = (sceneId: number) => {
    const scene = DEMO_SCENES.find((s) => s.id === sceneId);
    if (scene) {
      setCurrentSeconds(scene.startSeconds);
      setIsPlaying(true);
      currentSceneIdRef.current = -1;
    }
  };

  const seek = (seconds: number) => {
    setCurrentSeconds(Math.max(0, Math.min(totalDuration, seconds)));
  };

  const setSpeed = (speed: number) => setPlaybackSpeed(speed);
  const toggleVoiceover = () => setIsVoiceoverEnabled((v) => !v);
  const toggleScript = () => setIsScriptVisible((s) => !s);
  const setScriptVisible = (visible: boolean) => setIsScriptVisible(visible);

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        isPlaying,
        currentSeconds,
        totalDuration,
        playbackSpeed,
        isVoiceoverEnabled,
        isScriptVisible,
        activeScene,
        activeSceneIndex,
        elapsedInScene,
        currentCursorAction,
        startLiveAppTour,
        stopTour,
        togglePlay,
        jumpToScene,
        seek,
        setSpeed,
        toggleVoiceover,
        toggleScript,
        setScriptVisible,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
