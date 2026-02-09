import { COMBO_WINDOW_MS, getComboMultiplier } from './constants';

export class ComboSystem {
  combo = 0;
  multiplier = 1;
  private lastSliceTime = 0;

  hit(now: number): { combo: number; multiplier: number } {
    if (now - this.lastSliceTime > COMBO_WINDOW_MS) {
      this.combo = 0;
    }
    this.combo++;
    this.lastSliceTime = now;
    this.multiplier = getComboMultiplier(this.combo);
    return { combo: this.combo, multiplier: this.multiplier };
  }

  checkExpiry(now: number) {
    if (this.combo > 0 && now - this.lastSliceTime > COMBO_WINDOW_MS) {
      this.combo = 0;
      this.multiplier = 1;
    }
  }

  reset() {
    this.combo = 0;
    this.multiplier = 1;
    this.lastSliceTime = 0;
  }
}
