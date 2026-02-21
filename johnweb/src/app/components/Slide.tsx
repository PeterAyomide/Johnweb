"use client";

import { useEffect, useRef } from "react";

interface SlideProps {
  speed?: number;
  className?: string;
}

const Slide = ({ speed = 55, className = "" }: SlideProps) => {
 
  const slides = [12, 8, 14, 13, 6, 9, 2, 15, 5, 13, 7, 10, 4, 1].map((n) => ({
    id: n,
    src: `/slide${n}.png`,
    alt: `Slide ${n}`,
  }));

  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const pausedRef = useRef<boolean>(false);

  const CARD_WIDTH = 280;
  const CARD_GAP = 24;
  const ITEM_WIDTH = CARD_WIDTH + CARD_GAP;
  const TOTAL_WIDTH = ITEM_WIDTH * slides.length;

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!pausedRef.current) {
        posRef.current += (speed * delta) / 1000;
        if (posRef.current >= TOTAL_WIDTH) {
          posRef.current -= TOTAL_WIDTH;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [speed, TOTAL_WIDTH]);

  const loopSlides = [...slides, ...slides];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .speakers-section {
          width: 100vw;
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          background: transparent;
          padding: 80px 0 60px;
          overflow: hidden;
          box-sizing: border-box;
        }

        .speakers-header {
          text-align: center;
          padding: 0 24px 52px;
        }

        .speakers-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9b8cff;
          margin-bottom: 18px;
        }

        .speakers-eyebrow::before,
        .speakers-eyebrow::after {
          content: '';
          display: block;
          width: 32px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #9b8cff);
        }
        .speakers-eyebrow::after {
          background: linear-gradient(90deg, #9b8cff, transparent);
        }

        .speakers-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 700;
          line-height: 1.1;
          color: #ffffff;
          margin: 0 0 20px;
          letter-spacing: -0.01em;
        }

        .speakers-title em {
          font-style: italic;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255,255,255,0.6);
        }

        .speakers-title-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .title-line-bar {
          height: 1px;
          width: 60px;
          background: linear-gradient(90deg, transparent, rgba(155,140,255,0.5));
        }
        .title-line-bar:last-child {
          background: linear-gradient(90deg, rgba(155,140,255,0.5), transparent);
        }
        .title-line-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9b8cff;
          box-shadow: 0 0 10px rgba(155,140,255,0.8);
        }

        .speakers-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 300;
          color: rgba(255,255,255,0.5);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Full-bleed scroll strip ── */
        .slide-outer {
          width: 100%;
          overflow: hidden;
          background: transparent;
          position: relative;
          padding: 16px 0 24px;
        }

        .slide-outer::before,
        .slide-outer::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 140px;
          z-index: 10;
          pointer-events: none;
        }
        .slide-outer::before {
          left: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.65) 0%, transparent 100%);
        }
        .slide-outer::after {
          right: 0;
          background: linear-gradient(to left, rgba(0,0,0,0.65) 0%, transparent 100%);
        }

        .slide-track {
          display: flex;
          gap: 24px;
          will-change: transform;
          width: max-content;
          padding: 10px 0;
        }

        .slide-card {
          flex-shrink: 0;
          width: 280px;
          height: 420px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow:
            0 2px 0 rgba(255,255,255,0.06) inset,
            0 16px 48px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.04);
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease;
          cursor: pointer;
        }

        .slide-card:hover {
          transform: scale(1.03) translateY(-6px);
          box-shadow:
            0 2px 0 rgba(255,255,255,0.08) inset,
            0 30px 70px rgba(0,0,0,0.6),
            0 0 0 1px rgba(155,140,255,0.2);
        }

        .slide-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: transform 0.6s ease;
        }

        .slide-card:hover img {
          transform: scale(1.05);
        }

        .slide-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.55) 100%);
          pointer-events: none;
        }

        .speakers-footer {
          text-align: center;
          padding-top: 36px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }

        @media (max-width: 768px) {
          .speakers-section {
            padding: 60px 0 40px;
          }
          .slide-card {
            width: 200px;
            height: 300px;
          }
        }
      `}</style>

      <section className={`speakers-section ${className}`}>

        <div className="speakers-header">
          <div className="speakers-eyebrow">My work</div>

          <h2 className="speakers-title">
            Copy Meets <em>Design</em>
          </h2>

          <div className="speakers-title-line">
            <div className="title-line-bar" />
            <div className="title-line-dot" />
            <div className="title-line-bar" />
          </div>

          <p className="speakers-desc">
            A gathering of extraordinary minds — pastors, creatives,
            entrepreneurs, and coaches coming together to challenge,
            equip, and transform.
          </p>
        </div>

        <div
          className="slide-outer"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => {
            pausedRef.current = false;
            lastTimeRef.current = null;
          }}
        >
          <div className="slide-track" ref={trackRef}>
            {loopSlides.map((slide, i) => (
              <div className="slide-card" key={`${slide.id}-${i}`}>
                <img
                  src={slide.src}
                  alt={slide.alt}
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    if (el.parentElement) {
                      el.parentElement.style.background =
                        "linear-gradient(160deg, #1a1432, #0d0d1a)";
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

       

      </section>
    </>
  );
};

export default Slide;