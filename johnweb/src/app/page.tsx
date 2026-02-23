"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Slide from "./components/Slide";

type Theme = "dark" | "light";

/* ══════════════════════════════════════════════════════
   GLOBAL STYLES — toned purple palette with whiter text
══════════════════════════════════════════════════════ */
const G = ({ t }: { t: Theme }) => {
  const d = t === "dark";
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      :root {
        --p1:#6b5ec7;   /* muted violet-600  */
        --p2:#7d6fd0;   /* muted violet-500  */
        --p3:#8f82d9;   /* muted violet-400  */
        --p4:#a89fe2;   /* muted violet-300  */
        --p5:#e8e4f9;   /* muted violet-100  */

        --bg:       ${d ? "#0b0813" : "#faf8ff"};
        --bg2:      ${d ? "#120e1f" : "#ffffff"};
        --bg3:      ${d ? "#1a1330" : "#f3eeff"};
        --fg:       ${d ? "#f5f3ff" : "#1e1033"};
        --fg2:      ${d ? "#e8e4f9" : "rgba(30,16,51,0.75)"};
        --fg3:      ${d ? "#d0c9e8"  : "rgba(30,16,51,0.45)"};
        --border:   ${d ? "rgba(125,111,208,0.2)"  : "rgba(107,94,199,0.18)"};
        --card:     ${d ? "rgba(255,255,255,0.05)"  : "rgba(255,255,255,0.92)"};
        --card-sh:  ${d ? "0 8px 40px rgba(0,0,0,0.35)" : "0 8px 40px rgba(107,94,199,0.08)"};
        --nav-bg:   ${d ? "rgba(11,8,19,0.92)"      : "rgba(250,248,255,0.92)"};
        --glow:     ${d ? "rgba(125,111,208,0.12)"   : "rgba(125,111,208,0.08)"};
      }
      html{scroll-behavior:smooth;}
      body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--fg);overflow-x:hidden;transition:background .4s,color .4s;}
      ::-webkit-scrollbar{width:4px;}
      ::-webkit-scrollbar-thumb{background:var(--p2);border-radius:4px;}
      ::-webkit-scrollbar-track{background:transparent;}
      ::selection{background:var(--p2);color:#fff;}
      button{font-family:'DM Sans',sans-serif;}
      img{max-width:100%;display:block;}

      /* ── Global section rhythm ── */
      .sec{ border-top:1px solid var(--border); padding:8rem 0; }
      .sec-in{ max-width:1100px; margin:0 auto; padding:0 3.5rem; }
      .sec-label{ font-size:.68rem;letter-spacing:.28em;text-transform:uppercase;
        color:var(--p2);font-weight:500;margin-bottom:.9rem; }
      .sec-heading{ font-family:'Playfair Display',serif;
        font-size:clamp(2rem,4vw,3rem);font-weight:900;line-height:1.1;
        letter-spacing:-.025em;color:var(--fg); }
      @media(max-width:860px){ .sec{ padding:6rem 0; } }
      @media(max-width:640px){ .sec{ padding:4.5rem 0; } .sec-in{ padding:0 1.4rem; } }
    `}</style>
  );
};

/* ══════════════════════════════════════════════════════ NOISE */
const Noise = () => (
  <div style={{ position:"fixed",inset:0,zIndex:9998,pointerEvents:"none",opacity:.022,
    backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundRepeat:"repeat",backgroundSize:"160px"}} />
);

/* ══════════════════════════════════════════════════════ SCROLL TOP */
const ScrollTop = () => {
  const [v, setV] = useState(false);
  useEffect(() => {
    const fn = () => setV(window.scrollY > 500);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <AnimatePresence>
      {v && (
        <motion.button
          initial={{ opacity:0, scale:.7, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          exit={{ opacity:0, scale:.7, y:20 }} transition={{ duration:.28 }}
          whileHover={{ scale:1.12 }} whileTap={{ scale:.9 }}
          onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
          style={{ position:"fixed",bottom:"2rem",right:"2rem",zIndex:900,
            width:48,height:48,borderRadius:"50%",
            background:"linear-gradient(135deg,var(--p1),var(--p2))",
            border:"none",cursor:"pointer",display:"flex",
            alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 24px rgba(125,111,208,.4)",color:"#fff",fontSize:"1.1rem" }}
          aria-label="Scroll to top">↑</motion.button>
      )}
    </AnimatePresence>
  );
};

/* ══════════════════════════════════════════════════════ CAROUSEL HOOK */
function useCarousel(len: number) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(len - 1, i + 1));
  const go   = (i: number) => setIdx(i);
  return { idx, prev, next, go };
}

/* ══════════════════════════════════════════════════════
   CAROUSEL SHELL — touch/mouse drag + glowing dot indicators only
══════════════════════════════════════════════════════ */
const CarouselShell = ({
  count, idx, prev, next, go, children,
}: {
  count: number; idx: number; prev: () => void; next: () => void;
  go: (i: number) => void; children: React.ReactNode;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const startX   = useRef(0);
  const dragging  = useRef(false);

  /* ── pointer / touch handlers ── */
  const onDragStart = (clientX: number) => {
    startX.current  = clientX;
    dragging.current = true;
  };
  const onDragEnd = (clientX: number) => {
    if (!dragging.current) return;
    dragging.current = false;
    const delta = startX.current - clientX;
    if (delta > 40)  next();
    if (delta < -40) prev();
  };

  return (
    <>
      <style>{`
        .car-track-wrap{
          overflow:hidden;
          cursor:grab;
          user-select:none;
          -webkit-user-select:none;
          border-radius:10px;
        }
        .car-track-wrap:active{cursor:grabbing;}
        .car-track{
          display:flex;
          will-change:transform;
          transition:transform .42s cubic-bezier(.32,1,.36,1);
        }
        /* ── dots ── */
        .car-dots{
          display:flex;justify-content:center;align-items:center;
          gap:.5rem;margin-top:1.6rem;
        }
        .car-dot{
          height:8px;border-radius:99px;border:none;cursor:pointer;padding:0;
          outline:none;
          transition:
            width  .38s cubic-bezier(.34,1.2,.64,1),
            background .28s ease,
            box-shadow .28s ease,
            opacity .2s;
        }
        .car-dot.off{
          width:8px;
          background:rgba(125,111,208,.18);
          opacity:.65;
        }
        .car-dot.off:hover{
          background:rgba(125,111,208,.4);
          box-shadow:0 0 8px rgba(125,111,208,.4);
          opacity:1;
        }
        .car-dot.on{
          width:30px;
          background:linear-gradient(90deg,var(--p1),var(--p3));
          box-shadow:
            0 0 10px rgba(125,111,208,.6),
            0 0 24px rgba(125,111,208,.3);
          opacity:1;
        }
      `}</style>

      <div>
        {/* draggable track */}
        <div
          className="car-track-wrap"
          ref={trackRef}
          onMouseDown={e  => onDragStart(e.clientX)}
          onMouseUp={e    => onDragEnd(e.clientX)}
          onMouseLeave={e => { if (dragging.current) onDragEnd(e.clientX); }}
          onTouchStart={e => onDragStart(e.touches[0].clientX)}
          onTouchEnd={e   => onDragEnd(e.changedTouches[0].clientX)}
        >
          <div
            className="car-track"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {children}
          </div>
        </div>

        {/* glowing pill dots — no arrows */}
        <div className="car-dots">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              className={`car-dot ${i === idx ? "on" : "off"}`}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════ NAVBAR */
const NAV_LINKS = ["Home", "About", "Services", "Portfolio"];

const Navbar = ({ t, toggle }: { t: Theme; toggle: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Home");
  const d = t === "dark";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (l: string) => {
    setOpen(false); setActive(l);
    if (l === "Home") { 
      window.scrollTo({ top:0, behavior:"smooth" }); 
      return; 
    }
    const element = document.getElementById(l.toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior:"smooth" });
    }
  };

  const handleContactClick = () => {
    window.open("https://wa.link/8qk7mn", "_blank");
  };

  return (
    <>
      <style>{`
        .nav{position:fixed;top:0;left:0;right:0;z-index:800;display:flex;align-items:center;
          justify-content:space-between;padding:0 3rem;height:68px;transition:all .4s;
          border-bottom:1px solid ${scrolled ? "var(--border)" : "transparent"};
          background:${scrolled ? "var(--nav-bg)" : "transparent"};
          backdrop-filter:${scrolled ? "blur(24px)" : "none"};}
        .nav-logo{font-family:'Playfair Display',serif;font-weight:900;font-size:1.15rem;
          letter-spacing:-.02em;color:var(--fg);text-decoration:none;
          display:flex;align-items:center;gap:.5rem;cursor:pointer;background:none;border:none;}
        .nav-logo em{font-style:italic;color:var(--p2);}
        .nav-pulse{width:7px;height:7px;border-radius:50%;background:var(--p2);
          box-shadow:0 0 10px var(--p2);animation:npulse 2.5s ease-in-out infinite;}
        @keyframes npulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}
        .nav-links{display:flex;align-items:center;gap:.25rem;list-style:none;}
        .nav-btn{padding:.4rem .95rem;border-radius:4px;font-size:.81rem;font-weight:500;
          letter-spacing:.06em;text-transform:uppercase;background:none;border:none;cursor:pointer;
          color:var(--fg2);transition:color .2s;position:relative;}
        .nav-btn:hover{color:var(--fg);}
        .nav-btn.act{color:var(--fg);}
        .nav-btn.act::after{content:'';display:block;height:2px;background:var(--p2);border-radius:1px;margin-top:2px;}
        .nav-right{display:flex;align-items:center;gap:.8rem;}
        .theme-tog{width:48px;height:26px;border-radius:99px;border:1.5px solid var(--border);
          background:${d?"rgba(125,111,208,.15)":"rgba(125,111,208,.1)"};cursor:pointer;
          position:relative;transition:background .35s;flex-shrink:0;}
        .theme-knob{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;
          transition:left .3s cubic-bezier(.34,1.56,.64,1);
          left:${d?"26px":"3px"};background:var(--p2);
          display:flex;align-items:center;justify-content:center;font-size:10px;line-height:1;}
        .nav-cta{padding:.48rem 1.3rem;border-radius:4px;
          border:1.5px solid var(--p2);background:transparent;color:var(--p2);
          font-size:.81rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
          cursor:pointer;transition:background .2s,color .2s;}
        .nav-cta:hover{background:var(--p2);color:#fff;}
        .ham{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;}
        .ham-bar{width:22px;height:1.5px;background:var(--fg);transition:all .3s;border-radius:1px;}
        .mob-nav{position:fixed;top:68px;left:0;right:0;z-index:799;
          background:var(--nav-bg);backdrop-filter:blur(24px);
          border-bottom:1px solid var(--border);padding:1.5rem 2rem;
          display:flex;flex-direction:column;gap:.4rem;}
        .mob-lnk{padding:.8rem .5rem;border:none;background:none;font-size:.95rem;font-weight:500;
          color:var(--fg2);text-align:left;cursor:pointer;
          border-bottom:1px solid var(--border);transition:color .2s;}
        .mob-lnk:hover{color:var(--p2);}
        @media(max-width:720px){.nav{padding:0 1.25rem;}.nav-links,.nav-cta{display:none;}.ham{display:flex;}}
      `}</style>

      <nav className="nav">
        <button className="nav-logo" onClick={() => go("Home")}>
          <span className="nav-pulse"/> John <em>Adegboye</em>
        </button>
        <ul className="nav-links">
          {NAV_LINKS.map(l => (
            <li key={l}><button className={`nav-btn ${active===l?"act":""}`} onClick={()=>go(l)}>{l}</button></li>
          ))}
        </ul>
        <div className="nav-right">
          <button className="theme-tog" onClick={toggle} aria-label="Toggle theme">
            <span className="theme-knob">{d?"🌙":"☀️"}</span>
          </button>
          <button className="nav-cta" onClick={handleContactClick}>Work With Me</button>
          <button className="ham" onClick={()=>setOpen(!open)}>
            <span className="ham-bar" style={{transform:open?"rotate(45deg) translateY(6.5px)":"none"}}/>
            <span className="ham-bar" style={{opacity:open?0:1}}/>
            <span className="ham-bar" style={{transform:open?"rotate(-45deg) translateY(-6.5px)":"none"}}/>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div className="mob-nav"
            initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}}
            exit={{opacity:0,y:-12}} transition={{duration:.2}}>
            {NAV_LINKS.map(l => (
              <button key={l} className="mob-lnk" onClick={()=>go(l)}>{l}</button>
            ))}
            <button className="mob-lnk" onClick={handleContactClick}>Contact</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ══════════════════════════════════════════════════════ TYPEWRITER */
const useTypewriter = (words: string[], speed=85, pause=2000) => {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = words[idx];
    const t = setTimeout(() => {
      if (!del && display===cur){setDel(true);return;}
      if (del && display===""){setDel(false);setIdx(i=>(i+1)%words.length);return;}
      setDisplay(del ? cur.slice(0,display.length-1) : cur.slice(0,display.length+1));
    }, !del&&display===cur ? pause : del ? speed/2 : speed);
    return ()=>clearTimeout(t);
  },[display,del,idx,words,speed,pause]);
  return display;
};

/* ══════════════════════════════════════════════════════ HERO */
const ROLES = ["Copywriter.","Sales Strategist.","Email Marketer.","Conversion Architect."];

const Hero = ({ t }: { t: Theme }) => {
  const role = useTypewriter(ROLES);
  const d = t === "dark";
  const e = [.22,1,.36,1] as any;

  const handleSeeWorkClick = () => {
    window.open("https://docs.google.com/document/d/1LNteSQdCO3uHBkmkBZG4Qui0aJvsuivDuIce11vDg5Y/edit?tab=t.0#heading=h.58wa1kvlp7yq", "_blank");
  };

  const handleContactClick = () => {
    window.open("https://wa.link/8qk7mn", "_blank");
  };

  return (
    <>
      <style>{`
        .hero{min-height:100vh;position:relative;display:flex;align-items:center;
          padding:100px 3rem 5rem;overflow:hidden;}
        .hero-glow{position:absolute;width:720px;height:720px;border-radius:50%;
          background:radial-gradient(circle,var(--glow) 0%,transparent 65%);
          right:-120px;top:50%;transform:translateY(-50%);pointer-events:none;}
        .hero-glow2{position:absolute;width:420px;height:420px;border-radius:50%;
          background:radial-gradient(circle,rgba(125,111,208,.05) 0%,transparent 65%);
          left:-80px;bottom:10%;pointer-events:none;}
        .hero-in{max-width:1100px;width:100%;margin:0 auto;
          display:grid;grid-template-columns:1.1fr .9fr;gap:4rem;align-items:center;
          position:relative;z-index:1;}
        .h-eyebrow{font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;
          color:var(--p2);font-weight:500;margin-bottom:1.5rem;
          display:flex;align-items:center;gap:.7rem;}
        .h-line{height:1px;width:40px;background:linear-gradient(90deg,var(--p2),var(--p3));}
        .h-rule{width:0;height:1px;
          background:linear-gradient(90deg,transparent,var(--p2),transparent);
          margin-bottom:3rem;animation:rule-x 1.4s .3s ease forwards;}
        @keyframes rule-x{to{width:220px}}
        .h-name{font-family:'Playfair Display',serif;font-weight:900;
          font-size:clamp(3rem,6.5vw,6rem);line-height:.94;letter-spacing:-.035em;
          color:var(--fg);margin-bottom:.6rem;}
        .h-name em{font-style:italic;
          background:linear-gradient(135deg,var(--p2),var(--p3));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;display:block;}
        .h-tag{font-size:clamp(.85rem,1.8vw,1.05rem);color:var(--fg2);
          font-weight:300;margin-bottom:2.2rem;line-height:1.65;}
        .tw-wrap{display:inline-flex;align-items:center;
          font-family:'Playfair Display',serif;
          font-size:clamp(1.3rem,3vw,2.2rem);font-weight:700;
          color:var(--fg);margin-bottom:2.8rem;min-height:2.8rem;letter-spacing:-.02em;}
        .tw-cur{display:inline-block;width:2.5px;height:.9em;
          background:var(--p2);margin-left:4px;border-radius:1px;
          animation:blink 1s step-end infinite;vertical-align:middle;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .h-btns{display:flex;gap:1rem;flex-wrap:wrap;}
        .btn-vio{padding:.85rem 2rem;border-radius:4px;
          background:linear-gradient(135deg,var(--p1),var(--p2));color:#fff;
          border:none;cursor:pointer;font-size:.88rem;font-weight:700;
          letter-spacing:.07em;text-transform:uppercase;
          box-shadow:0 4px 28px rgba(125,111,208,.3);
          transition:transform .2s,box-shadow .2s;}
        .btn-vio:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(125,111,208,.4);}
        .btn-ghost{padding:.85rem 2rem;border-radius:4px;background:transparent;
          border:1.5px solid var(--border);color:var(--fg2);
          font-size:.88rem;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
          cursor:pointer;transition:border-color .2s,color .2s;}
        .btn-ghost:hover{border-color:var(--p2);color:var(--p2);}
        /* image stage */
        .img-stage{position:relative;display:flex;justify-content:center;align-items:flex-end;}
        .img-frame{width:320px;height:400px;border-radius:180px 180px 40px 40px;
          background:${d?"linear-gradient(160deg,rgba(125,111,208,.12) 0%,rgba(11,8,19,.8) 100%)":"linear-gradient(160deg,rgba(168,159,226,.25) 0%,rgba(250,248,255,.6) 100%)"};
          border:1.5px solid var(--border);position:relative;overflow:hidden;
          box-shadow:var(--card-sh);display:flex;align-items:center;justify-content:center;}
        .img-placeholder{display:flex;flex-direction:column;align-items:center;
          justify-content:center;gap:1rem;padding:2rem;text-align:center;height:100%;}
        .ph-icon{width:88px;height:88px;border-radius:50%;
          background:linear-gradient(135deg,var(--p1),var(--p3));
          display:flex;align-items:center;justify-content:center;font-size:2.5rem;
          box-shadow:0 8px 32px rgba(125,111,208,.3);}
        .ph-txt{font-size:.76rem;color:var(--fg3);letter-spacing:.08em;
          text-transform:uppercase;font-weight:500;line-height:1.6;}
        .img-bdg{position:absolute;bottom:1.5rem;left:-2rem;
          background:var(--card);backdrop-filter:blur(16px);
          border:1px solid var(--border);border-radius:10px;
          padding:.8rem 1.1rem;min-width:155px;box-shadow:var(--card-sh);
          animation:fa 4s ease-in-out infinite;}
        .img-bdg2{position:absolute;top:2.5rem;right:-1.5rem;
          background:var(--card);backdrop-filter:blur(16px);
          border:1px solid var(--border);border-radius:10px;
          padding:.7rem 1rem;min-width:125px;box-shadow:var(--card-sh);
          animation:fb 5s ease-in-out .5s infinite;}
        @keyframes fa{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes fb{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .bdg-num{font-family:'Playfair Display',serif;font-size:1.55rem;font-weight:900;
          background:linear-gradient(135deg,var(--p2),var(--p3));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;line-height:1;}
        .bdg-lbl{font-size:.68rem;color:var(--fg2);font-weight:500;
          letter-spacing:.06em;text-transform:uppercase;margin-top:2px;}
        .bdg-stars{color:#8f82d9;font-size:.73rem;letter-spacing:1px;margin-bottom:3px;}
        /* ── tablet: 641–860px — side-by-side but tighter ── */
        @media(min-width:641px) and (max-width:860px){
          .hero{padding:90px 2rem 4rem;}
          .hero-in{grid-template-columns:1fr 1fr;gap:2rem;}
          .img-frame{width:220px;height:280px;}
          .img-bdg{left:-.25rem;min-width:130px;}
          .img-bdg2{right:-.25rem;min-width:110px;}
        }
        /* ── mobile: ≤640px — single column, image BELOW text ── */
        @media(max-width:640px){
          .hero{padding:88px 1.25rem 4rem;}
          .hero-in{
            grid-template-columns:1fr;
            gap:2.5rem;
            justify-items:center;
          }
          /* text block stays at natural order (order:0) */
          .hero-in > div:first-child{ order:1; width:100%; text-align:center; }
          /* image comes AFTER text */
          .img-stage{ order:2; }
          .h-eyebrow{ justify-content:center; }
          .h-rule{ margin-left:auto; margin-right:auto; }
          .h-btns{ justify-content:center; }
          .img-frame{width:220px;height:280px;}
          .img-bdg{left:.25rem;min-width:130px;}
          .img-bdg2{right:.25rem;min-width:110px;}
        }
      `}</style>

      <section className="hero" id="home">
        <div className="hero-glow"/><div className="hero-glow2"/>
        <div className="hero-in">
          <div>
            <div className="h-rule"/>
            <motion.p className="h-eyebrow" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.25}}>
              <span className="h-line"/> Here I am
            </motion.p>
            <motion.h1 className="h-name" initial={{opacity:0,y:32}} animate={{opacity:1,y:0}}
              transition={{duration:.85,delay:.45,ease:e}}>
              John<em>Adegboye</em>
            </motion.h1>
            <motion.p className="h-tag" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              transition={{duration:.7,delay:.65,ease:e}}>
              Copies that sell. Strategies that scale. Designs that engage.
            </motion.p>
            <motion.div className="tw-wrap" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.9}}>
              {role}<span className="tw-cur"/>
            </motion.div>
            <motion.div className="h-btns" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
              transition={{duration:.65,delay:1.1,ease:e}}>
              <button className="btn-vio" onClick={handleSeeWorkClick}>See My Work ↗</button>
              <button className="btn-ghost" onClick={handleContactClick}>Let's Talk</button>
            </motion.div>
          </div>

          <motion.div className="img-stage" initial={{opacity:0,scale:.92}}
            animate={{opacity:1,scale:1}} transition={{duration:.85,delay:.55,ease:e}}>
            <div className="img-frame">
              <div className="img-placeholder">
                <div className="ph-icon">✍️</div>
                <p className="ph-txt">Your photo<br/>goes here</p>
              </div>
            </div>
            <div className="img-bdg">
              <div className="bdg-stars">★★★★★</div>
              <div className="bdg-num">100%</div>
              <div className="bdg-lbl">Client Satisfaction</div>
            </div>
            <div className="img-bdg2">
              <div className="bdg-num">50+</div>
              <div className="bdg-lbl">Clients Served</div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

/* ══════════════════════════════════════════════════════ METRICS (4 cards) */
const useCounter = (target: number, dur=2000, active=false) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s=0; const step=target/(dur/16);
    const id=setInterval(()=>{ s=Math.min(s+step,target); setN(Math.floor(s)); if(s>=target)clearInterval(id); },16);
    return ()=>clearInterval(id);
  },[target,dur,active]);
  return n;
};

const METRICS = [
  { target:100, suffix:"%", label:"Client Satisfaction", icon:"⭐", sub:"Every client. Every time." },
  { target:50,  suffix:"+", label:"Clients Served",      icon:"🤝", sub:"Across niches & industries" },
  { target:300, suffix:"+", label:"Emails Crafted",      icon:"✉️", sub:"Copy, design & strategy" },
  { target:5,   suffix:"x", label:"Avg Revenue ROI",     icon:"📈", sub:"Per campaign average" },
];

const MetricCard = ({ m, active, idx }: { m:typeof METRICS[0]; active:boolean; idx:number }) => {
  const count = useCounter(m.target, 2200, active);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-60px" });

  return (
    <motion.div ref={ref}
      initial={{opacity:0,y:28}} animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:.6,delay:idx*.1,ease:[.22,1,.36,1]}}
      style={{padding:"2rem 1.5rem",border:"1px solid var(--border)",borderRadius:8,
        background:"var(--card)",backdropFilter:"blur(12px)",textAlign:"center",
        transition:"border-color .3s,box-shadow .3s,transform .3s",cursor:"default"}}
      whileHover={{y:-6,boxShadow:"0 16px 40px rgba(125,111,208,.15)"}}
      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(125,111,208,.45)";}}
      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="var(--border)";}}>
      <div style={{fontSize:"1.8rem",marginBottom:".6rem"}}>{m.icon}</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(2.2rem,4vw,3rem)",
        fontWeight:900,lineHeight:1,
        background:"linear-gradient(135deg,var(--p2),var(--p3))",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        backgroundClip:"text"}}>
        {count}{m.suffix}
      </div>
      <div style={{fontSize:".78rem",letterSpacing:".12em",textTransform:"uppercase",
        color:"var(--fg2)",fontWeight:600,marginTop:".45rem"}}>{m.label}</div>
      <div style={{fontSize:".72rem",color:"var(--fg3)",marginTop:".25rem",fontWeight:300}}>
        {m.sub}
      </div>
    </motion.div>
  );
};

const MetricsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-60px" });
  const [isMob, setIsMob] = useState(false);
  const car = useCarousel(METRICS.length);

  useEffect(() => {
    const fn = ()=>setIsMob(window.innerWidth<640);
    fn(); window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);

  return (
    <section className="sec" ref={ref}>
      <div className="sec-in">
        <motion.div initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}}
          transition={{duration:.7}} style={{textAlign:"center",marginBottom:"4rem"}}>
          <p className="sec-label">By the Numbers</p>
          <h2 className="sec-heading">Results That Speak</h2>
        </motion.div>

        {isMob ? (
          <CarouselShell count={METRICS.length} idx={car.idx} prev={car.prev} next={car.next} go={car.go}>
            {METRICS.map((m,i)=>(
              <div key={m.label} style={{flex:"0 0 100%",paddingRight:".5rem"}}>
                <MetricCard m={m} active={inView} idx={0}/>
              </div>
            ))}
          </CarouselShell>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1.4rem"}}>
            {METRICS.map((m,i)=><MetricCard key={m.label} m={m} active={inView} idx={i}/>)}
          </div>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════ ABOUT */
const About = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  const e = [.22,1,.36,1] as any;
  return (
    <section id="about" className="sec">
      <div className="sec-in" ref={ref} style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:"5.5rem",alignItems:"start"}}>
        <motion.div initial={{opacity:0,x:-28}} animate={inView?{opacity:1,x:0}:{}}
          transition={{duration:.75,ease:e}}>
          <p className="sec-label">Philosophy</p>
          <h2 className="sec-heading">
            Conversion <em style={{fontStyle:"italic",
              background:"linear-gradient(135deg,var(--p2),var(--p3))",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              backgroundClip:"text"}}>Necessaire.</em><br/>Always.
          </h2>
          <div style={{display:"flex",gap:"2.2rem",marginTop:"2.8rem",flexWrap:"wrap"}}>
            {[["∞"," Strategies"],["100%","Conversion Focus"],["0","Shortcuts"]].map(([n,l])=>(
              <div key={l}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"2rem",fontWeight:900,
                  background:"linear-gradient(135deg,var(--p2),var(--p3))",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                  backgroundClip:"text",lineHeight:1}}>{n}</div>
                <div style={{fontSize:".7rem",letterSpacing:".1em",textTransform:"uppercase",
                  color:"var(--fg3)",fontWeight:500,marginTop:4}}>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{opacity:0,x:28}} animate={inView?{opacity:1,x:0}:{}}
          transition={{duration:.75,delay:.15,ease:e}}>
          {[
             `"John’s approach didn't just change our copy; he changed our conversion rate overnight. He found the gaps we didn't even know were there." — Sophia Lin`,

    `Let me tell you how you make the angles sing. Most businesses don’t have a traffic problem; they have a “so what?” problem. Founders burn budgets on ads that produce nothing but expensive noise because the message fails to connect.`,

    `As a copywriter, my job is to stop that bleed.`,

    `The Proof: SaaS Case Study`,

    `I recently partnered with a scaling SaaS brand facing high traffic but stagnant conversions. The diagnosis? Their message was buried in technical jargon.`,

    `We re-engineered the narrative to focus on the user’s “future self” rather than just software features. By aligning the brand’s voice with the customer’s true desires, we achieved:`,

    `• A 35% lift in trial sign-ups within the first month.
     • A shift from “fingers-crossed” marketing to predictable results.`,

    `My Philosophy: Conversion Nécessaire. Deep-end research. A/B testing. Shifting ad angles. Strategy uplift. What matters in the end is conversion. That's how you make the angels sing.`,

    `The point is simple — we make every dollar of your ad spend work harder by turning your solution into the natural, inevitable next step for your prospect.`
  
          ].map((txt,i)=>(
            <p key={i} style={{fontSize:".95rem",lineHeight:1.9,color:"var(--fg2)",fontWeight:300,
              marginBottom:i<2?"1.4rem":0}}
              dangerouslySetInnerHTML={{__html:txt.replace(/<strong>(.*?)<\/strong>/g,
                `<strong style="color:var(--fg);font-weight:600">$1</strong>`)}}/>
          ))}
        </motion.div>
      </div>
      <style>{`@media(max-width:780px){#about .sec-in{grid-template-columns:1fr!important;gap:3rem!important;}}`}</style>
    </section>
  );
};

