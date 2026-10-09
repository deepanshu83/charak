import React from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  showDot?: boolean;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({
  variant = "neutral",
  children,
  showDot = false,
  dot = false,
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const hasDot = showDot || dot;
  const sizeClass = size === "sm" ? "badge-sm" : "badge-md";
  const variantClass = `badge-${variant}`;

  return (
    <span
      className={`ui-badge ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {hasDot && <span className="ui-badge-dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
