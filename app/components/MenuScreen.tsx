'use client';

import { useAccount } from 'wagmi';
import WalletButton from './WalletButton';
import styles from './MenuScreen.module.css';

interface MenuScreenProps {
  playerName: string;
  highScore: number;
  onPlay: () => void;
}

export default function MenuScreen({ playerName, highScore, onPlay }: MenuScreenProps) {
  const { isConnected } = useAccount();

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h1 className={styles.title}>FRUIT NINJA</h1>
        <p className={styles.subtitle}>Swipe to slice!</p>

        {playerName && (
          <p className={styles.player}>
            {playerName}
          </p>
        )}

        <WalletButton />

        {highScore > 0 && (
          <p className={styles.highScore}>
            Best: {highScore}
          </p>
        )}

        {isConnected ? (
          <button className={styles.playButton} onClick={onPlay}>
            PLAY
          </button>
        ) : (
          <p className={styles.connectHint}>Connect wallet to play</p>
        )}
      </div>
    </div>
  );
}
