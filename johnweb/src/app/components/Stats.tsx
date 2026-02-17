    // components/StatsSection.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function StatsSection() {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [counts, setCounts] = useState({ clients: 0, emails: 0, revenue: 0, years: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounts({
          clients: Math.min(47, Math.floor(47 * progress)),
          emails: Math.min(2.4, Number((2.4 * progress).toFixed(1))),
          revenue: Math.min(18.5, Number((18.5 * progress).toFixed(1))),
          years: Math.min(5, Math.floor(5 * progress)),
        });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isInView]);

  return (
    <>
      <style jsx>{`
        .stats-section {
          padding: 4rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          text-align: center;
          border-top: 1px solid var(--border);
        }
        
        .stat-item {
          padding: 1.5rem;
          position: relative;
        }
        
        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 6vw, 3.5rem);
          font-weight: 900;
          color: var(--purple);
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          font-size: clamp(0.7rem, 2vw, 0.8rem);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--muted);
          font-weight: 500;
        }
        
        .stat-glow {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        
        @media (min-width: 768px) {
          .stats-section {
            grid-template-columns: repeat(4, 1fr);
            padding: 5rem 2rem;
          }
        }
      `}</style>

      <div className="stats-section" ref={ref}>
        {[
          { value: counts.clients, label: "Happy Clients", suffix: "" },
          { value: counts.emails, label: "Emails Sent (M)", suffix: "M" },
          { value: counts.revenue, label: "Revenue Generated (M)", suffix: "M" },
          { value: counts.years, label: "Years Experience", suffix: "+" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="stat-item"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
          >
            <div className="stat-glow" />
            <div className="stat-number">
              {stat.value}{stat.suffix}
            </div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </>
  );
}