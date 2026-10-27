import type { SVGProps } from "react";

/** Path for a soft four-pointed star centred on (0, 0). */
export function sparklePath(radius: number): string {
  const r = radius;
  const c = radius * 0.16;
  return `M0 ${-r}C${c} ${-c} ${c} ${-c} ${r} 0C${c} ${c} ${c} ${c} 0 ${r}C${-c} ${c} ${-c} ${c} ${-r} 0C${-c} ${-c} ${-c} ${-c} 0 ${-r}Z`;
}

/** A decorative four-pointed sparkle. */
export function Sparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d={sparklePath(12)} />
    </svg>
  );
}
