import React from "react";
import { Sparkles } from "lucide-react";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  tagIcon?: React.ReactNode;
  children?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  tagIcon = <Sparkles size={14} />,
  children,
  as: HeadingTag = "h2",
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`section-heading-wrap ${centered ? "text-center mx-auto" : ""} ${className}`}
      style={centered ? { maxWidth: "780px", margin: "0 auto 36px", textAlign: "center" } : { marginBottom: "32px" }}
    >
      {eyebrow && (
        <div className="tag-badge" style={centered ? { margin: "0 auto 12px" } : { marginBottom: "12px" }}>
          {tagIcon}
          <span>{eyebrow}</span>
        </div>
      )}
      <HeadingTag className="section-heading-title">{title}</HeadingTag>
      {description && <p className="section-heading-desc">{description}</p>}
      {children}
    </div>
  );
}
