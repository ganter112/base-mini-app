import { Fruit, SwipePoint, SliceHalf, Particle, FloatingText } from './types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  clear() {
    const { ctx, width, height } = this;
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  drawFruit(fruit: Fruit) {
    const { ctx } = this;
    const { x, y, rotation, config } = fruit;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    if (config.isBomb) {
      // Bomb body
      ctx.beginPath();
      ctx.arc(0, 0, config.radius, 0, Math.PI * 2);
      ctx.fillStyle = config.color;
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Fuse
      ctx.beginPath();
      ctx.moveTo(0, -config.radius);
      ctx.lineTo(4, -config.radius - 14);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spark
      ctx.beginPath();
      ctx.arc(4, -config.radius - 16, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f39c12';
      ctx.fill();

      // X mark
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 4;
      const s = config.radius * 0.35;
      ctx.beginPath();
      ctx.moveTo(-s, -s);
      ctx.lineTo(s, s);
      ctx.moveTo(s, -s);
      ctx.lineTo(-s, s);
      ctx.stroke();
    } else {
      // Shadow
      ctx.beginPath();
      ctx.arc(3, 3, config.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fill();

      // Fruit body
      ctx.beginPath();
      ctx.arc(0, 0, config.radius, 0, Math.PI * 2);
      ctx.fillStyle = config.color;
      ctx.fill();

      // Inner circle for watermelon
      if (config.innerColor) {
        ctx.beginPath();
        ctx.arc(0, 0, config.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = config.innerColor;
        ctx.fill();
      }

      // Highlight
      ctx.beginPath();
      ctx.arc(-config.radius * 0.25, -config.radius * 0.25, config.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();

      // Leaf for apple/strawberry
      if (config.type === 'apple' || config.type === 'strawberry') {
        ctx.beginPath();
        ctx.ellipse(2, -config.radius - 5, 8, 12, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#27ae60';
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawSliceHalf(half: SliceHalf) {
    const { ctx } = this;
    const { x, y, rotation, config, side, alpha } = half;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    if (side === 'left') {
      ctx.arc(0, 0, config.radius, Math.PI * 0.5, Math.PI * 1.5);
    } else {
      ctx.arc(0, 0, config.radius, -Math.PI * 0.5, Math.PI * 0.5);
    }
    ctx.closePath();
    ctx.fillStyle = config.color;
    ctx.fill();

    if (config.innerColor) {
      ctx.beginPath();
      if (side === 'left') {
        ctx.arc(0, 0, config.radius * 0.7, Math.PI * 0.5, Math.PI * 1.5);
      } else {
        ctx.arc(0, 0, config.radius * 0.7, -Math.PI * 0.5, Math.PI * 0.5);
      }
      ctx.closePath();
      ctx.fillStyle = config.innerColor;
      ctx.fill();
    }

    // Flat cut face
    ctx.beginPath();
    ctx.moveTo(0, -config.radius);
    ctx.lineTo(0, config.radius);
    ctx.strokeStyle = config.innerColor || '#fff8e0';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  drawParticle(p: Particle) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }

  drawSwipeTrail(points: SwipePoint[]) {
    if (points.length < 2) return;
    const { ctx } = this;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      const t = i / points.length;
      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${t * 0.9})`;
      ctx.lineWidth = 4 + t * 8; // thicker blade trail
      ctx.stroke();
    }

    // Glow effect
    if (points.length > 2) {
      const last = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();
    }

    ctx.restore();
  }

  drawFloatingText(ft: FloatingText) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = ft.alpha;
    const size = Math.round(24 * ft.scale);
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 12;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  drawComboText(combo: number, multiplier: number, lastSliceX: number, lastSliceY: number) {
    if (combo < 2) return;
    const { ctx } = this;

    ctx.save();
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = multiplier >= 4 ? '#f0b90b' : multiplier >= 3 ? '#e74c3c' : '#3498db';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 20;
    ctx.fillText(`x${multiplier} COMBO!`, lastSliceX, lastSliceY - 60);
    ctx.restore();
  }
}
