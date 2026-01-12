import React, { useEffect, useRef } from "react";
import { animate } from "animejs";

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPage = ({ children, className = "" }: AnimatedPageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Using the signature from src/types/animejs.d.ts: animate(targets, parameters)
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: "easeOutExpo",
      });
    }
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
