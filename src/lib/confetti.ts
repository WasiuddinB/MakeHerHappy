import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion } from "./hooks";

/**
 * A small, dependency-free confetti burst.
 *
 * One <canvas> is created on first use and reused. A single animation-frame
 * loop runs only while particles are alive, bursts are capped, and
 * everything is removed when the owning component unmounts — so repeated
 * celebrations can't pile up timers or leak animation loops.
 */

const COLORS = ["#ecc681", "#f3cfc6", "#d48a8f", "#c4b1e2", "#f7cfb2", "#bd6b78", "#fffcf7"];
const GRAVITY = 1150; // px/s²
const MAX_FALL_SPEED = 430; // px/s — keeps the fall floaty
const MAX_PARTICLES = 420;

export type ParticleShape = "ribbon" | "dot" | "heart";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  tilt: number;
  tiltSpeed: number;
  size: number;
  color: string;
  shape: ParticleShape;
  age: number;
  life: number;
}

export interface BurstOptions {
  /** Viewport position as fractions, e.g. { x: 0.5, y: 0.4 }. */
  origin: { x: number; y: number };
  count?: number;
  /** Spread angle in degrees around straight up. */
  spread?: number;
}

export function createParticles(
  { origin, count = 90, spread = 110 }: BurstOptions,
  viewport: { width: number; height: number },
  random: () => number = Math.random,
): Particle[] {
  const shapes: ParticleShape[] = ["ribbon", "ribbon", "dot", "heart"];
  return Array.from({ length: count }, () => {
    const angle = ((-90 + (random() - 0.5) * spread) * Math.PI) / 180;
    const speed = 480 + random() * 620;
    return {
      x: origin.x * viewport.width,
      y: origin.y * viewport.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: random() * Math.PI * 2,
      spin: (random() - 0.5) * 12,
      tilt: random() * Math.PI * 2,
      tiltSpeed: 4 + random() * 6,
      size: 7 + random() * 7,
      color: COLORS[Math.floor(random() * COLORS.length)],
      shape: shapes[Math.floor(random() * shapes.length)],
      age: 0,
      life: 2.6 + random() * 1.4,
    };
  });
}

/** Advances particles by `dt` seconds and drops the ones that are finished. */
export function stepParticles(particles: Particle[], dt: number, height: number): Particle[] {
  const alive: Particle[] = [];
  for (const particle of particles) {
    particle.age += dt;
    particle.vx *= 1 - Math.min(1.6 * dt, 1);
    particle.vy = Math.min(particle.vy + GRAVITY * dt, MAX_FALL_SPEED);
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.rotation += particle.spin * dt;
    particle.tilt += particle.tiltSpeed * dt;
    if (particle.age < particle.life && particle.y < height + 40) alive.push(particle);
  }
  return alive;
}

function drawParticle(context: CanvasRenderingContext2D, particle: Particle) {
  const fadeIn = Math.min(particle.age * 6, 1);
  const fadeOut = Math.min((particle.life - particle.age) / 0.6, 1);
  context.save();
  context.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));
  context.translate(particle.x, particle.y);
  context.rotate(particle.rotation);
  context.scale(1, Math.cos(particle.tilt));
  context.fillStyle = particle.color;
  const s = particle.size;
  if (particle.shape === "ribbon") {
    context.fillRect(-s / 2, -s / 4, s, s / 2);
  } else if (particle.shape === "dot") {
    context.beginPath();
    context.arc(0, 0, s / 3, 0, Math.PI * 2);
    context.fill();
  } else {
    const h = s / 2;
    context.beginPath();
    context.moveTo(0, h * 0.9);
    context.bezierCurveTo(-h * 1.4, -h * 0.1, -h * 0.6, -h * 1.2, 0, -h * 0.35);
    context.bezierCurveTo(h * 0.6, -h * 1.2, h * 1.4, -h * 0.1, 0, h * 0.9);
    context.fill();
  }
  context.restore();
}

export interface ConfettiOverlay {
  burst: (options: BurstOptions) => void;
  destroy: () => void;
}

export function createConfettiOverlay(): ConfettiOverlay {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "pointer-events-none fixed inset-0 z-[70] size-full";
  document.body.append(canvas);

  const context = canvas.getContext("2d");
  let particles: Particle[] = [];
  let frame = 0;
  let last = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const loop = (time: number) => {
    if (!context) return;
    const dt = Math.min(Math.max((time - last) / 1000, 0), 0.05);
    last = time;
    particles = stepParticles(particles, dt, window.innerHeight);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const particle of particles) drawParticle(context, particle);
    frame = particles.length > 0 ? requestAnimationFrame(loop) : 0;
  };

  return {
    burst(options) {
      if (!context) return;
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      particles.push(...createParticles(options, viewport));
      if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    },
    destroy() {
      cancelAnimationFrame(frame);
      frame = 0;
      particles = [];
      window.removeEventListener("resize", resize);
      canvas.remove();
    },
  };
}

/**
 * Returns a `burst` function bound to the calling component's lifetime.
 * Does nothing for people who prefer reduced motion.
 */
export function useConfetti(): (options: BurstOptions) => void {
  const holder = useRef<{ overlay: ConfettiOverlay | null }>({ overlay: null });

  useEffect(() => {
    const current = holder.current;
    return () => {
      current.overlay?.destroy();
      current.overlay = null;
    };
  }, []);

  return useCallback((options: BurstOptions) => {
    if (prefersReducedMotion()) return;
    const current = holder.current;
    current.overlay ??= createConfettiOverlay();
    current.overlay.burst(options);
  }, []);
}
