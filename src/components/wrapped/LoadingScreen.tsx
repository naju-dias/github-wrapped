"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Repositórios encontrados", delay: 600 },
  { label: "Commits analisados", delay: 1300 },
  { label: "Linguagens catalogadas", delay: 2100 },
  { label: "Horários processados", delay: 2900 },
  { label: "Personalidade calculada", delay: 3600 },
];

const FINAL_MSG = "Gerando perfil de desenvolvedor...";

interface Props {
  onDone?: () => void;
}

export function LoadingScreen({ onDone }: Props) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showFinal, setShowFinal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      timers.push(
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, i]);
          setProgress(Math.round(((i + 1) / STEPS.length) * 90));
        }, step.delay)
      );
    });

    timers.push(
      setTimeout(() => {
        setShowFinal(true);
        setProgress(100);
      }, 4200)
    );

    if (onDone) {
      timers.push(
        setTimeout(() => {
          setExiting(true);
          setTimeout(onDone, 600);
        }, 5200)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className={`terminal-root ${exiting ? "exiting" : ""}`}>
      <div className="terminal-window">
        {/* Title bar */}
        <div className="terminal-titlebar">
          <div className="terminal-dots">
            <span className="dot dot--red" />
            <span className="dot dot--yellow" />
            <span className="dot dot--green" />
          </div>
          <span className="terminal-title">github-wrapped.exe</span>
        </div>

        {/* Body */}
        <div className="terminal-body">
          <p className="terminal-prompt">
            <span className="prompt-symbol">C:\&gt;</span> github-wrapped.exe --analyze
          </p>

          <div className="terminal-steps">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`terminal-step ${completedSteps.includes(i) ? "done" : "pending"}`}
              >
                <span className="step-icon">
                  {completedSteps.includes(i) ? "✓" : "·"}
                </span>
                <span className="step-label">{step.label}</span>
              </div>
            ))}
          </div>

          {showFinal && (
            <p className="terminal-final">
              <span className="prompt-symbol blink">_</span> {FINAL_MSG}
            </p>
          )}

          {/* Progress bar */}
          <div className="progress-wrap">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-pct">{progress}%</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jersey+10&family=Share+Tech+Mono&display=swap');

        body { background: #0a0614; margin: 0; }

        .terminal-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Share Tech Mono', 'Courier New', monospace;
          transition: opacity 0.6s ease, transform 0.6s ease;
          opacity: 1;
          transform: translateY(0);
        }

        .terminal-root.exiting {
          opacity: 0;
          transform: translateY(-24px);
        }

        /* ── Window ── */
        .terminal-window {
          width: min(520px, 90vw);
          background: #06030d;
          position: relative;
          box-shadow:
            0 -4px 0 0 #000,
            0 4px 0 0 #000,
            -4px 0 0 0 #000,
            4px 0 0 0 #000,
            6px 6px 0 0 #000,
            8px 8px 0 0 #000,
            10px 10px 0 0 #000,
            inset 0 0 0 2px #23c1ff,
            0 0 40px rgba(35,193,255,0.15);
        }

        .terminal-window::before {
          content: '';
          position: absolute;
          top: -4px; left: -4px;
          width: 4px; height: 4px;
          background: #0a0614;
          box-shadow:
            calc(100% + 4px) 0 0 0 #0a0614,
            0 calc(100% + 4px) 0 0 #0a0614,
            calc(100% + 4px) calc(100% + 4px) 0 0 #0a0614;
        }

        /* scanlines */
        .terminal-window::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.015) 0px,
            rgba(255,255,255,0.015) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
          z-index: 10;
        }

        /* ── Title bar ── */
        .terminal-titlebar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #0d0a1e;
          border-bottom: 1px solid #23c1ff33;
        }

        .terminal-dots { display: flex; gap: 6px; }

        .dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }
        .dot--red    { background: #ff5f57; box-shadow: 0 0 6px #ff5f57aa; }
        .dot--yellow { background: #febc2e; box-shadow: 0 0 6px #febc2eaa; }
        .dot--green  { background: #28c840; box-shadow: 0 0 6px #28c840aa; }

        .terminal-title {
          font-family: 'Jersey 10', sans-serif;
          font-size: 14px;
          color: #23c1ff;
          letter-spacing: 2px;
          margin-left: 8px;
          text-shadow: 0 0 8px rgba(35,193,255,0.5);
        }

        /* ── Body ── */
        .terminal-body {
          padding: 24px 28px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .terminal-prompt {
          margin: 0;
          font-size: 14px;
          color: #9faab5;
          letter-spacing: 1px;
        }

        .prompt-symbol {
          color: #00ff9f;
          margin-right: 6px;
          text-shadow: 0 0 8px rgba(0,255,159,0.5);
        }

        /* ── Steps ── */
        .terminal-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 4px 0;
        }

        .terminal-step {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }

        .terminal-step.pending {
          color: #3a3f4a;
        }

        .terminal-step.done {
          color: #e6edf3;
          animation: step-appear 0.3s ease forwards;
        }

        @keyframes step-appear {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .step-icon {
          width: 16px;
          text-align: center;
          color: #00ff9f;
          text-shadow: 0 0 8px rgba(0,255,159,0.6);
          font-weight: bold;
        }

        .terminal-step.pending .step-icon {
          color: #3a3f4a;
          text-shadow: none;
        }

        /* ── Final message ── */
        .terminal-final {
          margin: 0;
          font-size: 14px;
          color: #23c1ff;
          letter-spacing: 1px;
          text-shadow: 0 0 8px rgba(35,193,255,0.4);
          animation: step-appear 0.3s ease forwards;
        }

        .blink {
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        /* ── Progress bar ── */
        .progress-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }

        .progress-track {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 0 0 1px #23c1ff22;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #23c1ff, #00ff9f);
          box-shadow: 0 0 10px rgba(35,193,255,0.5);
          transition: width 0.5s ease;
          position: relative;
        }

        /* shimmer */
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 40px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 1.2s linear infinite;
        }

        @keyframes shimmer {
          from { transform: translateX(-40px); }
          to   { transform: translateX(40px); }
        }

        .progress-pct {
          font-family: 'Jersey 10', sans-serif;
          font-size: 16px;
          color: #23c1ff;
          letter-spacing: 1px;
          min-width: 40px;
          text-align: right;
          text-shadow: 0 0 8px rgba(35,193,255,0.4);
        }
      `}</style>
    </div>
  );
}