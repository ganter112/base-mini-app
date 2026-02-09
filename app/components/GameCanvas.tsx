'use client';

import { useRef, useEffect, useCallback } from 'react';
import { GameEngine, GameEventCallback } from '../game/GameEngine';
import { GameState, GameScreen } from '../game/types';
import styles from './GameCanvas.module.css';

interface GameCanvasProps {
  onStateChange: (state: GameState, screen: GameScreen) => void;
  engineRef: React.MutableRefObject<GameEngine | null>;
}

export default function GameCanvas({ onStateChange, engineRef }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStateChange: GameEventCallback = useCallback(
    (state, screen) => {
      onStateChange(state, screen);
    },
    [onStateChange]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      engineRef.current?.resize(canvas.width, canvas.height);
    };

    updateSize();

    const engine = new GameEngine(canvas, handleStateChange);
    engineRef.current = engine;

    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, [handleStateChange, engineRef]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      style={{ touchAction: 'none' }}
    />
  );
}
