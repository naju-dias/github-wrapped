"use client";

import { useState, useRef, useEffect } from "react";
import { WrappedMetrics } from "@/lib/metrics";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import Noise from "@/components/Noise";
import CountUp from "react-countup";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";


interface Props {
  metrics: WrappedMetrics;
  username?: string;
  avatarUrl?: string;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Ruby: "#701516",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
  Vue: "#41b883",
  Dart: "#00B4AB",
};

function getLangColor(lang: string) {
  return LANG_COLORS[lang] ?? "#925dc9";
}

function CodeIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 256 256"
      style={{ color, filter: `drop-shadow(0 0 6px ${color}aa)` }}
    >
      <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z" />
    </svg>
  );
}

function AnimatedDots({ active }: { active: boolean }) {
  return (
    <span className="loading-dots">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={active ? "loading-dot" : ""}
          style={{ animationDelay: `${i * 0.18}s` }}
        >
          .
        </span>
      ))}
    </span>
  );
}

function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export function WrappedSlides({ metrics, username, avatarUrl }: Props) {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [personalityRevealed, setPersonalityRevealed] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalSlides = 7;

  useEffect(() => {
    if (slide === totalSlides - 1) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
}, [slide]);

useEffect(() => {
  if (slide !== 5) {
    setPersonalityRevealed(false);
    return;
  }

  const timer = setTimeout(() => {
    setPersonalityRevealed(true);
  }, 2600);

  return () => clearTimeout(timer);
}, [slide]);

  const next = () => {
    setDirection(1);
    setSlide((s) => Math.min(s + 1, totalSlides - 1));
  };

  const prev = () => {
    setDirection(-1);
    setSlide((s) => Math.max(s - 1, 0));
  };

  const topLang = metrics.topLanguages[0];

  const captureCard = async () => {
  if (!cardRef.current) return null;
  const html2canvas = (await import("html2canvas")).default;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    padding: 32px;
    background: #06030d;
    display: inline-flex;
  `;
  
  const clone = cardRef.current.cloneNode(true) as HTMLElement;
  clone.style.boxShadow = "0 0 0 2px #fffde2";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(wrapper, {
      backgroundColor: "#06030d",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return canvas;
  } finally {
    document.body.removeChild(wrapper);
  }
};

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `github-wrapped-${username ?? "dev"}-${metrics.year}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Erro ao baixar a imagem.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File(
          [blob],
          `github-wrapped-${username ?? "dev"}.png`,
          { type: "image/png" }
        );

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `GitHub Wrapped ${metrics.year}`,
            text: `Meu GitHub Wrapped ${metrics.year} — ${metrics.personalityType} · ${metrics.totalCommits} commits · ${topLang?.name ?? ""}`,
            files: [file],
          });
        } else {
          const res = await fetch("/api/share", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ year: metrics.year }),
          });
          const data = await res.json();
          const url = `${window.location.origin}/share/${data.slug}`;
          await navigator.clipboard.writeText(url);
          setShareUrl(url);
        }
      }, "image/png");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        alert("Erro ao compartilhar.");
      }
    } finally {
      setSharing(false);
    }
  };
    
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
    }),
  };

  const slideContents = [
    // Slide 0 — Intro
    <div key="intro" className="slide">
      <FadeIn>
      {avatarUrl && <img src={avatarUrl} alt={username} className="avatar-hero" />}
      </FadeIn>

      <FadeIn delay={0.1}>
      {username && <p className="slide-greeting">Olá, <span className="slide-username">@{username}</span></p>}
      </FadeIn>

      <FadeIn delay={0.2}>
      <p className="slide-eyebrow">Seu ano em código</p>
      </FadeIn>

      <FadeIn delay={0.35}>
      <h1 className="slide-number">{metrics.year}</h1>
      </FadeIn>

      <FadeIn delay={0.5}>
      <p className="slide-label">GitHub Wrapped</p>
      </FadeIn>
    </div>,


    // Slide 1 — Commits
    <div key="commits" className="slide">
      <FadeIn>
        <p className="slide-eyebrow"> Você fez </p>
      </FadeIn>

      <FadeIn delay={0.15}>
        <h1 className="slide-number neon-blue">
          <CountUp
            key={slide}
            end={metrics.totalCommits}
            duration={2}
          />
        </h1> 
      </FadeIn>
      
      <FadeIn delay={0.3}>
        <p className="slide-label"> Commits no ano </p>
      </FadeIn>

      <FadeIn delay={0.45}>
        <p className="slide-sub"> Em {metrics.totalRepos} repositórios diferentes </p>
      </FadeIn>

      {metrics.totalStars > 0 && (
        <p className="slide-badge">⭐ {metrics.totalStars} estrelas conquistadas </p>
      )}
    </div>,

    // Slide 2 — Peak Hours
    <div key="hour" className="slide">

      <FadeIn>
      <p className="slide-eyebrow">Você commita mais às</p>
      </FadeIn>

      <FadeIn delay={0.15}>
      <h1 className="slide-number neon-purple">{String(metrics.peakHour).padStart(2, "0")}h</h1>
      </FadeIn>

      <FadeIn delay={0.3}>
      <p className="slide-label">
        {metrics.peakHour >= 0 && metrics.peakHour < 6
          ? "🌙 enquanto o mundo dorme"
          : metrics.peakHour >= 6 && metrics.peakHour < 12
          ? "☀️ bem cedo da manhã"
          : metrics.peakHour >= 12 && metrics.peakHour < 18
          ? "🌤️ durante o dia"
          : "🌆 à tarde/noite"}
      </p>
      </FadeIn>

      <FadeIn delay={0.45}>
      <p className="slide-sub">Dia mais ativo: {metrics.peakDay}</p>
      </FadeIn>
    </div>,

    // Slide 3 — Languages
    <div key="langs" className="slide">

      <FadeIn>
      <p className="slide-eyebrow">Suas linguagens</p>
      </FadeIn>

      {topLang && (
        <FadeIn delay={0.2}>
        <div className="lang-hero-box" style={{ borderColor: getLangColor(topLang.name) }}>
          <CodeIcon color={getLangColor(topLang.name)} size={35} />
          <span className="lang-hero-name" style={{ color: getLangColor(topLang.name) }}>{topLang.name}</span>
          <span className="lang-hero-pct">{topLang.percentage}% do seu código</span>
        </div>
        </FadeIn>
      )}
      <div className="lang-list">
        {metrics.topLanguages.slice(0, 5).map((lang, index) => (
          <div key={lang.name} className="lang-item">
            <div className="lang-dot" style={{ background: getLangColor(lang.name) }} />
            <span className="lang-name">{lang.name}</span>
            <div className="lang-bar-wrap">
              <motion.div
                className="lang-bar"
                initial={{ width: 0 }}
                animate={{ width: `${lang.percentage}%` }}
                transition={{
                  duration: 1,
                  delay: index * 0.15,
                  ease: "easeOut"
                }}
                style={{
                  background: getLangColor(lang.name),
                  boxShadow: `0 0 6px ${getLangColor(lang.name)}88`,
                }}
              />
            </div>
            <span className="lang-pct">{lang.percentage}%</span>
          </div>
        ))}
      </div>
    </div>,

    // Slide 4 — Monthly chart
    <div key="monthly" className="slide">
      <FadeIn>
      <p className="slide-eyebrow">Seu mês mais ativo foi</p>
      </FadeIn>

      <FadeIn delay={0.2}>
      <h2 className="slide-highlight">{metrics.mostActiveMonth}</h2>
      </FadeIn>

      <div style={{ width: "100%", height: 180, marginTop: 16 }}>
        <ResponsiveContainer>
          <BarChart data={metrics.commitsByMonth} barSize={10}>
            <XAxis dataKey="month" tick={{ fill: "#9faab5", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "#bd93f9", border: "1px solid #c2e1f2", borderRadius: 4, color: "#fff", fontSize: 13, fontWeight: 500 }} cursor={{ fill: "rgba(118,75,162,0.1)" }} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {metrics.commitsByMonth.map((entry, i) => (
                <Cell key={i} fill={entry.month === metrics.mostActiveMonth ? "#7db2d3" : "rgba(255,255,255,0.08)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>,

    // Slide 5 — Personality
    <div key="personality" className="slide">
      <FadeIn>
      <p className="slide-eyebrow">
        Baseado no seu histórico, você é um
        <AnimatedDots active={!personalityRevealed} />
      </p>
      </FadeIn>

      <div className="personality-result">
        <AnimatePresence>
          {personalityRevealed && (
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
              }}
            >
              <h2 className="slide-personality">
                {metrics.personalityType}
              </h2>

          <p className="slide-personality-desc">
            {metrics.personalityDescription}
          </p>

          {metrics.longestStreak > 0 && (
            <motion.div
              className="streak-badge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: .25 }}
            >
              🔥 {metrics.longestStreak} dias seguidos
            </motion.div>
          )}
        </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>,

    // Slide 6 — Share card
    <div key="share" className="slide">
      <FadeIn>
      <p className="slide-eyebrow">É isso aí!</p>
      </FadeIn>

      <FadeIn delay={0.15}>
      <div className="share-card" ref={cardRef}>
        <div className="share-card-header">
          <span className="share-card-title">GITHUB WRAPPED</span>
          <span className="share-card-year">{metrics.year}</span>
        </div>      

        {avatarUrl && (
          <div className="share-card-avatar-wrap">
            <img src={avatarUrl} alt={username} className="share-card-avatar" />
          </div>
        )}

        <p className="share-card-username">@{username ?? "dev"}</p>

        <div className="share-card-stats">
          <div className="share-stat">
            <span className="share-stat-value neon-blue">{metrics.totalCommits}</span>
            <span className="share-stat-label">commits</span>
          </div>
          <div className="stat-divider" />
          <div className="share-stat">
            <span className="share-stat-value neon-purple">{metrics.totalRepos}</span>
            <span className="share-stat-label">repos</span>
          </div>
          {metrics.totalStars > 0 && (
            <>
              <div className="stat-divider" />
              <div className="share-stat">
                <span className="share-stat-value" style={{ color: "#f1c40f" }}>{metrics.totalStars}</span>
                <span className="share-stat-label">stars</span>
              </div>
            </>
          )}
        </div>

        {topLang && (
          <div className="share-card-lang" style={{ borderColor: getLangColor(topLang.name) }}>
            <CodeIcon color={getLangColor(topLang.name)} size={12} />
            <span style={{ color: getLangColor(topLang.name) }}>{topLang.name}</span>
            <span style={{ color: "#9faab5", fontSize: 11 }}>{topLang.percentage}%</span>
          </div>
        )}

        <p className="share-card-personality">{metrics.personalityType}</p>

        <div className="share-card-footer">
          <span className="share-card-credit">github-wrapped.vercel.app</span>
        </div>
      </div>
      </FadeIn>

      <FadeIn delay={0.35}>
      <div className="share-buttons">
        <button className="btn-download" onClick={handleDownload} disabled={downloading}>
          {downloading ? "..." : "⬇ Download"}
        </button>
        <button className="btn-share" onClick={handleShare} disabled={sharing}>
          {sharing ? "..." : "↗ Compartilhar"}
        </button>
      </div>
      </FadeIn>

      {shareUrl && <p className="share-url">Link copiado: {shareUrl}</p>}
    </div>,
  ];

  return (
    <div className="wrapped-root">
      <div className="bg-noise-wrapper">
        <Noise patternSize={250} patternScaleX={2} patternScaleY={2} patternRefreshInterval={2} patternAlpha={11} />
      </div>

      <div className="stories-bar">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div
            key={i}
            className={`story-seg ${i < slide ? "done" : i === slide ? "active" : ""}`}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>

      <div className="slide-container">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ width: "100%", display: "flex", alignItems: "stretch" }}
          >
            {slideContents[slide]}
          </motion.div>
        </AnimatePresence>

      </div>

      <div className="nav-buttons">
        <button className="nav-btn" onClick={prev} disabled={slide === 0}>← Anterior</button>
        <button className="nav-btn nav-btn--primary" onClick={next} disabled={slide === totalSlides - 1}>Próximo →</button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jersey+10&display=swap');

        body { margin: 0; }

        .bg-noise-wrapper {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .stories-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          z-index: 100;
          background: linear-gradient(to bottom, rgba(10,6,20,0.7) 0%, transparent 100%);
        }

        .story-seg {
          height: 3px;
          flex: 1;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: background 0.2s;
        }
        .story-seg.done { background: #7db2d3; }
        .story-seg.active { background: #fffde2; }

        .wrapped-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 24px 24px;
          box-sizing: border-box;
          position: relative;
          z-index: 1;
          font-family: -apple-system, sans-serif;
        }

        .slide-container {
          width: 100%;
          max-width: 580px;
          min-height: clamp(420px, 65vh, 520px);
          display: flex;
          align-items: stretch;
        }

        .slide {
          width: 100%;
          padding: clamp(24px, 5vw, 48px)
                   clamp(20px, 6vw, 40px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-sizing: border-box;
          position: relative;
        }

        .slide-greeting {
          font-size: 28px;
          color: #9faab5;
          margin: 0 0 8px;
        }

        .slide-username {
          font-family: 'Jersey 10', sans-serif;
          font-size: 28px;
          color: #23c1ff;
          letter-spacing: 2px;
          text-shadow: 0 0 8px rgba(80,197,242,0.5);
        }

        .slide-eyebrow {
          font-size: clamp(20px, 6vw, 28px);
          font-weight: 600;
          letter-spacing: 2px;
          color: #23c1ff;
          margin: 0 0 12px;
          text-shadow: 0 0 8px rgba(80,197,242,0.4);
          z-index: 1;
        }

        .slide-number {
          font-family: 'Jersey 10', sans-serif;
          font-size: clamp(130px, 20vw, 190px);
          font-weight: 400;
          color: #fffde2;
          margin: 0;
          letter-spacing: 4px;
          line-height: 1;
          text-shadow: 3px 3px 0 #4a2a7a;
          z-index: 1;
        }

        .neon-blue {
          color: #c5003c !important;
          text-shadow: 0 0 10px rgba(197,0,70,0.8), 3px 3px 0 #570b22 !important;
        }

        .neon-purple {
          color: #bd93f9 !important;
          text-shadow: 0 0 10px rgba(189,147,249,0.8), 3px 3px 0 #4e228f !important;
        }

        .slide-label {
          font-family: 'Jersey 10', sans-serif;
          font-size: clamp(35px, 5vw, 35px);
          color: #00ff9f;
          margin: 12px 0 0;
          letter-spacing: 2.5px;
          z-index: 1;
        }

        .slide-sub {
          font-size: clamp(18px, 4vw, 18px);
          color: #9faab5;
          margin: 8px 0 0;
          z-index: 1;
        }

        .slide-badge {
          margin-top: 20px;
          font-size: 18px;
          color: #f1c40f;
          padding: 6px 16px;
          border: 1px solid rgba(241,196,15,0.3);
          background: rgba(241,196,15,0.05);
          z-index: 1;
          letter-spacing: 1px;
        }

        .slide-highlight {
          font-family: 'Jersey 10', sans-serif;
          font-size: 56px;
          font-weight: 400;
          color: #ff6036;
          margin: 8px 0 0;
          letter-spacing: 3px;
          text-shadow: 0 0 12px rgba(97,30,13,0.4), 3px 3px 0 #611e0d;
          z-index: 1;
        }

        .slide-personality {
          font-family: 'Jersey 10', sans-serif;
          font-size: clamp(30px, 6vw, 40px);
          color: #fffde2;
          margin: 28px 0 8px;
          letter-spacing: 2.5px;
          z-index: 1;
        }

        .slide-personality-desc {
          font-size: 18px;
          color: #9faab5;
          line-height: 1.7;
          max-width: 340px;
          margin: 0 auto;
          z-index: 1;
        }

        .streak-badge {
          margin-top: 24px;
          font-family: 'Jersey 10', sans-serif;
          font-size: 22px;
          color: #ff6b35;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(255,107,53,0.5);
          padding: 8px 20px;
          border: 2px solid rgba(255,107,53,0.3);
          background: rgba(255,107,53,0.05);
          z-index: 1;
        }

        .avatar-hero {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 3px solid #23c1ff;
          margin-bottom: 14px;
          box-shadow: 0 0 20px rgba(118,75,162,0.5);
          z-index: 1;
        }

        .lang-hero-box {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid;
          border-radius: 23px;
          padding: 15px 25px;
          margin: 40px 0 60px;
          background: rgba(255,255,255,0.03);
          z-index: 1;
        }

        .lang-hero-name {
          font-family: 'Jersey 10', sans-serif;
          font-size: 35px;
          letter-spacing: 2px;
        }

        .lang-hero-pct {
          font-size: 15px;
          color: #fffde2;
          margin-left: 4px;
          margin-top: 4px;
        }

        .lang-list {
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 1;
        }

        .lang-item {
          display: grid;
          grid-template-columns: 10px 70px 1fr 40px;
          align-items: center;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
        }

        .lang-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .lang-name {
          color: #e6edf3;
          font-size: 16px;
          font-weight: 500;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lang-bar-wrap {
          height: 4px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
          width: 100%;
        }

        .lang-bar { height: 100%; transition: width 0.8s ease; }
        .lang-pct { color: #7b8394; font-size: 16px; text-align: right; }

        /* ── Share card ── */
        .share-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: min(240px, 90vw);
          background: #06030d;
          padding: 25px;
          margin: 12px 0 20px;
          border-radius: 13px;
          position: relative;
          z-index: 1;
          box-shadow:
            0 -4px 0 0 #000,
            0 4px 0 0 #000,
            -4px 0 0 0 #000,
            4px 0 0 0 #000,
            5px 5px 0 0 #000,
            7px 7px 0 0 #000,
            9px 9px 0 0 #000,
            inset 0 0 0 2px #fffde2;
        }

        .share-card::before {
          content: '';
          position: absolute;
          top: -2px; 
          left: -3px;
          width: 3px; 
          height: 3px;
          background: transparent;
          box-shadow:
            calc(100% + 3px) 0 0 0 transparent,
            0 calc(100% + 3px) 0 0 transparent,
            calc(100% + 3px) calc(100% + 3px) 0 0 transparent;
        }

        .share-card-header {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 10px;
        }

        .share-card-title {
          font-family: 'Jersey 10', sans-serif;
          font-size: 20px;
          color: #00ff9f;
          letter-spacing: 2px;
        }

        .share-card-year {
          font-family: 'Jersey 10', sans-serif;
          font-size: 20px;
          color: #fffde2;
          letter-spacing: 2px;
        }

        .share-card-avatar-wrap {
          width: 100%;
          height: 230px;
          overflow: hidden;
          margin-bottom: 10px;
          border: 2px solid #fffde2;
        }

        .share-card-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .share-card-username {
          font-family: 'Jersey 10', sans-serif;
          font-size: 22px;
          color: #23c1ff;
          margin: 4px 0 8px;
          letter-spacing: 2px;
          text-shadow: 0 0 8px rgba(80,197,242,0.4);
        }

        .share-card-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 8px;
          padding: 8px 0;
          border-top: 1px solid #005678;
          border-bottom: 1px solid #005678;
          width: 100%;
          justify-content: center;
        }

        .share-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .share-stat-value {
          font-family: 'Jersey 10', sans-serif;
          font-size: 20px;
          letter-spacing: 1px;
        }

        .share-stat-label {
          font-size: 9px;
          color: #8791a3;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-divider {
          width: 1px;
          height: 28px;
          background: #005678;
        }

        .share-card-lang {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Jersey 10', sans-serif;
          font-size: 16px;
          letter-spacing: 1px;
          padding: 4px 12px;
          border: 1px solid;
          margin: 4px 0;
        }

        .share-card-personality {
          font-family: 'Jersey 10', sans-serif;
          font-size: 16px;
          color: #bdbba6;
          letter-spacing: 2px;
          margin: 4px 0 8px;
          text-transform: uppercase;
        }

        .share-card-footer {
          display: flex;
          justify-content: center;
          width: 100%;
          padding-top: 12px;
          border-top: 1px solid #001d29;
          margin-top: auto;
          margin-bottom: -9px;
        }

        .share-card-credit {
          font-family: 'Geist', sans-serif;
          font-size: 8px;
          color: #9faab5;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* ── Share buttons ── */
        .share-buttons {
          flex-wrap: wrap;
          justify-content:center;
          display: flex;
          gap: 10px;
          z-index: 1;
        }

        .btn-download {
          background: #001d29;
          color: #9faab5;
          border-radius: 13px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: -apple-system, sans-serif;
          box-shadow:
            0 -3px 0 0 #000,
            0 3px 0 0 #000,
            -3px 0 0 0 #000,
            3px 0 0 0 #000,
            4px 4px 0 0 #000,
            5px 5px 0 0 #000,
            inset 0 0 0 2px #015b80;
        }

        .btn-download:hover:not(:disabled) { 
          transform: translate(1px,1px); 
          color: #fff; 
        }

        .btn-download:disabled { 
          opacity: 0.6; 
          cursor: not-allowed; 
        }

        /* ── Nav buttons ── */
        .nav-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .nav-btn {
          background: rgba(22,27,34,0.8);
          color: #9faab5;
          border-radius: 20px;
          border: none;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          font-family: -apple-system, sans-serif;
          box-shadow:
            0 -3px 0 0 #000,
            0 3px 0 0 #000,
            -3px 0 0 0 #000,
            3px 0 0 0 #000,
            4px 4px 0 0 #000,
            5px 5px 0 0 #000,
            inset 0 2px 0 0 rgba(255,255,255,0.08),
            inset 0 0 0 2px #21262d;
        }

        .nav-btn:hover:not(:disabled) {
          color: #fff;
          transform: translate(1px, 1px);
        }

        .nav-btn:active:not(:disabled) {
          transform: translate(4px, 4px);
        }

        .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .nav-btn--primary {
          background: #219ccc;
          color: #fffef2;
          box-shadow:
            0 -3px 0 0 #000,
            0 3px 0 0 #000,
            -3px 0 0 0 #000,
            3px 0 0 0 #000,
            4px 4px 0 0 #000,
            5px 5px 0 0 #000,
            inset 0 2px 0 0 rgba(255,255,255,0.3),
            inset 0 0 0 2px #28657d;
        }

        .nav-btn--primary:hover:not(:disabled) {
          background: #1a7fa8;
          transform: translate(1px, 1px);
        }

        .btn-share {
          background: #005678;
          color: #fff;
          border-radius: 13px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: -apple-system, sans-serif;
          box-shadow:
            0 -3px 0 0 #000,
            0 3px 0 0 #000,
            -3px 0 0 0 #000,
            3px 0 0 0 #000,
            4px 4px 0 0 #000,
            5px 5px 0 0 #000,
            inset 0 2px 0 0 rgba(255,255,255,0.25),
            inset 0 0 0 2px #026c96;
        }

        .btn-share:hover:not(:disabled) { 
          background: #00425c; 
          transform: translate(1px,1px); 
        }

        .btn-share:disabled { 
          opacity: 0.7; 
          cursor: not-allowed; 
        }

        .share-url {
          margin-top: 10px;
          font-size: 11px;
          color: #484f58;
          word-break: break-all;
          z-index: 1;
        }

        .loading-dots {
          display: inline-flex;
          align-items: flex-end;
          margin-left: 2px;
        }

        .loading-dot {
          display: inline-block;
          animation: dotBounce 0.9s infinite ease-in-out;
        }

        .personality-result {
          min-height: 220px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
      }

        @keyframes dotBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: .5;
          }

          30% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}