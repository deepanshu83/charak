import React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "default" | "narrow" | "wide";
  className?: string;
}

export default function Container({
  children,
  size = "default",
  className = "",
  style,
  ...props
}: ContainerProps) {
  const maxWidth =
    size === "narrow" ? "960px" : size === "wide" ? "1400px" : "1200px";

  return (
    <div
      className={`wrap container-root ${className}`.trim()}
      style={{ maxWidth, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
