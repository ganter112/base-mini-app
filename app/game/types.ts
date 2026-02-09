export type FruitType = 'apple' | 'orange' | 'banana' | 'strawberry' | 'watermelon' | 'pineapple' | 'bomb';

export interface FruitConfig {
  type: FruitType;
  points: number;
  color: string;
  innerColor?: string;
  radius: number;
  isBomb: boolean;
}

export interface Fruit {
  id: number;
  config: FruitConfig;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  sliced: boolean;
  missed: boolean;
}

export interface SliceHalf {
  config: FruitConfig;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  side: 'left' | 'right';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

export interface SwipePoint {
  x: number;
  y: number;
  time: number;
}

export interface DifficultyLevel {
  spawnInterval: number;
  fruitsPerWave: number;
  bombChance: number;
  fallSpeed: number;
}

export interface GameState {
  score: number;
  lives: number;
  combo: number;
  comboMultiplier: number;
  gameTime: number;
  isRunning: boolean;
  isGameOver: boolean;
}

export type GameScreen = 'menu' | 'playing' | 'gameover';
