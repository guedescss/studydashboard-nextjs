import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  highlight?: boolean;
}

export function Card({ children, highlight = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl p-5
        bg-white/5 backdrop-blur-xl
        border ${highlight ? "border-violet-500/40" : "border-white/5"}
        shadow-lg
        transition-all duration-200
        hover:bg-white/[0.07]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
