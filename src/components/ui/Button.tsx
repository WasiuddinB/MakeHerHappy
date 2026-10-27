import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "gold" | "night";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-full font-medium tracking-[0.01em] touch-manipulation transition-[transform,box-shadow,background-color,color,opacity] duration-300 ease-soft active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-rose-700 text-paper shadow-[0_12px_28px_-12px_rgb(127_52_73/0.8)] hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-[0_18px_34px_-14px_rgb(127_52_73/0.85)]",
  secondary:
    "bg-paper/85 text-rose-700 ring-1 ring-rose-700/25 backdrop-blur-sm hover:-translate-y-0.5 hover:bg-paper hover:ring-rose-700/45",
  ghost: "text-rose-700 hover:bg-rose-700/10",
  gold: "bg-[linear-gradient(110deg,var(--color-gold-200),var(--color-gold-300)_45%,var(--color-peach-200))] text-wine shadow-glow hover:-translate-y-0.5 hover:brightness-105",
  night: "text-gold-100 ring-1 ring-gold-200/40 hover:bg-white/10 hover:ring-gold-200/70",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-6 text-[0.95rem]",
  lg: "min-h-14 px-8 text-base sm:text-lg",
  icon: "size-11 shrink-0",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
