import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Soft illustrated scenes that stand in for photos that haven't been added
 * yet. They're deliberately simple and clearly labelled as placeholders
 * by the gallery — never presented as real memories.
 */
export const SCENE_COUNT = 6;

// Which scene each gallery slot shows, chosen to suit the sample captions:
// night sky, seaside, coffee, flowers, golden hour, city lights.
const SCENE_ORDER = [1, 2, 4, 3, 0, 5];

interface PlaceholderSceneProps {
  variant: number;
  className?: string;
}

export function PlaceholderScene({ variant, className }: PlaceholderSceneProps) {
  const id = useId();
  const scene = SCENE_ORDER[((variant % SCENE_COUNT) + SCENE_COUNT) % SCENE_COUNT];
  const sky = `${id}-sky`;

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={cn("block size-full", className)}
    >
      {scene === 0 && (
        <>
          <defs>
            <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f7cfb2" />
              <stop offset="1" stopColor="#f3cfc6" />
            </linearGradient>
          </defs>
          <rect width="400" height="400" fill={`url(#${sky})`} />
          <circle cx="200" cy="215" r="72" fill="#fcf0d4" opacity="0.92" />
          <path d="M0 268Q100 220 200 254T400 244V400H0Z" fill="#e9b1a6" />
          <path d="M0 312Q120 268 232 304T400 298V400H0Z" fill="#d48a8f" />
          <path
            d="M118 120l9 7 9-7M150 102l7 5 7-5"
            stroke="#9d4a5c"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {scene === 1 && (
        <>
          <defs>
            <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2d2451" />
              <stop offset="1" stopColor="#15112a" />
            </linearGradient>
          </defs>
          <rect width="400" height="400" fill={`url(#${sky})`} />
          <circle cx="285" cy="112" r="44" fill="#fcf0d4" />
          <circle cx="304" cy="99" r="40" fill="#2a2149" />
          {[
            [60, 70],
            [110, 140],
            [170, 60],
            [220, 180],
            [350, 210],
            [80, 220],
            [140, 250],
            [330, 40],
            [240, 90],
            [40, 160],
          ].map(([x, y], index) => (
            <circle key={index} cx={x} cy={y} r={index % 3 === 0 ? 2.6 : 1.6} fill="#f5dca6" />
          ))}
          <path d="M0 330Q90 290 190 318T400 300V400H0Z" fill="#201a3c" />
        </>
      )}
      {scene === 2 && (
        <>
          <defs>
            <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ddd0f0" />
              <stop offset="0.62" stopColor="#fbe4d3" />
            </linearGradient>
          </defs>
          <rect width="400" height="400" fill={`url(#${sky})`} />
          <circle cx="200" cy="248" r="56" fill="#f7cfb2" />
          <rect y="248" width="400" height="152" fill="#c4b1e2" />
          {[278, 310, 346].map((y, index) => (
            <path
              key={y}
              d={`M${-20 + index * 14} ${y}q25-12 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0`}
              stroke="#f7f3fb"
              strokeOpacity="0.7"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </>
      )}
      {scene === 3 && (
        <>
          <rect width="400" height="400" fill="#fdf3f0" />
          {[
            { x: 120, y: 190, color: "#e9b1a6", stem: 240 },
            { x: 210, y: 150, color: "#d48a8f", stem: 280 },
            { x: 295, y: 205, color: "#f0b48f", stem: 230 },
          ].map((flower) => (
            <g key={flower.x}>
              <path
                d={`M${flower.x} ${flower.y + 20}C${flower.x - 8} ${flower.y + 90} ${flower.x + 10} ${flower.y + 150} ${flower.x} ${flower.y + flower.stem}`}
                stroke="#a7b59a"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                  key={angle}
                  cx={flower.x}
                  cy={flower.y - 22}
                  rx="15"
                  ry="25"
                  fill={flower.color}
                  transform={`rotate(${angle} ${flower.x} ${flower.y})`}
                />
              ))}
              <circle cx={flower.x} cy={flower.y} r="13" fill="#f5dca6" />
            </g>
          ))}
        </>
      )}
      {scene === 4 && (
        <>
          <rect width="400" height="400" fill="#f6ede1" />
          <rect y="292" width="400" height="108" fill="#ead9c4" />
          {[130, 270].map((x, index) => (
            <g key={x}>
              <ellipse
                cx={x}
                cy="296"
                rx="62"
                ry="12"
                fill="#fffcf7"
                stroke="#e9b1a6"
                strokeWidth="3"
              />
              <path
                d={`M${x - 42} 200h84v62a30 30 0 0 1-30 30h-24a30 30 0 0 1-30-30Z`}
                fill="#fffcf7"
                stroke="#d48a8f"
                strokeWidth="3"
              />
              <path
                d={`M${x + 42} 218a22 22 0 0 1 0 40`}
                fill="none"
                stroke="#d48a8f"
                strokeWidth="3"
              />
              <path
                d={`M${x - 10 + index * 4} 182c-12-16 12-24 0-42M${x + 12} 180c-12-16 12-24 0-42`}
                stroke="#d48a8f"
                strokeOpacity="0.5"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          ))}
          <path
            d="M200 150s-14-8.6-18-17.2c-2.8-7 1.3-14.5 8.6-14.5 4 0 6.8 2 9.4 5.6 2.6-3.6 5.4-5.6 9.4-5.6 7.3 0 11.4 7.5 8.6 14.5-4 8.6-18 17.2-18 17.2Z"
            fill="#bd6b78"
          />
        </>
      )}
      {scene === 5 && (
        <>
          <defs>
            <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#67518b" />
              <stop offset="1" stopColor="#f0b48f" />
            </linearGradient>
          </defs>
          <rect width="400" height="400" fill={`url(#${sky})`} />
          {[
            [0, 210, 70],
            [64, 160, 60],
            [118, 240, 56],
            [170, 130, 70],
            [236, 200, 52],
            [282, 170, 64],
            [340, 230, 60],
          ].map(([x, top, width]) => (
            <g key={x}>
              <rect x={x} y={top} width={width} height={400 - top} fill="#2d2451" />
              {[0, 1, 2, 3].map((row) =>
                [0, 1].map((col) =>
                  (row + col + x) % 3 === 0 ? null : (
                    <rect
                      key={`${row}-${col}`}
                      x={x + 12 + col * (width / 2 - 6)}
                      y={top + 18 + row * 34}
                      width="10"
                      height="14"
                      fill="#f5dca6"
                      opacity="0.85"
                    />
                  ),
                ),
              )}
            </g>
          ))}
        </>
      )}
    </svg>
  );
}
