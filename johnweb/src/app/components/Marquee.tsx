// components/MarqueeSection.tsx
"use client";

import { useEffect, useRef } from "react";

const MARQUEE_ITEMS = [
  "Email Copy",
  "Sales Funnels",
  "Welcome Series",
  "Retention Flows",
  "Ecommerce Strategy",
  "A/B Testing",
  "Pop-Up Design",
  "Email Templates",
  "Conversion Architecture",
  "Behavioural Copywriting",
  "Lead Magnets",
  "Newsletter Design",
];

export default function MarqueeSection() {
  const marqueeRef = useRef(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let animationId: number;
    let startTime: number | null = null;
    const speed = 0.05; // pixels per millisecond

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      if (marquee) {
        const translateX = (elapsed * speed) % (marquee.scrollWidth / 2);
        marquee.style.transform = `translateX(-${translateX}px)`;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .marquee-wrap {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 1.3rem 0;
          overflow: hidden;
          position: relative;
          background: rgba(139,92,246,0.02);
        }
        
        .marquee-wrap::before,
        .marquee-wrap::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          z-index: 2;
          width: 50px;
          background: linear-gradient(90deg, var(--ink), transparent);
        }
        
        .marquee-wrap::after {
          right: 0;
          background: linear-gradient(270deg, var(--ink), transparent);
        }
        
        .marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
        }
        
        .marquee-item {
          display: flex;
          align-items: center;
          gap: 1.4rem;
          padding: 0 2rem;
          white-space: nowrap;
          font-size: clamp(0.7rem, 2vw, 0.74rem);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 500;
          color: var(--muted);
        }
        
        .m-sep {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--purple);
          flex-shrink: 0;
          box-shadow: 0 0 10px var(--purple);
        }

        @media (max-width: 768px) {
          .marquee-wrap::before,
          .marquee-wrap::after {
            width: 30px;
          }
        }
      `}</style>

      <div className="marquee-wrap">
        <div className="marquee-track" ref={marqueeRef}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div className="marquee-item" key={i}>
              <span className="m-sep" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}