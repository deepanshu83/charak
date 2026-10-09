"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth,
  size = "md",
  footer,
  className = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const effectiveSize = maxWidth || size;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass =
    effectiveSize === "sm"
      ? "modal-max-sm"
      : effectiveSize === "lg"
      ? "modal-max-lg"
      : effectiveSize === "xl"
      ? "modal-max-xl"
      : "modal-max-md";

  return (
    <div
      className="ui-modal-backdrop"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        className={`ui-modal-content ${maxWidthClass} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-dialog-title" : undefined}
      >
        <div className="ui-modal-header">
          <div>
            {title && (
              <h3 id="modal-dialog-title" className="ui-modal-title">
                {title}
              </h3>
            )}
            {description && (
              <p className="ui-modal-desc">{description}</p>
            )}
          </div>
          <button
            type="button"
            className="ui-modal-close"
            onClick={onClose}
            aria-label="Close modal dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="ui-modal-body">{children}</div>
        {footer && <div className="ui-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
