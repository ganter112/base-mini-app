'use client';

import { useState } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import styles from './GameOverScreen.module.css';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  onPlayAgain: () => void;
}

export default function GameOverScreen({ score, highScore, isNewRecord, onPlayAgain }: GameOverScreenProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `I scored ${score} points in Fruit Ninja on Base! Can you beat my score?`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShare = async () => {
    // 1. Try Farcaster composeCast (inside mini app)
    try {
      const isInApp = await Promise.race([
        sdk.isInMiniApp(),
        new Promise<false>((resolve) => setTimeout(() => resolve(false), 1000)),
      ]);
      if (isInApp) {
        await sdk.actions.composeCast({ text: shareText });
        return;
      }
    } catch {}

    // 2. Try Web Share API (mobile browsers)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Fruit Ninja', text: shareText, url: shareUrl });
        return;
      } catch {}
    }

    // 3. Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h2 className={styles.title}>GAME OVER</h2>

        <div className={styles.scoreBlock}>
          <span className={styles.scoreLabel}>Score</span>
          <span className={styles.scoreValue}>{score}</span>
        </div>

        {isNewRecord && (
          <p className={styles.newRecord}>NEW RECORD!</p>
        )}

        <p className={styles.best}>Best: {highScore}</p>

        <div className={styles.buttons}>
          <button className={styles.shareButton} onClick={handleShare}>
            {copied ? 'COPIED!' : 'SHARE'}
          </button>
          <button className={styles.playButton} onClick={onPlayAgain}>
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
