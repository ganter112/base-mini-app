import { Particle, SliceHalf, Fruit, FloatingText } from './types';
import { GRAVITY } from './constants';

export class ParticleSystem {
  particles: Particle[] = [];
  sliceHalves: SliceHalf[] = [];
  floatingTexts: FloatingText[] = [];

  spawnSliceEffect(fruit: Fruit) {
    const { x, y, config } = fruit;
    const juiceColor = config.innerColor || config.color;

    // Juice particles
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color: juiceColor,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.01,
      });
    }

    // Slice halves — fly sideways and fall down
    this.sliceHalves.push(
      {
        config,
        x,
        y,
        vx: -3 - Math.random() * 2,
        vy: 1 + Math.random() * 2,
        rotation: fruit.rotation,
        rotationSpeed: -0.12,
        alpha: 1,
        side: 'left',
      },
      {
        config,
        x,
        y,
        vx: 3 + Math.random() * 2,
        vy: 1 + Math.random() * 2,
        rotation: fruit.rotation,
        rotationSpeed: 0.12,
        alpha: 1,
        side: 'right',
      }
    );
  }

  spawnBombEffect(x: number, y: number) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 6,
        color: i % 2 === 0 ? '#e74c3c' : '#f39c12',
        alpha: 1,
        decay: 0.02 + Math.random() * 0.01,
      });
    }
  }

  spawnScoreText(x: number, y: number, points: number, multiplier: number) {
    const total = points * multiplier;
    let text = `+${total}`;
    let color = '#ffffff';

    if (multiplier >= 4) {
      text = `+${total} x${multiplier}!`;
      color = '#f0b90b';
    } else if (multiplier >= 3) {
      text = `+${total} x${multiplier}`;
      color = '#e74c3c';
    } else if (multiplier >= 2) {
      text = `+${total} x${multiplier}`;
      color = '#3498db';
    }

    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -2,
      scale: multiplier >= 3 ? 1.4 : multiplier >= 2 ? 1.2 : 1,
    });
  }

  spawnSwipeBonus(x: number, y: number, count: number) {
    const bonusPoints = count * (count - 1); // 2=2, 3=6, 4=12, 5=20
    this.floatingTexts.push({
      x,
      y: y - 40,
      text: `SWIPE x${count}! +${bonusPoints}`,
      color: '#00ff88',
      alpha: 1,
      vy: -3,
      scale: 1.3 + count * 0.1,
    });
  }

  update() {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += GRAVITY * 0.4;
      p.alpha -= p.decay;
    }
    this.particles = this.particles.filter(p => p.alpha > 0);

    for (const h of this.sliceHalves) {
      h.x += h.vx;
      h.y += h.vy;
      h.vy += GRAVITY * 0.5;
      h.rotation += h.rotationSpeed;
      h.alpha -= 0.012;
    }
    this.sliceHalves = this.sliceHalves.filter(h => h.alpha > 0);

    for (const t of this.floatingTexts) {
      t.y += t.vy;
      t.alpha -= 0.015;
    }
    this.floatingTexts = this.floatingTexts.filter(t => t.alpha > 0);
  }

  reset() {
    this.particles = [];
    this.sliceHalves = [];
    this.floatingTexts = [];
  }
}
