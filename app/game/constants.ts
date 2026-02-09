import { FruitConfig, DifficultyLevel } from './types';

export const GRAVITY = 0.15;
export const MAX_LIVES = 3;
export const COMBO_WINDOW_MS = 800;
export const SWIPE_TRAIL_LIFETIME = 200;
export const SLICE_RADIUS_BONUS = 18; // extra px added to fruit radius for slice detection

export const FRUIT_CONFIGS: FruitConfig[] = [
  { type: 'apple', points: 1, color: '#e74c3c', radius: 44, isBomb: false },
  { type: 'orange', points: 1, color: '#f39c12', radius: 44, isBomb: false },
  { type: 'banana', points: 2, color: '#f1c40f', radius: 38, isBomb: false },
  { type: 'strawberry', points: 2, color: '#e91e8a', radius: 36, isBomb: false },
  { type: 'watermelon', points: 3, color: '#2ecc71', innerColor: '#e74c3c', radius: 56, isBomb: false },
  { type: 'pineapple', points: 4, color: '#f0b90b', radius: 50, isBomb: false },
];

export const BOMB_CONFIG: FruitConfig = {
  type: 'bomb',
  points: -10,
  color: '#2c3e50',
  radius: 42,
  isBomb: true,
};

// fallSpeed = starting vy (pixels per frame), increases over time
export const DIFFICULTY_LEVELS: { threshold: number; level: DifficultyLevel }[] = [
  { threshold: 0,  level: { spawnInterval: 1800, fruitsPerWave: 2, bombChance: 0,    fallSpeed: 1.2 } },
  { threshold: 15, level: { spawnInterval: 1500, fruitsPerWave: 2, bombChance: 0.05, fallSpeed: 1.8 } },
  { threshold: 30, level: { spawnInterval: 1200, fruitsPerWave: 3, bombChance: 0.08, fallSpeed: 2.5 } },
  { threshold: 60, level: { spawnInterval: 1000, fruitsPerWave: 3, bombChance: 0.10, fallSpeed: 3.2 } },
  { threshold: 90, level: { spawnInterval: 800,  fruitsPerWave: 4, bombChance: 0.12, fallSpeed: 4.0 } },
];

export function getComboMultiplier(combo: number): number {
  if (combo <= 1) return 1;
  if (combo <= 3) return 2;
  if (combo <= 6) return 3;
  return 4;
}
