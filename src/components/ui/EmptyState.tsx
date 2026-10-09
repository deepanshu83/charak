import React from "react";
import { FolderOpen } from "lucide-react";
import Button from "@/components/ui/Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  description?: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({
  icon = <FolderOpen size={48} className="text-gold" />,
  title,
  message,
  description,
  actionText,
  actionLabel,
  onAction,
  actionHref,
  className = "",
}: EmptyStateProps) {
  const displayMessage = message || description || "";
  const displayAction = actionText || actionLabel;

  return (
    <div className={`ui-empty-state ${className}`.trim()} role="status">
      <div className="empty-icon-wrap" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-title">{title}</h3>
      {displayMessage && <p className="empty-message">{displayMessage}</p>}
      {displayAction && (actionHref || onAction) && (
        <div className="empty-action">
          {actionHref ? (
            <Button href={actionHref}>{displayAction}</Button>
          ) : (
            <Button onClick={onAction}>{displayAction}</Button>
          )}
        </div>
      )}
    </div>
  );
}
