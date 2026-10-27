"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of the element that names the dialog (usually its heading). */
  labelledBy: string;
  describedBy?: string;
  /** Close when the dimmed area outside the dialog is clicked (default true). */
  dismissOnBackdrop?: boolean;
  /** Classes for the <dialog> element itself — size, position, surface. */
  className?: string;
  children: ReactNode;
}

let scrollLocks = 0;

function lockScroll() {
  if (scrollLocks++ > 0) return;
  // Hiding the scrollbar would shift the page sideways on desktops with
  // classic scrollbars, so pad the body by the same width while locked.
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = "hidden";
  if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
}

function unlockScroll() {
  if (--scrollLocks > 0) return;
  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
}

/**
 * An accessible modal built on the native <dialog> element: the rest of the
 * page becomes inert, focus stays inside, Escape closes it, background
 * scrolling is locked, and focus returns to whatever opened it.
 *
 * Put `data-autofocus` on the element that should receive focus first.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  dismissOnBackdrop = true,
  className,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll(); // before showModal(), while the scrollbar can still be measured
    if (!dialog.open) dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    return () => {
      unlockScroll();
      if (dialog.open) dialog.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        // Handled here so it closes exactly once and never also reaches
        // page-level shortcuts (like leaving presentation mode).
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onCancel={(event) => {
        // e.g. the Android back gesture
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (dismissOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      {open ? children : null}
    </dialog>
  );
}
