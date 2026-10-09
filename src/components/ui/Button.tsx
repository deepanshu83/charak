"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "gold" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      href,
      icon,
      iconPosition = "left",
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClass =
      variant === "gold"
        ? "gold"
        : variant === "ghost"
        ? "ghost"
        : variant === "outline"
        ? "ghost btn-outline"
        : variant === "danger"
        ? "btn-danger"
        : "";

    const sizeClass = size === "sm" ? "sm" : size === "lg" ? "lg" : "";
    const classes = `btn ${variantClass} ${sizeClass} ${className}`.trim();

    const renderIcon = icon && <span className="btn-icon">{icon}</span>;

    const content = (
      <>
        {isLoading ? (
          <Loader2 size={size === "sm" ? 14 : 18} className="btn-spinner animate-spin" />
        ) : (
          iconPosition === "left" && renderIcon
        )}
        {children && <span>{children}</span>}
        {!isLoading && iconPosition === "right" && renderIcon}
      </>
    );

    if (href && !disabled) {
      return (
        <Link href={href} className={classes} aria-disabled={disabled}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
