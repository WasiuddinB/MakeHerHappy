import { describe, expect, it, vi } from "vitest";
import {
  createConfettiOverlay,
  createParticles,
  stepParticles,
  type Particle,
} from "@/lib/confetti";
import { seededRandom } from "@/lib/random";

const viewport = { width: 1000, height: 800 };

describe("createParticles", () => {
  it("starts every particle at the burst origin, heading upwards", () => {
    const particles = createParticles(
      { origin: { x: 0.5, y: 0.25 }, count: 40 },
      viewport,
      seededRandom(1),
    );
    expect(particles).toHaveLength(40);
    for (const particle of particles) {
      expect(particle.x).toBe(500);
      expect(particle.y).toBe(200);
      expect(particle.vy).toBeLessThan(0);
    }
  });
});

describe("stepParticles", () => {
  const particle = (overrides: Partial<Particle>): Particle => ({
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    rotation: 0,
    spin: 0,
    tilt: 0,
    tiltSpeed: 0,
    size: 10,
    color: "#fff",
    shape: "dot",
    age: 0,
    life: 3,
    ...overrides,
  });

  it("pulls particles down with gravity", () => {
    const [moved] = stepParticles([particle({})], 0.1, viewport.height);
    expect(moved.vy).toBeGreaterThan(0);
    expect(moved.y).toBeGreaterThan(100);
  });

  it("removes particles that have finished or fallen off screen", () => {
    const alive = stepParticles(
      [particle({}), particle({ age: 2.99 }), particle({ y: 900 })],
      0.05,
      viewport.height,
    );
    expect(alive).toHaveLength(1);
  });
});

describe("createConfettiOverlay", () => {
  it("cleans up its canvas and listeners", () => {
    const removeListener = vi.spyOn(window, "removeEventListener");
    const overlay = createConfettiOverlay();
    expect(document.querySelectorAll("canvas")).toHaveLength(1);

    // No 2D context in jsdom — bursting must be a harmless no-op.
    expect(() => overlay.burst({ origin: { x: 0.5, y: 0.5 } })).not.toThrow();

    overlay.destroy();
    expect(document.querySelectorAll("canvas")).toHaveLength(0);
    expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
