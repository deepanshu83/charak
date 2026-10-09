import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "interactive" | "highlight" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  as?: React.ElementType;
}

export default function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  as: Component = "div",
  ...props
}: CardProps) {
  const variantClass =
    variant === "interactive"
      ? "ui-card-interactive"
      : variant === "highlight"
      ? "ui-card-highlight"
      : variant === "bordered"
      ? "ui-card-bordered"
      : "ui-card-default";

  const paddingClass =
    padding === "none"
      ? "p-0"
      : padding === "sm"
      ? "ui-card-p-sm"
      : padding === "lg"
      ? "ui-card-p-lg"
      : "ui-card-p-md";

  return (
    <Component
      className={`ui-card ${variantClass} ${paddingClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
