import { GameState, GameScreen, SwipePoint, Fruit } from './types';
import { MAX_LIVES } from './constants';
import { InputHandler } from './InputHandler';
import { FruitManager } from './FruitManager';
import { SliceDetector } from './SliceDetector';
import { ComboSystem } from './ComboSystem';
import { ParticleSystem } from './particles';
import { Renderer } from './Renderer';

export type GameEventCallback = (state: GameState, screen: GameScreen) => void;

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: Renderer;
  private input: InputHandler;
  private fruitManager: FruitManager;
  private sliceDetector: SliceDetector;
  private comboSystem: ComboSystem;
  private particles: ParticleSystem;
  private onStateChange: GameEventCallback;

  private state: GameState = {
    score: 0,
    lives: MAX_LIVES,
    combo: 0,
    comboMultiplier: 1,
    gameTime: 0,
    isRunning: false,
    isGameOver: false,
  };

  private screen: GameScreen = 'menu';
  private startTime = 0;
  private rafId = 0;
  private swipePoints: SwipePoint[] = [];
  private lastSlicePos = { x: 0, y: 0 };

  // Track per-swipe slices for swipe bonus
  private currentSwipeSliceCount = 0;

  constructor(canvas: HTMLCanvasElement, onStateChange: GameEventCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateChange = onStateChange;

    this.renderer = new Renderer(this.ctx, canvas.width, canvas.height);
    this.fruitManager = new FruitManager(canvas.width, canvas.height);
    this.sliceDetector = new SliceDetector();
    this.comboSystem = new ComboSystem();
    this.particles = new ParticleSystem();

    this.input = new InputHandler(canvas, (points) => {
      this.swipePoints = points;

      if (points.length === 0) {
        // Swipe ended — award swipe bonus
        if (this.currentSwipeSliceCount >= 2) {
          const bonus = this.currentSwipeSliceCount * (this.currentSwipeSliceCount - 1);
          this.state.score += bonus;
          this.particles.spawnSwipeBonus(
            this.lastSlicePos.x,
            this.lastSlicePos.y,
            this.currentSwipeSliceCount
          );
          this.emitState();
        }
        this.currentSwipeSliceCount = 0;
      }

      if (this.state.isRunning && points.length >= 2) {
        this.checkSlices();
      }
    });

    this.emitState();
  }

  resize(w: number, h: number) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.renderer.resize(w, h);
    this.fruitManager.resize(w, h);
  }

  start() {
    this.state = {
      score: 0,
      lives: MAX_LIVES,
      combo: 0,
      comboMultiplier: 1,
      gameTime: 0,
      isRunning: true,
      isGameOver: false,
    };
    this.screen = 'playing';
    this.startTime = performance.now();
    this.fruitManager.reset();
    this.comboSystem.reset();
    this.particles.reset();
    this.swipePoints = [];
    this.currentSwipeSliceCount = 0;
    this.emitState();

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.loop();
  }

  private loop = () => {
    if (!this.state.isRunning) return;

    const now = performance.now();
    this.state.gameTime = (now - this.startTime) / 1000;

    // Update
    const missed = this.fruitManager.update(1, this.state.gameTime);
    this.handleMissed(missed);
    this.particles.update();
    this.comboSystem.checkExpiry(now);
    this.state.combo = this.comboSystem.combo;
    this.state.comboMultiplier = this.comboSystem.multiplier;

    // Render
    this.renderer.clear();

    const activePoints = this.input.getActivePoints();
    this.renderer.drawSwipeTrail(activePoints);

    for (const fruit of this.fruitManager.fruits) {
      if (!fruit.sliced) {
        this.renderer.drawFruit(fruit);
      }
    }

    for (const half of this.particles.sliceHalves) {
      this.renderer.drawSliceHalf(half);
    }

    for (const p of this.particles.particles) {
      this.renderer.drawParticle(p);
    }

    // Floating score texts
    for (const ft of this.particles.floatingTexts) {
      this.renderer.drawFloatingText(ft);
    }

    if (this.comboSystem.combo >= 2) {
      this.renderer.drawComboText(
        this.comboSystem.combo,
        this.comboSystem.multiplier,
        this.lastSlicePos.x,
        this.lastSlicePos.y
      );
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  private checkSlices() {
    const segments = this.input.getRecentSegments();
    if (segments.length === 0) return;

    const sliced = this.sliceDetector.checkSlices(segments, this.fruitManager.fruits);
    const now = performance.now();

    for (const fruit of sliced) {
      this.lastSlicePos = { x: fruit.x, y: fruit.y };

      if (fruit.config.isBomb) {
        this.handleBombHit(fruit);
      } else {
        const { multiplier } = this.comboSystem.hit(now);
        const earned = fruit.config.points * multiplier;
        this.state.score += earned;
        this.currentSwipeSliceCount++;
        this.particles.spawnSliceEffect(fruit);
        this.particles.spawnScoreText(fruit.x, fruit.y, fruit.config.points, multiplier);
      }
    }

    if (sliced.length > 0) {
      this.emitState();
    }
  }

  private handleBombHit(fruit: Fruit) {
    this.state.score = Math.max(0, this.state.score + fruit.config.points);
    this.state.lives--;
    this.comboSystem.reset();
    this.currentSwipeSliceCount = 0;
    this.particles.spawnBombEffect(fruit.x, fruit.y);

    if (this.state.lives <= 0) {
      this.gameOver();
    }
  }

  private handleMissed(missed: Fruit[]) {
    if (missed.length === 0) return;

    this.state.lives -= missed.length;
    if (this.state.lives <= 0) {
      this.state.lives = 0;
      this.gameOver();
    }
    this.emitState();
  }

  private gameOver() {
    this.state.isRunning = false;
    this.state.isGameOver = true;
    this.screen = 'gameover';
    cancelAnimationFrame(this.rafId);
    this.emitState();
  }

  private emitState() {
    this.onStateChange({ ...this.state }, this.screen);
  }

  getState(): GameState {
    return { ...this.state };
  }

  getScreen(): GameScreen {
    return this.screen;
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    this.input.destroy();
  }
}
