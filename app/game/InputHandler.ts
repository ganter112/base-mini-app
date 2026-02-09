import { SwipePoint } from './types';
import { SWIPE_TRAIL_LIFETIME } from './constants';

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private points: SwipePoint[] = [];
  private isDown = false;
  private onSwipeUpdate: (points: SwipePoint[]) => void;

  constructor(canvas: HTMLCanvasElement, onSwipeUpdate: (points: SwipePoint[]) => void) {
    this.canvas = canvas;
    this.onSwipeUpdate = onSwipeUpdate;
    this.bind();
  }

  private bind() {
    const opts: AddEventListenerOptions = { passive: false };
    this.canvas.addEventListener('pointerdown', this.handleDown, opts);
    this.canvas.addEventListener('pointermove', this.handleMove, opts);
    this.canvas.addEventListener('pointerup', this.handleUp, opts);
    this.canvas.addEventListener('pointercancel', this.handleUp, opts);
  }

  private getPos(e: PointerEvent): SwipePoint {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      time: performance.now(),
    };
  }

  private handleDown = (e: PointerEvent) => {
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    this.isDown = true;
    this.points = [this.getPos(e)];
  };

  private handleMove = (e: PointerEvent) => {
    if (!this.isDown) return;
    e.preventDefault();
    this.points.push(this.getPos(e));
    this.onSwipeUpdate(this.points);
  };

  private handleUp = (e: PointerEvent) => {
    e.preventDefault();
    this.isDown = false;
    this.points = [];
    this.onSwipeUpdate([]);
  };

  getActivePoints(): SwipePoint[] {
    const now = performance.now();
    return this.points.filter(p => now - p.time < SWIPE_TRAIL_LIFETIME);
  }

  getRecentSegments(): [SwipePoint, SwipePoint][] {
    const active = this.getActivePoints();
    const segments: [SwipePoint, SwipePoint][] = [];
    for (let i = 1; i < active.length; i++) {
      segments.push([active[i - 1], active[i]]);
    }
    return segments;
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.handleDown);
    this.canvas.removeEventListener('pointermove', this.handleMove);
    this.canvas.removeEventListener('pointerup', this.handleUp);
    this.canvas.removeEventListener('pointercancel', this.handleUp);
  }
}
