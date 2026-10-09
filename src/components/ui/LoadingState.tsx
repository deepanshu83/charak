import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingState({
  message = "Loading...",
  fullHeight = false,
  size = "md",
  className = "",
}: LoadingStateProps) {
  const iconSize = size === "sm" ? 22 : size === "lg" ? 44 : 32;

  return (
    <div
      className={`ui-loading-state ${fullHeight ? "full-height" : ""} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <Loader2 size={iconSize} className="ui-loading-spinner animate-spin" />
      {message && <span className="ui-loading-message">{message}</span>}
    </div>
  );
}