/* ══════════════════════════════════════════════════════ MARQUEE */
const TICKER=["Email Copy","Sales Funnels","Welcome Series","Retention Flows","Ecommerce Strategy","A/B Testing","Pop-Up Design","Email Templates","Conversion Architecture","Behavioural Copywriting"];
const Marquee = () => (
  <>
    <style>{`.mq{border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:1.2rem 0;overflow:hidden;position:relative;}
      .mq::before,.mq::after{content:'';position:absolute;top:0;bottom:0;z-index:2;width:80px;background:linear-gradient(90deg,var(--bg),transparent);}
      .mq::after{right:0;background:linear-gradient(270deg,var(--bg),transparent);}
      .mq-tr{display:flex;animation:tck 30s linear infinite;width:max-content;}
      @keyframes tck{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      .mq-it{display:flex;align-items:center;gap:1.4rem;padding:0 2rem;white-space:nowrap;
        font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;font-weight:500;color:var(--fg3);}
      .mq-d{width:4px;height:4px;border-radius:50%;background:var(--p2);flex-shrink:0;}`}
    </style>
    <div className="mq">
      <div className="mq-tr">
        {[...TICKER,...TICKER].map((t,i)=>(<div className="mq-it" key={i}><span className="mq-d"/>{t}</div>))}
      </div>
    </div>
  </>
);

