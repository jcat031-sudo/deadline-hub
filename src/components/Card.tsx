import type { ReactNode } from "react";

export default function Card({
  children,
  onClick,
  accent,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  accent?: string;
  className?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={`card ${onClick ? "card--tappable" : ""} ${className}`}
      onClick={onClick}
      style={accent ? ({ "--card-accent": accent } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
