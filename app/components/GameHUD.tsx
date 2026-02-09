'use client';

import { GameState } from '../game/types';
import { MAX_LIVES } from '../game/constants';
import styles from './GameHUD.module.css';

interface GameHUDProps {
  state: GameState;
}

export default function GameHUD({ state }: GameHUDProps) {
  const hearts = Array.from({ length: MAX_LIVES }, (_, i) => (
    <span key={i} className={i < state.lives ? styles.heartFull : styles.heartEmpty}>
      {i < state.lives ? '\u2764' : '\u2661'}
    </span>
  ));

  return (
    <div className={styles.hud}>
      <div className={styles.top}>
        <div className={styles.score}>{state.score}</div>
        <div className={styles.lives}>{hearts}</div>
      </div>
      {state.combo >= 3 && (
        <div className={styles.comboBar}>
          x{state.comboMultiplier} COMBO
        </div>
      )}
    </div>
  );
}
