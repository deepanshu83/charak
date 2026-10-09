import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export default function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="wrap">
        <div className="page-hero-content">
          <div className="tag-badge">
            <Sparkles size={14} />
            <span>{eyebrow}</span>
          </div>
          <h1>{title}</h1>
          <p>{description}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