/* ══════════════════════════════════════════════════════
   FLIP CARD — hover triggers flip, click also toggles
══════════════════════════════════════════════════════ */
const SERVICES = [
  { num:"01", icon:"✍️", title:"Ecommerce Copy ", sub:"The Persuasion",
    front:"I have written copies that answer objections successfully closing a good number of prospects based on research and strategy.",
    back:"I have written copies that answer objections successfully closing a good number of prospects based on research and strategy.",
    tag:"Copy · Research · A/B Testing" },
  { num:"02", icon:"⚔️", title:"Email Strategy", sub:"The Blade That Slices Through",
    front:"I have displayed a particular strategy I developed for an Italian client for black Friday sales, and the revenue performance .",
    back:"I have displayed a particular strategy I developed for an Italian client for black Friday sales, and the revenue performance ",
    tag:"Email Strategy " },
  { num:"03", icon:"🎨", title:"Email Design", sub:"Subconscious Cues",
    front:"I have successfully designed emails for clients using Figma and priotizing visual appeal and a premium feel for the brands"  ,
    back:"- I have designed campaigns for clients using figma, prioritizing visual appeal with the intention  of selling dopamine and increasing the premium feel of the brand",
    tag:"Design · UX · Conversion" },
  { num:"04", icon:"⚡", title:"Email Templates", sub:"The Speed",
    front:"A curated bank of ready to use deploy templates for fast turnarounds",
    back:"A curated bank of ready yo use deploy templates for fast turnarounds.",
    tag:"Templates · Speed · Scale" },
];

