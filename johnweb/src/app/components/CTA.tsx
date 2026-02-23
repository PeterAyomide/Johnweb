// components/CTASection.tsx
"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    // Simulate success
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 3000);
  };

  const ease = [0.22, 1, 0.36, 1];

  return (
    <>
      <style jsx>{`
        .cta-wrap {
          padding: 5rem 1rem 4rem;
          text-align: center;
          position: relative;
          border-top: 1px solid var(--border);
          overflow: hidden;
          background: linear-gradient(180deg, transparent, rgba(139,92,246,0.02));
        }
        
        .cta-glow {
          position: absolute;
          width: min(600px, 90vw);
          height: min(600px, 90vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.1), transparent 65%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        
        .sec-label {
          font-size: 0.68rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--purple);
          font-weight: 500;
          margin-bottom: 1.4rem;
        }
        
        .cta-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 7vw, 4rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--parchment);
          margin-bottom: 1.2rem;
          padding: 0 1rem;
        }
        
        .cta-h2 em {
          font-style: italic;
          color: var(--purple);
        }
        
        .cta-sub {
          font-size: clamp(0.9rem, 2.5vw, 1rem);
          line-height: 1.7;
          color: var(--muted);
          font-weight: 300;
          max-width: 500px;
          margin: 0 auto 2rem;
          padding: 0 1rem;
        }
        
        .cta-form {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          max-width: 500px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .cta-field {
          flex: 1;
          min-width: 250px;
          padding: 0.85rem 1.4rem;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: rgba(139,92,246,0.04);
          color: var(--parchment);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .cta-field::placeholder {
          color: var(--muted);
          opacity: 0.6;
        }
        
        .cta-field:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        
        .cta-field.error {
          border-color: #ef4444;
        }
        
        .cta-submit {
          padding: 0.85rem 2rem;
          background: var(--purple);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          box-shadow: 0 4px 20px rgba(139,92,246,0.3);
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .cta-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(139,92,246,0.45);
        }
        
        .cta-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .status-message {
          margin-top: 1rem;
          font-size: 0.85rem;
          color: var(--purple);
          animation: fadeIn 0.3s ease;
        }
        
        .status-message.error {
          color: #ef4444;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .footer-bar {
          border-top: 1px solid var(--border);
          margin-top: 4rem;
          padding: 2rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .footer-copy {
          font-size: 0.76rem;
          color: var(--muted);
          letter-spacing: 0.05em;
        }
        
        .footer-links {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        
        .f-link {
          font-size: 0.74rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          cursor: pointer;
          border: none;
          background: none;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          transition: color 0.2s;
          padding: 0;
        }
        
        .f-link:hover {
          color: var(--purple);
        }

        .footer-social {
          display: flex;
          gap: 1rem;
        }

        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          transition: all 0.2s;
          cursor: pointer;
        }

        .social-icon:hover {
          border-color: var(--purple);
          color: var(--purple);
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .cta-wrap {
            padding: 4rem 1rem 3rem;
          }
          
          .footer-bar {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .footer-links {
            justify-content: center;
          }
        }
      `}</style>

      <section ref={ref}>
        <div className="cta-wrap">
          <div className="cta-glow" />
          
          <motion.p 
            className="sec-label"
            initial={{ opacity: 0 }} 
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            Ready to Convert
          </motion.p>

          <motion.h2 
            className="cta-h2"
            initial={{ opacity: 0, y: 30 }} 
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.1, ease }}
          >
            Let's build something<br />
            <em>unstoppable.</em>
          </motion.h2>

          <motion.p 
            className="cta-sub"
            initial={{ opacity: 0, y: 20 }} 
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.2 }}
          >
            Ready to stop leaving money in the inbox and start engineering real conversions? 
            Let's talk about your project.
          </motion.p>

          <motion.form 
            className="cta-form"
            initial={{ opacity: 0, y: 20 }} 
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.3 }}
            onSubmit={handleSubmit}
          >
            <input
              className={`cta-field ${status === "error" ? "error" : ""}`}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "success"}
              required
            />
            <button 
              className="cta-submit" 
              type="submit"
              disabled={status === "success"}
            >
              {status === "success" ? "✓ Sent!" : "Get in Touch"}
            </button>
          </motion.form>

          {status === "success" && (
            <motion.div 
              className="status-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Thanks! I'll get back to you within 24 hours.
            </motion.div>
          )}

          {status === "error" && (
            <motion.div 
              className="status-message error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Please enter a valid email address.
            </motion.div>
          )}
        </div>

        <footer>
          <div className="footer-bar">
            <p className="footer-copy">
              © 2025 John Adegboye. All rights reserved.
            </p>
            
            <div className="footer-links">
              <button className="f-link">Privacy</button>
              <button className="f-link">Terms</button>
              <button className="f-link">Cookies</button>
            </div>

            <div className="footer-social">
              <button className="social-icon" aria-label="LinkedIn">
                <span>in</span>
              </button>
              <button className="social-icon" aria-label="Twitter">
                <span>𝕏</span>
              </button>
              <button className="social-icon" aria-label="Email">
                <span>✉</span>
              </button>
            </div>
          </div>
        </footer>
      </section>
    </>
  );
}