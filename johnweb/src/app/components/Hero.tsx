"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const useTypewriter = (words: string[], speed = 90, pause = 2200) => {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const cur = words[idx];
    let t: NodeJS.Timeout;
    if (!del && display === cur) {
      t = setTimeout(() => setDel(true), pause);
    } else if (del && display === "") {
      setDel(false);
      setIdx((i) => (i + 1) % words.length);
    } else {
      const next = del ? cur.slice(0, display.length - 1) : cur.slice(0, display.length + 1);
      t = setTimeout(() => setDisplay(next), del ? speed / 2 : speed);
    }
    return () => clearTimeout(t);
  }, [display, del, idx, words, speed, pause]);

  return display;
};

const ROLES = ["Copywriter.", "Sales Strategist.", "Email Marketer.", "Conversion Architect."];

export default function HeroSection() {
  const role = useTypewriter(ROLES, 85, 2000);
  const ease = [0.22, 1, 0.36, 1];
  const up = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } };

  return (
    <>
      <style jsx>{`
        .hero {
          min-height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 1.5rem 6rem;
          overflow: hidden;
        }
        
        .hero-container {
          max-width: 1200px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3rem;
        }
        
        .hero-glow {
          position: absolute;
          width: min(800px, 90vw);
          height: min(800px, 90vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        
        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 800px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .hero-image-section {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 500px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
        }
        
        .hero-image-container {
          width: 100%;
          aspect-ratio: 1/1;
          max-width: 400px;
          position: relative;
          border-radius: 30px;
          overflow: hidden;
        }
        
        .hero-image-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #6d28d9, #a78bfa);
          border-radius: 30px;
        }
        
        .floating-shape {
          position: absolute;
          width: min(100px, 15vw);
          height: min(100px, 15vw);
          background: rgba(139,92,246,0.2);
          border-radius: 50%;
          filter: blur(40px);
          animation: float-shape 8s ease-in-out infinite;
        }
        
        @keyframes float-shape {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px,-30px) scale(1.2); }
        }
        
        .shape-1 { top: 20%; left: 10%; animation-delay: 0s; }
        .shape-2 { bottom: 20%; right: 10%; animation-delay: 2s; width: min(150px, 20vw); height: min(150px, 20vw); }
        .shape-3 { top: 40%; right: 20%; animation-delay: 4s; width: min(80px, 12vw); height: min(80px, 12vw); }
        
        .hero-rule {
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
          margin: 0 auto 2.5rem;
          animation: rule-expand 1.4s 0.3s ease forwards;
        }
        
        @keyframes rule-expand { to { width: min(260px, 80%); } }
        
        .hero-eyebrow {
          font-size: clamp(0.6rem, 2vw, 0.7rem);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-weight: 500;
          color: #8b5cf6;
          margin-bottom: 1.5rem;
        }
        
        .hero-name {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(2.5rem, 8vw, 5.5rem);
          line-height: 0.94;
          letter-spacing: -0.035em;
          color: var(--parchment);
          margin-bottom: 0.5rem;
        }
        
        .hero-name em {
          font-style: italic;
          color: #8b5cf6;
          display: block;
        }
        
        .hero-tagline {
          font-size: clamp(0.85rem, 2.5vw, 1.15rem);
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 2rem;
          letter-spacing: 0.02em;
          padding: 0 1rem;
        }
        
        .tw-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.2rem, 4vw, 2.6rem);
          font-weight: 700;
          color: var(--parchment);
          margin-bottom: 1.5rem;
          min-height: 3.2rem;
          letter-spacing: -0.02em;
          flex-wrap: wrap;
        }
        
        .tw-cursor {
          display: inline-block;
          width: 2.5px;
          height: 0.9em;
          background: #8b5cf6;
          margin-left: 4px;
          animation: blink 1s step-end infinite;
          border-radius: 1px;
          vertical-align: middle;
        }
        
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        
        .hero-mission {
          max-width: 600px;
          margin: 0 auto 2rem;
          font-size: clamp(0.9rem, 2.5vw, 1rem);
          line-height: 1.7;
          color: var(--muted);
          font-weight: 300;
          padding: 0 1rem;
        }
        
        .hero-mission strong {
          color: var(--parchment);
          font-weight: 600;
        }
        
        .hero-btns {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          padding: 0 1rem;
        }
        
        .btn-purple {
          padding: 0.8rem 1.8rem;
          border-radius: 4px;
          background: #8b5cf6;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 28px rgba(139,92,246,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        
        .btn-purple:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(139,92,246,0.45);
        }
        
        .btn-ghost {
          padding: 0.8rem 1.8rem;
          border-radius: 4px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--parchment);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        
        .btn-ghost:hover {
          border-color: #8b5cf6;
          color: #8b5cf6;
        }
        
        .scroll-ind {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          opacity: 0.35;
          font-size: 0.62rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        
        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(180deg, #8b5cf6, transparent);
          animation: scroll-reveal 2s ease-in-out infinite;
        }
        
        @keyframes scroll-reveal {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        
        /* Tablet and Desktop */
        @media (min-width: 768px) {
          .hero-container {
            flex-direction: row;
            gap: 2rem;
          }
          
          .hero-content {
            text-align: left;
            align-items: flex-start;
            flex: 1;
          }
          
          .hero-image-section {
            flex: 1;
          }
          
          .hero-rule {
            margin: 0 0 2.5rem;
          }
          
          .hero-mission {
            margin: 0 0 2rem;
          }
          
          .hero-btns {
            justify-content: flex-start;
          }
        }
        
        /* Large Desktop */
        @media (min-width: 1200px) {
          .hero-container {
            gap: 4rem;
          }
        }
      `}</style>

      <section className="hero">
        <div className="hero-glow" />
        
        <div className="hero-container">
          {/* Content - First on mobile, left on desktop */}
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p 
              className="hero-eyebrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Here I am
            </motion.p>

            <div className="hero-rule" />

            <motion.h1 
              className="hero-name"
              variants={up}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.85, delay: 0.5, ease }}
            >
              John
              <em>Adegboye</em>
            </motion.h1>

            <motion.p 
              className="hero-tagline"
              variants={up}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, delay: 0.75, ease }}
            >
              Words that sell. Strategies that scale. Emails that convert.
            </motion.p>

            <motion.div 
              className="tw-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              {role}<span className="tw-cursor" />
            </motion.div>

            <motion.p 
              className="hero-mission"
              variants={up}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, delay: 1.2, ease }}
            >
              Your brand needs someone who <strong>leads with strategy</strong>, writes with
              persuasion, and designs for conversion. <strong>All at once.</strong>
            </motion.p>

            <motion.div 
              className="hero-btns"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 1.45, ease }}
            >
              <button className="btn-purple">See My Work ↗</button>
              <button className="btn-ghost">Let's Talk</button>
            </motion.div>
          </motion.div>

          {/* Image - Second on mobile, right on desktop */}
          <motion.div 
            className="hero-image-section"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.7, ease }}
          >
            <div className="hero-image-container">
              <div className="hero-image-bg" />
              <div className="floating-shape shape-1" />
              <div className="floating-shape shape-2" />
              <div className="floating-shape shape-3" />
              
              <svg width="100%" height="100%" viewBox="0 0 500 500" style={{ position: 'relative', zIndex: 10 }}>
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.6" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <circle cx="250" cy="250" r="120" fill="url(#grad)" filter="url(#glow)">
                  <animate attributeName="r" values="120;130;120" dur="6s" repeatCount="indefinite" />
                </circle>
                
                <circle cx="250" cy="250" r="80" fill="rgba(255,255,255,0.1)">
                  <animate attributeName="r" values="80;90;80" dur="5s" repeatCount="indefinite" />
                </circle>
                
                <rect x="200" y="200" width="100" height="100" fill="rgba(255,255,255,0.05)" transform="rotate(45 250 250)">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="45 250 250"
                    to="405 250 250"
                    dur="20s"
                    repeatCount="indefinite"
                  />
                </rect>
                
                <path d="M250 150 L300 250 L250 350 L200 250 Z" fill="rgba(139,92,246,0.3)">
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values="1;1.1;1"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </path>
                
                {Array.from({ length: 20 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={150 + Math.random() * 200}
                    cy={150 + Math.random() * 200}
                    r={2 + Math.random() * 4}
                    fill="white"
                    opacity="0.3"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.8;0.3"
                      dur={`${3 + Math.random() * 4}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
              </svg>
            </div>
          </motion.div>
        </div>

        <div className="scroll-ind">
          <div className="scroll-line" />
          Scroll
        </div>
      </section>
    </>
  );
}