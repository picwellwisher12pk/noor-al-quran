"use client";

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  showCloseButton?: boolean;
  draggable?: boolean;
  backdropBlur?: boolean;
  backdropClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
  showCloseButton = true,
  draggable = false,
  backdropBlur = true,
  backdropClassName,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // Reset offset when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setOffset({ x: 0, y: 0 });
      setIsDragging(false);
      hasDraggedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!draggable) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    // Don't start drag when clicking interactive elements in header
    if ((e.target as HTMLElement).closest("button, a, input, select, textarea, [role='button']")) {
      return;
    }
    if (e.button !== 0) return;

    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartOffset.current = { ...offset };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasDraggedRef.current = true;
    }

    let nextX = dragStartOffset.current.x + deltaX;
    let nextY = dragStartOffset.current.y + deltaY;

    // Viewport bounds clamping so the modal header always remains reachable
    if (typeof window !== "undefined") {
      const maxX = Math.max(0, window.innerWidth / 2 - 80);
      const minX = -maxX;
      const maxY = Math.max(0, window.innerHeight / 2 - 60);
      const minY = -maxY;

      nextX = Math.max(minX, Math.min(maxX, nextX));
      nextY = Math.max(minY, Math.min(maxY, nextY));
    }

    setOffset({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleBackdropClick = () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ${
        draggable ? "overflow-hidden" : "overflow-y-auto"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        className={`fixed inset-0 transition-opacity ${
          backdropBlur
            ? "bg-black/60 backdrop-blur-sm"
            : "bg-black/20 dark:bg-black/45"
        } ${backdropClassName || ""}`}
      />

      {/* Modal Dialog Content */}
      <div
        ref={modalRef}
        style={
          draggable && (offset.x !== 0 || offset.y !== 0)
            ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }
            : undefined
        }
        className={`relative w-full ${maxWidthClasses} overflow-hidden rounded-2xl bg-[var(--modal-bg)] border border-[var(--card-border)] shadow-2xl my-8 z-10 flex flex-col max-h-[90vh] ${
          isDragging ? "select-none transition-none" : "transition-transform duration-100 ease-out"
        }`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            onPointerDown={draggable ? handlePointerDown : undefined}
            onPointerMove={draggable ? handlePointerMove : undefined}
            onPointerUp={draggable ? handlePointerUp : undefined}
            onPointerCancel={draggable ? handlePointerUp : undefined}
            onDoubleClick={draggable ? () => setOffset({ x: 0, y: 0 }) : undefined}
            title={draggable ? "Drag to move • Double click to center" : undefined}
            className={`flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 ${
              draggable ? "cursor-grab active:cursor-grabbing select-none" : ""
            }`}
          >
            <div className="flex-1 text-lg font-semibold text-[var(--foreground)]">{title}</div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] transition-colors focus:outline-none shrink-0 ml-2"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-6 text-[var(--foreground)]">{children}</div>
      </div>
    </div>
  );
}
