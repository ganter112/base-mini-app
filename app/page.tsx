"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { useAccount } from "wagmi";
import { useMiniApp } from "./providers/MiniAppProvider";
import { GameEngine } from "./game/GameEngine";
import { GameState, GameScreen } from "./game/types";
import { MAX_LIVES } from "./game/constants";
import GameCanvas from "./components/GameCanvas";
import MenuScreen from "./components/MenuScreen";
import GameHUD from "./components/GameHUD";
import GameOverScreen from "./components/GameOverScreen";
import styles from "./page.module.css";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Home() {
  const { context, isReady } = useMiniApp();
  const { address, isConnected } = useAccount();
  const engineRef = useRef<GameEngine | null>(null);
  const [screen, setScreen] = useState<GameScreen>("menu");
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: MAX_LIVES,
    combo: 0,
    comboMultiplier: 1,
    gameTime: 0,
    isRunning: false,
    isGameOver: false,
  });
  const [highScore, setHighScore] = useState(0);

  // Player identity: Farcaster name > wallet address > empty
  const playerName =
    context?.user?.displayName ||
    (isConnected && address ? shortenAddress(address) : "");

  // Storage key scoped to wallet address
  const storageKey = isConnected && address
    ? `fruitNinja_highScore_${address}`
    : "fruitNinja_highScore";

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setHighScore(parseInt(saved, 10));
    else setHighScore(0);
  }, [storageKey]);

  // Fetch server high score when in Farcaster
  useEffect(() => {
    if (!isReady) return;
    const fetchScore = async () => {
      try {
        const res = await sdk.quickAuth.fetch("/api/scores");
        const data = await res.json();
        if (data.score) {
          setHighScore((prev) => {
            const best = Math.max(prev, data.score);
            localStorage.setItem(storageKey, String(best));
            return best;
          });
        }
      } catch {
        // Not authenticated or server error — use local score
      }
    };
    fetchScore();
  }, [isReady, storageKey]);

  const handleStateChange = useCallback((state: GameState, newScreen: GameScreen) => {
    setGameState(state);
    setScreen(newScreen);

    if (newScreen === "gameover") {
      const key = storageKey;
      const currentHigh = parseInt(localStorage.getItem(key) || "0", 10);
      if (state.score > currentHigh) {
        localStorage.setItem(key, String(state.score));
        setHighScore(state.score);

        // Submit to server via Farcaster auth
        sdk.quickAuth.fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: state.score }),
        }).catch(() => {});

        // Submit via wallet-based endpoint
        if (address) {
          fetch("/api/scores/wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: state.score, address }),
          }).catch(() => {});
        }
      }
    }
  }, [storageKey, address]);

  const handlePlay = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const isNewRecord = gameState.score > 0 && gameState.score >= highScore;

  return (
    <div className={styles.container}>
      <GameCanvas onStateChange={handleStateChange} engineRef={engineRef} />

      {screen === "menu" && (
        <MenuScreen
          playerName={playerName}
          highScore={highScore}
          onPlay={handlePlay}
        />
      )}

      {screen === "playing" && <GameHUD state={gameState} />}

      {screen === "gameover" && (
        <GameOverScreen
          score={gameState.score}
          highScore={highScore}
          isNewRecord={isNewRecord}
          onPlayAgain={handlePlay}
        />
      )}
    </div>
  );
}
