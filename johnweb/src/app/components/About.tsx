// app/components/AboutSection.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ease = [0.22, 1, 0.36, 1];

  return (
    <>
      <style jsx>{`
        .about-wrap {
          border-top: 1px solid var(--border);
          width: 100%;
        }
        
        .about {
          padding: 5rem 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: start;
        }
        
        .sec-label {
          font-size: 0.68rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--purple);
          font-weight: 500;
          margin-bottom: 1.1rem;
        }
        
        .about-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.025em;
          color: var(--parchment);
        }
        
        .about-h2 em {
          font-style: italic;
          color: var(--purple);
        }
        
        .stat-row {
          display: flex;
          gap: 2rem;
          margin-top: 2.5rem;
          flex-wrap: wrap;
        }
        
        .stat-item {
          flex: 1;
          min-width: 100px;
        }
        
        .stat-number {
          display: block;
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 4vw, 2.2rem);
          font-weight: 900;
          color: var(--purple);
          line-height: 1;
          margin-bottom: 0.3rem;
        }
        
        .stat-label {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 500;
        }
        
        .about-body {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        
        .about-body p {
          font-size: 0.95rem;
          line-height: 1.8;
          color: var(--muted);
          font-weight: 300;
        }
        
        .about-body p strong {
          color: var(--parchment);
          font-weight: 600;
        }
        
        .signature-block {
          margin-top: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        
        .signature {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-style: italic;
          color: var(--purple);
          opacity: 0.8;
        }
        
        .experience-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: rgba(139,92,246,0.05);
        }
        
        .badge-number {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 900;
          color: var(--purple);
        }
        
        .badge-text {
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          color: var(--muted);
        }
        
        @media (min-width: 768px) {
          .about {
            padding: 7rem 2rem;
            grid-template-columns: 1fr 1.6fr;
            gap: 4rem;
          }
          
          .stat-row {
            gap: 2.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          .about {
            gap: 5rem;
          }
        }
      `}</style>

      <div className="about-wrap" ref={ref}>
        <div className="about">
          {/* Left Column - Philosophy & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.75, ease }}
          >
            <p className="sec-label">Philosophy</p>
            <h2 className="about-h2">
              Strategy <em>first.</em>
              <br />
              Always.
            </h2>
            
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-number">∞</span>
                <span className="stat-label">Email Strategies</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Conversion Focus</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Shortcuts Taken</span>
              </div>
            </div>

            <div className="signature-block">
              <span className="signature">J. Adegboye</span>
              <div className="experience-badge">
                <span className="badge-number">5+</span>
                <span className="badge-text">Years of Excellence</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - About Text */}
          <motion.div 
            className="about-body"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.15, ease }}
          >
            <p>
              In my experience with clients, I've seen how a brand{' '}
              <strong>literally doesn't just want an Email Designer, or just a copywriter.</strong>{' '}
              Visual appeal alone won't drive conversion. What works is a holistic approach that 
              combines strategy, psychology, and design.
            </p>
            
            <p>
              While I excel in designing{' '}
              <strong>visually appealing emails that are conversion-focused and brand-aligned</strong>, 
              and writing copy that anticipates and addresses prospect objections, I've also deeply 
              studied email strategies from the finest agencies, building a comprehensive strategic 
              framework that delivers results.
            </p>
            
            <p>
              These strategies have positioned me to understand the{' '}
              <strong>behavioral patterns and resistance points of prospects.</strong>{' '}
              So when I design and write copy, every element is rooted in strategy first — all to 
              ensure we <strong>cut through resistance and drive meaningful conversions.</strong>
            </p>

            <p>
              My approach combines data-driven insights with creative storytelling. Each campaign is 
              meticulously crafted based on audience research, behavioral psychology, and proven 
              conversion principles. The result is not just beautiful emails, but emails that actually 
              perform and contribute to your bottom line.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}