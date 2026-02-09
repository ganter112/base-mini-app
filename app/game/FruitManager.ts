import { Fruit, FruitConfig, DifficultyLevel } from './types';
import { FRUIT_CONFIGS, BOMB_CONFIG, DIFFICULTY_LEVELS } from './constants';

let nextId = 0;

export class FruitManager {
  fruits: Fruit[] = [];
  private canvasWidth: number;
  private canvasHeight: number;
  private lastSpawnTime = 0;
  private gameTime = 0;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  resize(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
  }

  getDifficulty(): DifficultyLevel {
    let level = DIFFICULTY_LEVELS[0].level;
    for (const d of DIFFICULTY_LEVELS) {
      if (this.gameTime >= d.threshold) level = d.level;
    }
    return level;
  }

  private spawnFruit(config: FruitConfig, fallSpeed: number): Fruit {
    const margin = config.radius + 10;
    const x = margin + Math.random() * (this.canvasWidth - margin * 2);
    const vx = (Math.random() - 0.5) * 2;

    return {
      id: nextId++,
      config,
      x,
      y: -config.radius, // spawn above the screen
      vx,
      vy: fallSpeed,      // fall downward
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      sliced: false,
      missed: false,
    };
  }

  private spawnWave() {
    const diff = this.getDifficulty();
    const count = diff.fruitsPerWave;

    for (let i = 0; i < count; i++) {
      let config: FruitConfig;
      if (Math.random() < diff.bombChance) {
        config = BOMB_CONFIG;
      } else {
        config = FRUIT_CONFIGS[Math.floor(Math.random() * FRUIT_CONFIGS.length)];
      }
      this.fruits.push(this.spawnFruit(config, diff.fallSpeed));
    }
  }

  update(dt: number, gameTime: number): Fruit[] {
    this.gameTime = gameTime;
    const diff = this.getDifficulty();

    if (gameTime - this.lastSpawnTime >= diff.spawnInterval / 1000) {
      this.spawnWave();
      this.lastSpawnTime = gameTime;
    }

    const missed: Fruit[] = [];

    for (const fruit of this.fruits) {
      if (fruit.sliced) continue;
      fruit.x += fruit.vx;
      fruit.y += fruit.vy;
      fruit.rotation += fruit.rotationSpeed;

      // Missed = fell past the bottom
      if (fruit.y > this.canvasHeight + fruit.config.radius * 2) {
        if (!fruit.missed && !fruit.config.isBomb) {
          fruit.missed = true;
          missed.push(fruit);
        } else if (!fruit.missed && fruit.config.isBomb) {
          fruit.missed = true; // bomb fell harmlessly
        }
      }
    }

    this.fruits = this.fruits.filter(
      f => !(f.sliced || (f.missed && f.y > this.canvasHeight + 100))
    );

    return missed;
  }

  reset() {
    this.fruits = [];
    this.lastSpawnTime = 0;
    this.gameTime = 0;
    nextId = 0;
  }
}