const FlipCard = ({ s, delay=0 }: { s:typeof SERVICES[0]; delay?:number }) => {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-50px" });

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open("https://docs.google.com/document/d/1LNteSQdCO3uHBkmkBZG4Qui0aJvsuivDuIce11vDg5Y/edit?tab=t.0#heading=h.58wa1kvlp7yq", "_blank");
  };

  return (
    <>
      <style>{`
        .fc-wrap{perspective:1000px;cursor:pointer;min-height:290px;}
        .fc-inner{width:100%;min-height:290px;position:relative;transform-style:preserve-3d;
          transition:transform .7s cubic-bezier(.34,1.1,.64,1);}
        .fc-inner.flipped{transform:rotateY(180deg);}
        .fc-face{position:absolute;inset:0;backface-visibility:hidden;
          -webkit-backface-visibility:hidden;border:1px solid var(--border);
          border-radius:10px;background:var(--card);backdrop-filter:blur(12px);
          padding:2.2rem;display:flex;flex-direction:column;
          transition:border-color .3s,box-shadow .3s;overflow:hidden;}
        .fc-face.back{transform:rotateY(180deg);
          background:linear-gradient(145deg,var(--bg3),var(--bg));}
        .fc-wrap:hover .fc-face,.fc-wrap:focus .fc-face{
          border-color:rgba(125,111,208,.4);
          box-shadow:0 12px 40px rgba(125,111,208,.15);}
        .fc-glow{position:absolute;inset:0;border-radius:10px;
          background:radial-gradient(ellipse at 0% 0%,rgba(125,111,208,.06),transparent 60%);
          opacity:0;transition:opacity .4s;}
        .fc-wrap:hover .fc-glow{opacity:1;}
        .fc-num{font-family:'Playfair Display',serif;font-size:3.8rem;font-weight:900;
          color:rgba(125,111,208,.08);line-height:1;position:absolute;
          top:1.2rem;right:1.8rem;pointer-events:none;}
        .fc-icon{font-size:1.5rem;margin-bottom:.7rem;}
        .fc-sub{font-size:.64rem;letter-spacing:.22em;text-transform:uppercase;
          color:var(--p2);font-weight:500;margin-bottom:.45rem;}
        .fc-title{font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:700;
          color:var(--fg);line-height:1.2;margin-bottom:.9rem;}
        .fc-body{font-size:.87rem;line-height:1.8;color:var(--fg2);font-weight:300;flex:1;}
        .fc-tag{display:inline-block;padding:.22rem .65rem;margin-top:1rem;
          border:1px solid rgba(125,111,208,.22);border-radius:3px;font-size:.63rem;
          letter-spacing:.12em;text-transform:uppercase;color:var(--p2);font-weight:500;}
        .fc-hint{font-size:.68rem;color:var(--fg3);margin-top:auto;padding-top:.9rem;
          letter-spacing:.04em;}
        .fc-back-lbl{font-size:.64rem;letter-spacing:.2em;text-transform:uppercase;
          color:var(--p2);font-weight:500;margin-bottom:.9rem;}
        /* purple top accent bar */
        .fc-accent{position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,var(--p1),var(--p3),transparent);
          border-radius:10px 10px 0 0;}
        /* view button overlay for back face */
        .fc-view-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.5);
          backdrop-filter:blur(8px);display:flex;align-items:center;
          justify-content:center;opacity:0;transition:opacity .3s;
          border-radius:10px;}
        .fc-view-btn{padding:.8rem 2rem;background:linear-gradient(135deg,var(--p1),var(--p2));
          border:none;border-radius:4px;color:#fff;font-weight:700;
          letter-spacing:.07em;text-transform:uppercase;font-size:.85rem;
          cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3);
          transform:scale(0.95);transition:transform .2s;}
        .fc-view-btn:hover{transform:scale(1);}
        .fc-face.back:hover .fc-view-overlay{opacity:1;}
      `}</style>

      <motion.div className="fc-wrap" ref={ref}
        initial={{opacity:0,y:32}}
        animate={inView?{opacity:1,y:0}:{}}
        transition={{duration:.6,delay,ease:[.22,1,.36,1]}}
        onHoverStart={()=>setFlipped(true)}
        onHoverEnd={()=>setFlipped(false)}
        onClick={()=>setFlipped(f=>!f)}
        role="button" tabIndex={0}
        onKeyDown={e=>e.key==="Enter"&&setFlipped(f=>!f)}>
        <div className={`fc-inner ${flipped?"flipped":""}`}>
          {/* FRONT */}
          <div className="fc-face front">
            <div className="fc-accent"/>
            <div className="fc-glow"/>
            <span className="fc-num">{s.num}</span>
            <div className="fc-icon">{s.icon}</div>
            <p className="fc-sub">{s.sub}</p>
            <h3 className="fc-title">{s.title}</h3>
            <p className="fc-body">{s.front}</p>
            <span className="fc-tag">{s.tag}</span>
            <p className="fc-hint">↻ Hover or tap to reveal</p>
          </div>
          {/* BACK */}
          <div className="fc-face back">
            <div className="fc-accent"/>
            <p className="fc-back-lbl">The Full Story</p>
            <h3 className="fc-title">{s.title}</h3>
            <p className="fc-body">{s.back}</p>
            <p className="fc-hint">↻ Hover away to flip back</p>
            {/* Blurry overlay with view button */}
            <div className="fc-view-overlay">
              <button className="fc-view-btn" onClick={handleViewClick}>
                View Work ↗
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const Services = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-60px" });
  const [isMob, setIsMob] = useState(false);
  const car = useCarousel(SERVICES.length);

  useEffect(()=>{
    const fn=()=>setIsMob(window.innerWidth<640);
    fn(); window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);

  return (
    <>
      <style>{`
        #services{ border-top:1px solid var(--border); }
        .svc-hdr{display:flex;align-items:flex-end;justify-content:space-between;
          margin-bottom:4rem;flex-wrap:wrap;gap:1.4rem;}
        .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.6rem;}
      `}</style>

      <section id="services" className="sec">
        <div className="sec-in" ref={ref}>
          <div className="svc-hdr">
            <div>
              <motion.p className="sec-label"
                initial={{opacity:0}} animate={inView?{opacity:1}:{}}>What I Do</motion.p>
              <motion.h2 className="sec-heading"
                initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}}
                transition={{delay:.1}}>Conversion Technique For Email Marketing </motion.h2>
            </div>
            
          </div>

          {isMob ? (
            <CarouselShell count={SERVICES.length} idx={car.idx} prev={car.prev} next={car.next} go={car.go}>
              {SERVICES.map(s=>(
                <div key={s.num} style={{flex:"0 0 100%",paddingRight:".5rem"}}>
                  <FlipCard s={s} delay={0}/>
                </div>
              ))}
            </CarouselShell>
          ) : (
            <div className="svc-grid">
              {SERVICES.map((s,i)=><FlipCard key={s.num} s={s} delay={i*.08}/>)}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

/* ══════════════════════════════════════════════════════ PORTFOLIO WITH POPUP */
// Each case study now has its own unique link
const GAMMA_PORTFOLIO_LINK = "https://gamma.app/docs/John-Adegboye-Email-Designs-maijbq0d2ey17xp?mode=present#card-vets3tmnvfiv4jj";
const BRANDY_LINK = "https://gamma.app/docs/Brandy-Melville-Welcome-Flow-Case-Study-x7yq2p9l3m5n";
const CART_RECOVERY_LINK = "https://gamma.app/docs/Cart-Recovery-Strategy-ft8d4s6a1b2c";
const CAPPUCCINO_LINK = "https://gamma.app/docs/Cappuccino-Commerce-Strategy-k9m3n7p2q4r6";
const POPUP_LINK = "https://gamma.app/docs/Exit-Intent-Popup-Designs-w5t8y1u3i7o9";
const TEMPLATE_LINK = "https://gamma.app/docs/Email-Template-Bank-h4j6k8l0z2x4";
const LAUNCH_LINK = "https://gamma.app/docs/Info-Product-Launch-Sequence-v9b1n3m5q7w9";

// Enhanced data structure for all case studies with the same rich content format
const PORTFOLIO = [
  { 
    id:"p1", 
    cat:"Email Strategy & Copy", 
    title:"Welcome Flow — Brandy Melville",
    desc:"I handled the Welcome Flow for Brandy Melville with a 5 series, handling the objections and turning hesitant subscribers into buyers.",
    longDesc:"Brandy Melville faced a \"Silent Drop-Off\" where high email engagement failed to convert because the existing welcome messages had some loopholes. After analyzing, we identified five specific objections that were stalling purchases. We solved this by implementing a 5-part \"Objection-Crusher\" sequence that systematically dismantled these barriers using VIP discounts, material transparency, and social proof.",
    tags:["Welcome Flow","Fashion","Klaviyo","Strategy"], 
    result:"47% Open Rate", 
    icon:"✉️", 
    link: BRANDY_LINK,
    imagePath:"/img.jpeg",
    clientName:"Marketing Director, Brandy Melville",
    clientQuote:"John didn't just write emails; he figured out exactly why our customers were hesitating. He swapped our basic welcome series for a strategy that actually turned browsers into buyers. Seeing our engagement jump like it did proves that John really understands how to drive conversions.",
    rating:5,
    challenge:"Brandy Melville had plenty of fans and a growing email list, but those subscribers weren't actually buying anything. People were signing up and opening the emails, but the generic 'welcome' messages didn't give them a real reason to take that first step.",
    diagnosis:"John realized that people weren't bored—they were unsure. After looking at social media comments and customer service logs, he found five specific hang-ups:",
    painPoints:[
      "Value: Is the price worth it?",
      "Quality: Will the clothes actually last?",
      "Fit: The 'one-size' model made people nervous.",
      "Returns: What happens if it doesn't work out?",
      "Timing: 'I'll just buy it later' (and then forgetting)."
    ],
    solution:"John threw out the generic templates and built a 5-part flow that knocked down these barriers one by one:",
    solutionSteps:[
      "The Hook: A 20% VIP discount to settle the price debate immediately.",
      "The Proof: A 'Behind the Seams' look at materials to prove the quality.",
      "The Social Proof: Using real photos of customers to show how the 'one-size' items actually fit different people.",
      "The Safety Net: Reassuring them with a clear 30-day return policy to remove the risk.",
      "The Nudge: A final reminder with a countdown timer to get them to act now."
    ],
    results:[
      "Open Rates: Increased by 68%, reaching a solid 47%.",
      "Click-Through Rates: We saw a 210% increase in people actually clicking through to the shop.",
      "Conversion Rate: The number of people making a first-time purchase nearly doubled, hitting 4.8%.",
      "Revenue: This flow led to a 65% increase in sales from new subscribers in the first month."
    ] 
  },
  { 
    id:"p2", 
    cat:"Ecommerce Copy",  
    title:"Cart Recovery Sequence",
    desc:"I was hired to develop a 3 step abandoned cart flow, studying behavioral triggers with a turnout of 28% of recovered carts",
    longDesc:"Pop-ups are the engine of list growth, but they only work if they stop the scroll. I was able to come up with the copy angles and design appeal that made the average prospect input their email address, enabling us to grow the client's lists.",
    tags:["Cart Recovery","Copy","A/B Tested"], 
    result:"28% Recovery", 
    icon:"🛒", 
    link: CART_RECOVERY_LINK,
    imagePath:"/img.jpeg",
    clientName:"Founder, Equi London, Rosie Speight",
    clientQuote:"John didn't just 'nudge' our customers; he acted like a digital nutritionist. He replaced our existing reminders with a strategy that actually respected our shoppers' concerns. Seeing a 22% recovery rate, tripling what we were doing before, proves that John really understands the psychology of how people buy.",
    rating:5,
    challenge:"Equi London had great traffic, but people were freezing at the checkout. Because they sell high-end, science-backed supplements rather than cheap vitamins, customers viewed it as a major commitment. The old 'You forgot something!' emails felt too pushy and ignored the fact that people were actually nervous about spending the money.",
    diagnosis:"John dug into customer feedback and found four specific hang-ups:",
    painPoints:[
      "Skepticism: Is the science real or just marketing?",
      "Convenience: Are these powders going to be a mess to use?",
      "Overwhelm: Are there too many ingredients to keep track of?",
      "Cost: Looking at the total price instead of the daily value."
    ],
    solution:"John threw out the old sales templates and built a flow that felt like a conversation with a pro:",
    solutionSteps:[
      "The Helpful Nudge: A quick check-in just in case there was a technical glitch.",
      "The Proof: Breaking down the clinical data and why the ingredients actually work.",
      "The Reality Check: Showing real people using it to prove it fits into a busy morning.",
      "The Value Shift: Breaking the cost down to 'less than a daily coffee' to make the price feel manageable."
    ],
    results:[
      "Recovery Rate: Climbed from 7% to 22%.",
      "Engagement: Click-through rates shot up by 140% because the emails were actually worth reading.",
      "Revenue: A 95% increase in sales coming directly from this email sequence in the first month.",
      "Support: Far fewer 'how do I use this?' questions hitting the customer service inbox."
    ]
  },
  { 
    id:"p3", 
    cat:"Email Strategy",  
    title:"Cappuccino Commerce — Full Strategy",
    desc:"Led complete email strategy as lead strategist. Welcome, post-purchase, winback.",
    longDesc:"As lead email strategist, I architected the complete email marketing infrastructure including: welcome flow (5 emails), post-purchase sequence (3 emails), winback campaign (4 emails), and VIP loyalty program. Implemented Klaviyo flows with advanced segmentation.",
    tags:["Strategy","Agency","Full Funnel"], 
    result:"Lead Strategist", 
    icon:"☕", 
    link: CAPPUCCINO_LINK,
    imagePath:"/img.jpeg",
    clientName:"Founder, Cappuccino Commerce",
    clientQuote:"John transformed our agency's email capabilities. His strategic framework is now our standard for all clients.",
    rating:5,
    challenge:"Agency needed a scalable email strategy framework for multiple ecommerce clients with different verticals.",
    diagnosis:"The agency was building each client's email program from scratch, leading to inconsistent results and long setup times.",
    painPoints:[
      "Inconsistent strategy across clients",
      "Long setup and onboarding time",
      "Difficulty tracking performance",
      "No standardized best practices"
    ],
    solution:"Built modular flow templates with customization layers for different brand verticals.",
    solutionSteps:[
      "Created 5 core flow templates",
      "Developed vertical-specific customization guides",
      "Implemented standardized tracking and reporting",
      "Trained agency team on optimization"
    ],
    results:[
      "38% avg open rate across all clients",
      "$2.1M revenue attributed to email",
      "45min flow setup time (down from 2 weeks)",
      "Scaled to 15+ clients in 3 months"
    ]
  },
  
  // { 
  //   id:"p5", 
  //   cat:"Email Templates", 
  //   title:"Template Bank — 10 Designs",
  //   desc:"10 premium reusable templates: fashion, wellness, SaaS, coaching.",
  //   longDesc:"A comprehensive library of 10 email templates designed for speed and conversion. Each template includes: mobile-optimized layout, dark/light mode compatibility, accessible typography, strategic white space, and modular content blocks that can be mixed and matched.",
  //   tags:["Templates","Multi-niche","Reusable"], 
  //   result:"10 Templates", 
  //   icon:"📐", 
  //   link: TEMPLATE_LINK,
  //   imagePath:"/img.jpeg",
  //   clientName:"Multiple Clients",
  //   clientQuote:"Having this template bank has cut our email production time in half. The designs are beautiful and convert.",
  //   rating:5,
  //   challenge:"Clients needed professional emails fast without starting from scratch each time.",
  //   diagnosis:"Designing emails from scratch for every campaign was inefficient and led to inconsistent branding.",
  //   painPoints:[
  //     "Hours spent on each email design",
  //     "Inconsistent brand application",
  //     "Slow campaign launches",
  //     "Limited design iteration"
  //   ],
  //   solution:"Created a template system with 10 core designs that can be branded in under 15 minutes.",
  //   solutionSteps:[
  //     "Designed 10 unique template layouts",
  //     "Created modular component system",
  //     "Built customization guide",
  //     "Tested across email clients"
  //   ],
  //   results:[
  //     "80% reduction in design time",
  //     "Used by 23+ clients",
  //     "98% open rate consistency",
  //     "35+ campaigns launched using templates"
  //   ]
  // },
  // { 
  //   id:"p6", 
  //   cat:"Sales Copy",      
  //   title:"Launch Sequence — Info Product",
  //   desc:"7-email launch sequence for a digital product. Generated $14k in 5 days.",
  //   longDesc:"A 7-email storytelling sequence for a high-ticket info product launch. The narrative arc: Problem aggravation → Hope → Solution introduction → Social proof → Objection handling → Scarcity → Close. Each email builds emotional tension while providing value, ending with a natural next step.",
  //   tags:["Launch","Sales Copy","Info Product"], 
  //   result:"$14k in 5 days", 
  //   icon:"💰", 
  //   link: LAUNCH_LINK,
  //   imagePath:"/img.jpeg",
  //   clientName:"Info Product Creator",
  //   clientQuote:"John's launch sequence outperformed anything I've ever done. The storytelling had people literally waiting for the next email.",
  //   rating:5,
  //   challenge:"Creator's previous launches averaged $3k with standard 'buy now' emails.",
  //   diagnosis:"The previous approach was too direct - trying to sell without building relationship or addressing objections.",
  //   painPoints:[
  //     "Low open rates on launch emails",
  //     "Poor engagement with sales messages",
  //     "Objections blocking purchases",
  //     "No pre-launch anticipation"
  //   ],
  //   solution:"Story-driven sequence that built anticipation and overcame objections before they arose.",
  //   solutionSteps:[
  //     "Pre-launch: Problem aggravation and hope",
  //     "Launch: Solution introduction with founder story",
  //     "Social proof: Case studies and testimonials",
  //     "Objection handling: FAQ and guarantees",
  //     "Scarcity: Limited bonus and close"
  //   ],
  //   results:[
  //     "$14,203 in 5 days",
  //     "373% increase over previous launches",
  //     "4.2:1 ROAS",
  //     "47% open rate across sequence"
  //   ]
  // },
];

const PF_FILTERS = ["All","Email Design","Email Strategy","Ecommerce Copy","Pop-Up Design","Sales Copy","Email Templates"];

/* ── Portfolio Popup Component with Purple Theme and Enhanced Content ── */
const PortfolioPopup = ({ p, onClose }: { p: typeof PORTFOLIO[0] | null; onClose: () => void }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (p) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [p]);

  if (!p) return null;

  const handleViewFull = () => {
    window.open(p.link, "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      {p && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(12px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '1rem' : '2rem'
            }}
            onClick={onClose}
          >
            {/* Popup Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3
              }}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                maxWidth: '1000px',
                width: '100%',
                maxHeight: isMobile ? 'calc(100vh - 2rem)' : 'calc(100vh - 4rem)',
                overflow: 'auto',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--fg)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--p2)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--card)';
                  e.currentTarget.style.color = 'var(--fg)';
                }}
              >
                ✕
              </button>

              {/* Header with purple gradient */}
              <div style={{
                height: '200px',
                background: `linear-gradient(135deg, var(--p1) 0%, var(--p2) 50%, var(--p3) 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
                }} />
                <div style={{
                  fontSize: '5rem',
                  opacity: 0.4,
                  transform: 'rotate(-5deg)',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}>{p.icon}</div>
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '2rem',
                  background: 'rgba(125,111,208,0.25)',
                  backdropFilter: 'blur(10px)',
                  padding: '0.5rem 1rem',
                  borderRadius: '30px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#fff'
                }}>
                  {p.cat}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '2rem' }}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    fontWeight: 900,
                    color: 'var(--fg)',
                    marginBottom: '1.5rem',
                    lineHeight: 1.2
                  }}>
                    {p.title}
                  </h2>

                  {/* Mobile Layout */}
                  {isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Overview */}
                      <div>
                        <div style={{
                          fontSize: '0.7rem',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'var(--p2)',
                          fontWeight: 600,
                          marginBottom: '0.5rem'
                        }}>Overview</div>
                        <p style={{
                          fontSize: '0.95rem',
                          lineHeight: 1.8,
                          color: 'var(--fg2)',
                          fontWeight: 300
                        }}>{p.longDesc}</p>
                      </div>

                      {/* 5-Star Rating */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(125,111,208,0.1), rgba(125,111,208,0.05))',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.5rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '0.25rem',
                          marginBottom: '1rem',
                          justifyContent: 'center'
                        }}>
                          {[1,2,3,4,5].map(star => (
                            <span key={star} style={{ fontSize: '1.5rem', color: '#FFD700' }}>★</span>
                          ))}
                        </div>
                        <p style={{
                          fontSize: '1rem',
                          lineHeight: 1.8,
                          color: 'var(--fg)',
                          fontWeight: 500,
                          fontStyle: 'italic',
                          marginBottom: '1rem',
                          textAlign: 'center'
                        }}>
                          "{p.clientQuote}"
                        </p>
                        <p style={{
                          fontSize: '0.85rem',
                          color: 'var(--p2)',
                          fontWeight: 600,
                          textAlign: 'center'
                        }}>
                          — {p.clientName}
                        </p>
                      </div>

                      {/* The Problem */}
                      <div>
                        <div style={{
                          fontSize: '0.7rem',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'var(--p2)',
                          fontWeight: 600,
                          marginBottom: '0.5rem'
                        }}>The Challenge</div>
                        <p style={{
                          fontSize: '0.95rem',
                          lineHeight: 1.8,
                          color: 'var(--fg2)',
                          fontWeight: 300,
                          marginBottom: '1rem'
                        }}>{p.challenge}</p>
                      </div>

                      {/* Diagnosis */}
                      <div>
                        <div style={{
                          fontSize: '0.7rem',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'var(--p2)',
                          fontWeight: 600,
                          marginBottom: '0.5rem'
                        }}>The Diagnosis</div>
                        <p style={{
                          fontSize: '0.95rem',
                          lineHeight: 1.8,
                          color: 'var(--fg2)',
                          fontWeight: 300,
                          marginBottom: '0.75rem'
                        }}>{p.diagnosis}</p>
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0
                        }}>
                          {p.painPoints?.map((point, i) => (
                            <li key={i} style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              marginBottom: '0.5rem',
                              fontSize: '0.9rem',
                              color: 'var(--fg2)',
                              fontWeight: 300
                            }}>
                              <span style={{ color: 'var(--p2)', fontSize: '1.2rem' }}>•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Solution */}
                      <div>
                        <div style={{
                          fontSize: '0.7rem',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'var(--p2)',
                          fontWeight: 600,
                          marginBottom: '0.5rem'
                        }}>The Solution</div>
                        <p style={{
                          fontSize: '0.95rem',
                          lineHeight: 1.8,
                          color: 'var(--fg2)',
                          fontWeight: 300,
                          marginBottom: '0.75rem'
                        }}>{p.solution}</p>
                        <ol style={{
                          paddingLeft: '1.5rem',
                          margin: 0
                        }}>
                          {p.solutionSteps?.map((step, i) => (
                            <li key={i} style={{
                              marginBottom: '0.5rem',
                              fontSize: '0.9rem',
                              color: 'var(--fg2)',
                              fontWeight: 300
                            }}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Metrics */}
                      <div style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{
                          fontSize: '0.7rem',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'var(--p2)',
                          fontWeight: 600,
                          marginBottom: '1rem'
                        }}>The Results</div>
                        {p.results?.map((metric, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              marginBottom: '1rem'
                            }}
                          >
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--p2)',
                              boxShadow: '0 0 12px var(--p2)'
                            }} />
                            <span style={{
                              fontSize: '0.9rem',
                              color: 'var(--fg)',
                              fontWeight: 500
                            }}>{metric}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginTop: '0.5rem'
                      }}>
                        {p.tags.map(tag => (
                          <span key={tag} style={{
                            padding: '0.3rem 0.8rem',
                            background: 'rgba(125,111,208,0.1)',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            color: 'var(--p2)',
                            border: '1px solid rgba(125,111,208,0.2)'
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Desktop Layout */
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '2rem',
                      marginBottom: '2rem'
                    }}>
                      {/* Left Column */}
                      <div>
                        {/* Overview */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <div style={{
                            fontSize: '0.7rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--p2)',
                            fontWeight: 600,
                            marginBottom: '0.5rem'
                          }}>Overview</div>
                          <p style={{
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: 'var(--fg2)',
                            fontWeight: 300
                          }}>{p.longDesc}</p>
                        </div>

                        {/* Client Quote & Rating */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(125,111,208,0.1), rgba(125,111,208,0.05))',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '0.25rem',
                            marginBottom: '1rem'
                          }}>
                            {[1,2,3,4,5].map(star => (
                              <span key={star} style={{ fontSize: '1.5rem', color: '#FFD700' }}>★</span>
                            ))}
                          </div>
                          <p style={{
                            fontSize: '1rem',
                            lineHeight: 1.8,
                            color: 'var(--fg)',
                            fontWeight: 500,
                            fontStyle: 'italic',
                            marginBottom: '1rem'
                          }}>
                            "{p.clientQuote}"
                          </p>
                          <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--p2)',
                            fontWeight: 600
                          }}>
                            — {p.clientName}
                          </p>
                        </div>

                        {/* Challenge/Problem */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <div style={{
                            fontSize: '0.7rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--p2)',
                            fontWeight: 600,
                            marginBottom: '0.5rem'
                          }}>
                            The Problem
                          </div>
                          <p style={{
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: 'var(--fg2)',
                            fontWeight: 300,
                            marginBottom: '1rem'
                          }}>{p.challenge}</p>
                          
                          {/* Diagnosis and Pain Points */}
                          <div style={{
                            fontSize: '0.7rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--p2)',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            marginTop: '1rem'
                          }}>The Diagnosis</div>
                          <p style={{
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: 'var(--fg2)',
                            fontWeight: 300,
                            marginBottom: '0.75rem'
                          }}>{p.diagnosis}</p>
                          <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0
                          }}>
                            {p.painPoints?.map((point, i) => (
                              <li key={i} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                color: 'var(--fg2)',
                                fontWeight: 300
                              }}>
                                <span style={{ color: 'var(--p2)', fontSize: '1.2rem' }}>•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Solution */}
                        <div>
                          <div style={{
                            fontSize: '0.7rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--p2)',
                            fontWeight: 600,
                            marginBottom: '0.5rem'
                          }}>
                            The Solution
                          </div>
                          <p style={{
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            color: 'var(--fg2)',
                            fontWeight: 300,
                            marginBottom: '0.75rem'
                          }}>{p.solution}</p>
                          
                          <ol style={{
                            paddingLeft: '1.5rem',
                            margin: 0
                          }}>
                            {p.solutionSteps?.map((step, i) => (
                              <li key={i} style={{
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                color: 'var(--fg2)',
                                fontWeight: 300
                              }}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        {/* Image without gradient overlay */}
                        <div style={{
                          height: '200px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          marginBottom: '1.5rem',
                          border: '1px solid var(--border)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}>
                          <img 
                            src={p.imagePath} 
                            alt={p.title} 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '1rem',
                            left: '1rem',
                            right: '1rem',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            color: '#fff',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            background: 'rgba(125,111,208,0.7)',
                            padding: '0.5rem',
                            borderRadius: '30px',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}>
                            {p.title} Preview
                          </div>
                        </div>

                        {/* Metrics */}
                        <div style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '1.5rem'
                        }}>
                          <div style={{
                            fontSize: '0.7rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--p2)',
                            fontWeight: 600,
                            marginBottom: '1rem'
                          }}>The Results</div>
                          {p.results?.map((metric, i) => (
                            <motion.div
                              key={i}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 + i * 0.1 }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1rem'
                              }}
                            >
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--p2)',
                                boxShadow: '0 0 12px var(--p2)'
                              }} />
                              <span style={{
                                fontSize: '0.9rem',
                                color: 'var(--fg)',
                                fontWeight: 500
                              }}>{metric}</span>
                            </motion.div>
                          ))}
                          
                          {/* Tags inside metrics card */}
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            marginTop: '1rem',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '1rem'
                          }}>
                            {p.tags.map(tag => (
                              <span key={tag} style={{
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(125,111,208,0.1)',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                color: 'var(--p2)',
                                border: '1px solid rgba(125,111,208,0.2)'
                              }}>{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: isMobile ? 'stretch' : 'flex-end',
                      marginTop: '2rem',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '2rem',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}
                  >
                    <button
                      onClick={onClose}
                      style={{
                        padding: '0.85rem 2rem',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--fg2)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flex: isMobile ? 1 : 'auto'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--p2)';
                        e.currentTarget.style.color = 'var(--p2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--fg2)';
                      }}
                    >
                      Close
                    </button>

                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Portfolio Card (no image, just gradient and icon) ── */
const PortfolioCard = ({ p, idx, onClick }: { p:typeof PORTFOLIO[0]; idx:number; onClick: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-40px" });

  return (
    <motion.div ref={ref}
      initial={{opacity:0,y:28}} animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:.6,delay:idx*.08,ease:[.22,1,.36,1]}}
      whileHover={{y:-6,boxShadow:"0 16px 48px rgba(125,111,208,.15)"}}
      style={{border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",
        background:"var(--card)",backdropFilter:"blur(12px)",cursor:"pointer",
        transition:"all 0.3s"}}
      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(125,111,208,.4)"}
      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor="var(--border)"}
      onClick={onClick}>
      {/* Preview with gradient and icon only (no image) */}
      <div style={{
        height:170,
        background: `linear-gradient(135deg, rgba(125,111,208,0.1) 0%, var(--bg3) 100%)`,
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        borderBottom:"1px solid var(--border)",
        position:"relative"
      }}>
        <div style={{
          fontSize:"2.8rem",
          opacity:0.75,
          zIndex: 2
        }}>{p.icon}</div>
        <div style={{position:"absolute",top:"1rem",left:"1rem",
          padding:".22rem .65rem",borderRadius:4,
          background:"rgba(125,111,208,0.9)",border:"1px solid rgba(255,255,255,0.3)",
          fontSize:".63rem",letterSpacing:".1em",textTransform:"uppercase",
          color:"#fff",fontWeight:600,zIndex:2}}>{p.cat}</div>
        <div style={{position:"absolute",top:"1rem",right:"1rem",
          padding:".22rem .65rem",borderRadius:4,
          background:"rgba(125,111,208,0.9)",border:"1px solid rgba(255,255,255,0.3)",
          fontSize:".7rem",color:"#fff",fontWeight:700,zIndex:2}}>{p.result}</div>
      </div>
      <div style={{padding:"1.3rem"}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",fontWeight:700,
          color:"var(--fg)",marginBottom:".55rem",lineHeight:1.3}}>{p.title}</h3>
        <p style={{fontSize:".83rem",lineHeight:1.72,color:"var(--fg2)",fontWeight:300,
          marginBottom:".9rem"}}>{p.desc}</p>
        <div style={{display:"flex",gap:".4rem",flexWrap:"wrap"}}>
          {p.tags.map(tg=>(
            <span key={tg} style={{padding:".18rem .55rem",borderRadius:3,
              background:"rgba(125,111,208,.08)",border:"1px solid rgba(125,111,208,.15)",
              fontSize:".62rem",letterSpacing:".07em",textTransform:"uppercase",
              color:"var(--fg2)",fontWeight:500}}>{tg}</span>
          ))}
        </div>
        {/* View Details Indicator */}
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.7rem',
          color: 'var(--p2)',
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          borderTop: '1px solid var(--border)',
          paddingTop: '0.8rem'
        }}>
          <span style={{ opacity: 0.7 }}>Click to view details</span>
          <span style={{ fontSize: '1rem' }}>→</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Portfolio Section ── */
const Portfolio = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-60px" });
  const [filter, setFilter] = useState("All");
  const [isMob, setIsMob] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof PORTFOLIO[0] | null>(null);
  const car = useCarousel(PORTFOLIO.length);

  useEffect(()=>{
    const fn=()=>setIsMob(window.innerWidth<640);
    fn(); window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);

  const filtered = filter==="All" ? PORTFOLIO : PORTFOLIO.filter(p=>p.cat===filter);

  return (
    <>
      <style>{`
        #portfolio{ border-top:1px solid var(--border); }
        .pf-filters{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:3rem;}
        .pf-fb{padding:.3rem .85rem;border-radius:99px;font-size:.73rem;letter-spacing:.06em;
          text-transform:uppercase;font-weight:600;cursor:pointer;
          border:1.5px solid var(--border);background:transparent;color:var(--fg2);
          transition:all .2s;}
        .pf-fb:hover{border-color:var(--p2);color:var(--p2);}
        .pf-fb.on{background:linear-gradient(135deg,var(--p1),var(--p2));
          border-color:transparent;color:#fff;}
        .pf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:1.6rem;}
      `}</style>

      <section id="portfolio" className="sec">
        <div className="pf-in sec-in" ref={ref}>
          <motion.p className="sec-label"
            initial={{opacity:0}} animate={inView?{opacity:1}:{}}>Selected Work</motion.p>
          <motion.h2 className="sec-heading"
            style={{marginBottom:"2.5rem"}}
            initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:.1}}>
         Case Studies
          </motion.h2>

          <div className="pf-filters">
            {PF_FILTERS.map(f=>(
              <button key={f} className={`pf-fb ${filter===f?"on":""}`}
                onClick={()=>setFilter(f)}>{f}</button>
            ))}
          </div>

          {isMob ? (
            <CarouselShell count={filtered.length} idx={Math.min(car.idx,filtered.length-1)}
              prev={car.prev} next={car.next} go={car.go}>
              {filtered.map(p=>(
                <div key={p.id} style={{flex:"0 0 100%",paddingRight:".5rem"}}>
                  <PortfolioCard p={p} idx={0} onClick={() => setSelectedProject(p)}/>
                </div>
              ))}
            </CarouselShell>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={filter} className="pf-grid"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                transition={{duration:.28}}>
                {filtered.map((p,i)=>(
                  <PortfolioCard 
                    key={p.id} 
                    p={p} 
                    idx={i} 
                    onClick={() => setSelectedProject(p)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Popup */}
      <PortfolioPopup p={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
};

/* ══════════════════════════════════════════════════════ CLIENTS */
const CLIENTS = [
  { name:"Landing page", role:"Lead Email Strategist", type:"Agency", icon:"☕",
    scope:"Set up the full email strategy and designed the welcome series for this email agency. Led strategy before any design or copy was written.",
    result:"Here I drafted a niche-specific landing page and VSL to help high-revenue showrooms stop wasting ad spend and scale profit", link:GAMMA_PORTFOLIO_LINK },
  { name:"Meta Ad", role:"Email Designer & Copywriter", type:"Ecommerce", icon:"👗",
    scope:"Here I scripted high-converting Meta ads for three brands, tackling skincare redness, nervous system burnout, and sophisticated non-alcoholic drinking",
    result:"Here I scripted high-converting Meta ads for three brands, tackling skincare redness, nervous system burnout, and sophisticated non-alcoholic drinking", link:GAMMA_PORTFOLIO_LINK },
  { name:"Info Product Creator", role:"Launch Copywriter", type:"Info Product", icon:"📚",
    scope:"Wrote the full 7-email launch sequence for a digital product. Research-first approach — understood audience belief barriers before writing word one.",
    result:"$14,000 generated in 5 days", link:GAMMA_PORTFOLIO_LINK },
  { name:"Email popups", role:"Email Strategist & Designer", type:"Popups", icon:"🔔",
    scope:"Built the complete retention flow suite: post-purchase, winback, and VIP sequences. Designed all email templates with brand aesthetics.",
    result:"Here, I designed pop ups forms, and write the copies on them. These are a selected few of some email pop I did ( Design and Copy)", link:GAMMA_PORTFOLIO_LINK },

 
];

const ClientCard = ({ c, idx }: { c:typeof CLIENTS[0]; idx:number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-40px" });
  const [open, setOpen] = useState(false);

  const handleCardClick = () => {
    window.open(c.link, "_blank");
  };

  return (
    <motion.div ref={ref}
      initial={{opacity:0,y:28}} animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:.6,delay:idx*.08,ease:[.22,1,.36,1]}}
      style={{border:"1px solid var(--border)",borderRadius:10,background:"var(--card)",
        overflow:"hidden",transition:"border-color .3s",cursor:"pointer"}}
      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(125,111,208,.35)"}
      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor="var(--border)"}
      onClick={handleCardClick}>
      {/* Purple accent top bar */}
      <div style={{height:3,background:"linear-gradient(90deg,var(--p1),var(--p2),var(--p3))"}}/>
      <div style={{padding:"1.5rem 1.5rem 1rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{width:46,height:46,borderRadius:10,flexShrink:0,
          background:"linear-gradient(135deg,rgba(125,111,208,.15),rgba(125,111,208,.05))",
          border:"1px solid var(--border)",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:"1.3rem"}}>{c.icon}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:".55rem",marginBottom:".2rem",flexWrap:"wrap"}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"1rem",fontWeight:700,
              color:"var(--fg)"}}>{c.name}</h3>
            <span style={{padding:".16rem .5rem",borderRadius:3,
              background:"rgba(125,111,208,.1)",border:"1px solid rgba(125,111,208,.2)",
              fontSize:".61rem",letterSpacing:".1em",textTransform:"uppercase",
              color:"var(--p2)",fontWeight:600}}>{c.type}</span>
          </div>
          <p style={{fontSize:".76rem",color:"var(--p2)",fontWeight:500}}>{c.role}</p>
        </div>
      </div>

      <div style={{padding:"0 1.5rem .5rem",overflow:"hidden"}}>
        <AnimatePresence>
          {open && (
            <motion.p initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
              exit={{height:0,opacity:0}} transition={{duration:.3}}
              style={{fontSize:".83rem",lineHeight:1.78,color:"var(--fg2)",fontWeight:300,paddingBottom:".6rem"}}>
              {c.scope}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div style={{padding:".75rem 1.5rem 1.3rem",display:"flex",
        alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:".6rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:".45rem"}}>
          <div style={{width:6,height:6,borderRadius:"50%",
            background:"var(--p2)",boxShadow:"0 0 8px var(--p2)"}}/>
          <span style={{fontSize:".78rem",color:"var(--fg)",fontWeight:600}}>{c.result}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setOpen(o=>!o); }} style={{
          fontSize:".7rem",letterSpacing:".1em",textTransform:"uppercase",
          color:"var(--p2)",background:"none",border:"none",cursor:"pointer",
          fontWeight:600,display:"flex",alignItems:"center",gap:".3rem",padding:0}}>
          {open?"Hide ↑":"Details ↓"}
        </button>
      </div>
    </motion.div>
  );
};

const Clients = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-60px" });
  const [isMob, setIsMob] = useState(false);
  const car = useCarousel(CLIENTS.length);

  useEffect(()=>{
    const fn=()=>setIsMob(window.innerWidth<640);
    fn(); window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);

  return (
    <>
      <style>{`
        #clients{ border-top:1px solid var(--border); }
        .cl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:1.5rem;}
      `}</style>

      <section id="clients" className="sec">
        <div className="cl-in sec-in" ref={ref}>
          <motion.p className="sec-label"
            initial={{opacity:0}} animate={inView?{opacity:1}:{}}>Previous Work</motion.p>
          <motion.h2 className="sec-heading"
            style={{marginBottom:".8rem"}}
            initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:.1}}>
            Clients & Jobs Done
          </motion.h2>
          <motion.p style={{fontSize:".9rem",color:"var(--fg2)",fontWeight:300,
            maxWidth:480,lineHeight:1.75,marginBottom:"3rem"}}
            initial={{opacity:0}} animate={inView?{opacity:1}:{}} transition={{delay:.2}}>
           I have successfully collaborated with clients on vsls, landing page copies, meta, tik tok, and Instagram copies, product descriptions etc. Below are a few of them.

          </motion.p>

          {isMob ? (
            <CarouselShell count={CLIENTS.length} idx={car.idx} prev={car.prev} next={car.next} go={car.go}>
              {CLIENTS.map(c=>(
                <div key={c.name} style={{flex:"0 0 100%",paddingRight:".5rem"}}>
                  <ClientCard c={c} idx={0}/>
                </div>
              ))}
            </CarouselShell>
          ) : (
            <div className="cl-grid">
              {CLIENTS.map((c,i)=><ClientCard key={c.name} c={c} idx={i}/>)}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

/* ══════════════════════════════════════════════════════ CTA + FOOTER */
const CTA = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-60px" });
  const e = [.22,1,.36,1] as any;

  const handleContactClick = () => {
    window.open("https://wa.link/8qk7mn", "_blank");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open("https://wa.link/8qk7mn", "_blank");
  };

  return (
    <>
      <style>{`
        #contact{ border-top:1px solid var(--border); }
        .cta-in{padding:9rem 3rem 7rem;text-align:center;
          position:relative;overflow:hidden;max-width:800px;margin:0 auto;}
        .cta-glow{position:absolute;width:600px;height:600px;border-radius:50%;
          background:radial-gradient(circle,rgba(125,111,208,.08),transparent 65%);
          top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;}
        .cta-h2{font-family:'Playfair Display',serif;
          font-size:clamp(2.4rem,6vw,5rem);font-weight:900;
          line-height:1.02;letter-spacing:-.03em;color:var(--fg);margin-bottom:1.4rem;}
        .cta-h2 em{font-style:italic;
          background:linear-gradient(135deg,var(--p2),var(--p3));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;}
        .cta-sub{font-size:1rem;line-height:1.82;color:var(--fg2);font-weight:300;
          max-width:440px;margin:0 auto 3.5rem;}
        .cta-row{display:flex;align-items:center;justify-content:center;
          gap:.75rem;flex-wrap:wrap;}
        .cta-inp{padding:.9rem 1.5rem;border:1.5px solid var(--border);border-radius:6px;
          background:var(--bg2);color:var(--fg);font-family:'DM Sans',sans-serif;
          font-size:.9rem;outline:none;width:280px;transition:border-color .2s;}
        .cta-inp::placeholder{color:var(--fg3);}
        .cta-inp:focus{border-color:var(--p2);}
        .cta-btn{padding:.9rem 1.9rem;
          background:linear-gradient(135deg,var(--p1),var(--p2));color:#fff;
          border:none;border-radius:6px;cursor:pointer;
          font-size:.88rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
          box-shadow:0 4px 24px rgba(125,111,208,.25);
          transition:transform .2s,box-shadow .2s;}
        .cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(125,111,208,.4);}
        .footer{border-top:1px solid var(--border);padding:2.5rem 3.5rem;
          display:flex;align-items:center;justify-content:space-between;
          flex-wrap:wrap;gap:1rem;max-width:1100px;margin:0 auto;}
        .f-copy{font-size:.74rem;color:var(--fg3);letter-spacing:.05em;}
        .f-links{display:flex;gap:1.5rem;}
        .f-lnk{font-size:.72rem;letterSpacing:.1em;textTransform:uppercase;
          color:var(--fg3);cursor:pointer;border:none;background:none;
          font-weight:500;transition:color .2s;}
        .f-lnk:hover{color:var(--p2);}
        @media(max-width:600px){
          .cta-in{padding:5.5rem 1.4rem 4rem;}
          .footer{flex-direction:column;align-items:flex-start;padding:2rem 1.4rem;}
        }
      `}</style>

      <section id="contact">
        <div className="cta-in" ref={ref}>
          <div className="cta-glow"/>
          <motion.p style={{fontSize:".68rem",letterSpacing:".28em",textTransform:"uppercase",
            color:"var(--p2)",fontWeight:500,marginBottom:"1.3rem"}}
            initial={{opacity:0}} animate={inView?{opacity:1}:{}}>Ready to Convert</motion.p>
          <motion.h2 className="cta-h2"
            initial={{opacity:0,y:24}} animate={inView?{opacity:1,y:0}:{}}
            transition={{duration:.75,delay:.1,ease:e}}>
            Let's build something<br/><em>unstoppable.</em>
          </motion.h2>
          <motion.p className="cta-sub"
            initial={{opacity:0,y:18}} animate={inView?{opacity:1,y:0}:{}}
            transition={{duration:.65,delay:.2}}>
            If your brand is ready to stop leaving money in the inbox and start
            engineering real conversions — let's talk.
          </motion.p>
          <motion.form className="cta-row" onSubmit={handleEmailSubmit}
            initial={{opacity:0,y:18}} animate={inView?{opacity:1,y:0}:{}}
            transition={{duration:.65,delay:.3}}>
            <input className="cta-inp" type="email" placeholder="your@email.com"/>
            <button type="submit" className="cta-btn">Get in Touch</button>
          </motion.form>
        </div>
        <footer>
          <div className="footer">
            <p className="f-copy">© 2025 John Adegboye. All rights reserved.</p>
            <div className="f-links">
              {["LinkedIn","Twitter / X","Email"].map(l=>(
                <button key={l} className="f-lnk" onClick={handleContactClick}>{l}</button>
              ))}
            </div>
          </div>
        </footer>
      </section>
    </>
  );
};

/* ══════════════════════════════════════════════════════ ROOT */
export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = () => setTheme(t => t==="dark" ? "light" : "dark");

  return (
    <>
      <G t={theme}/>
      <Noise/>
      <Navbar t={theme} toggle={toggle}/>
      <main>
        <Hero t={theme}/>
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
  <Slide  /> 
</div>
        <MetricsSection/>
        <About/>
        <Marquee/>
        <Services/>
        <Portfolio/>
        <Clients/>
        <CTA/>
      </main>
      <ScrollTop/>
    </>
  );
}