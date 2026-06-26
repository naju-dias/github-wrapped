import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import Noise from "@/components/Noise";
import localFont from "next/font/local";

const karmaticArcade = localFont({
  src: "../Fonts/ka1.ttf",
  variable: "--font-karmatic-arcade",
});

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="hero">

      <div className="bg-noise-wrapper">
        <Noise
          patternSize={250}
          patternScaleX={2}
          patternScaleY={2}
          patternRefreshInterval={2}
          patternAlpha={11}
        />
      </div>

      <div className="hero-content">
        <p className={`hero-eyebrow ${karmaticArcade.className}`}> Github Wrapped </p>

        <h1 className="hero-title">
          Seu ano resumido em
          <br />
          <span className="hero-title--accent">commits, bugs e café frio.</span>
        </h1>

        <p className="hero-subtitle">
          Descubra seu perfil de dev, suas linguagens favoritas,<br className="desktop-break" />
          seus horários malucos de commit e muito mais.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit" className="button">
            <div className="button-top">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              Entrar com GitHub
            </div>
            <div className="button-bottom" />
            <div className="button-base" />
          </button>
        </form>

        <p className="hero-note">
          <svg className="svg-note" xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="#5f6975" viewBox="0 0 30 7"><path  d="M12 13a1.49 1.49 0 0 0-1 2.61V17a1 1 0 0 0 2 0v-1.39A1.49 1.49 0 0 0 12 13m5-4V7A5 5 0 0 0 7 7v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3M9 7a3 3 0 0 1 6 0v2H9Zm9 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1Z"/></svg>
          Pedimos apenas permissão de leitura dos seus dados públicos.
        </p>

      </div>

      <footer className="footer">
        <p>
          &copy; Feito por{" "}
          <a href="https://www.linkedin.com/in/najudias/" target="_blank" rel="noopener noreferrer" className="footer-link">
            Naju Dias
          </a>.
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jersey+10&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Jersey+20&display=swap');

        body {
          margin: 0;
          font-family: 'Geist', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .bg-noise-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .hero-content {
          text-align: center;
          z-index: 1;
          padding: 24px 20px;
          max-width: 1250px;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        .hero-eyebrow {
          font-size: clamp(38px, 11vw, 90px);
          line-height: 1;
          letter-spacing: 1px;
          color: #fffde2;
          margin: 0 0 40px;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .hero-title {
          font-size: clamp(28px, 6.5vw, 56px);
          font-weight: 600;
          color: #fffde2;
          line-height: 1.2;
          margin: 0 0 24px;
          letter-spacing: -0.02em;
          text-wrap: balance;
          padding: 0 8px;
        }

        .hero-title--accent {
          color: #7db2d3;
          font-style: normal;
          display: inline;
        }

        .hero-subtitle {
          font-size:clamp(19px, 3vw, 20px);
          color: #8b949e;
          line-height: 1.6;
          margin: 0 0 48px;
          font-weight: 400;
        }

        /* Removi a classe antiga .btn-primary e adicionei a estilização do StyledWrapper aqui */
        .button {
          -webkit-appearance: none;
          appearance: none;
          position: relative;
          border-width: 0;
          padding: 0 8px 12px;
          min-width: 12em;
          box-sizing: border-box;
          background: transparent;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .button-top {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 0;
          padding: 14px 28px;
          transform: translateY(0);
          text-align: center;
          color: #fff;
          text-shadow: 0 -1px rgba(0, 0, 0, .25);
          transition-property: transform;
          transition-duration: .2s;
          -webkit-user-select: none;
          user-select: none;
        }

        .button:active .button-top {
          transform: translateY(6px);
        }

        .button-top::after {
          content: '';
          position: absolute;
          z-index: -1;
          border-radius: 12px;
          width: 100%;
          height: 100%;
          box-sizing: content-box;
          background-image: radial-gradient(#7db2d3, #5488a8);
          text-align: center;
          color: #fff;
          box-shadow: inset 0 0 0px 1px rgba(255, 255, 255, .2), 0 1px 2px 1px rgba(255, 255, 255, .2);
          transition-property: border-radius, padding, width, transform;
          transition-duration: .2s;
        }

        .button:active .button-top::after {
          border-radius: 14px;
          padding: 0 2px;
        }

        .button-bottom {
          position: absolute;
          z-index: -1;
          bottom: 4px;
          left: 4px;
          border-radius: 12px;
          padding-top: 6px;
          width: calc(100% - 8px);
          height: calc(100% - 10px);
          box-sizing: content-box;
          /* Sombra inferior em tom mais escuro do seu azul */
          background-color: #3b6b8a;
          background-image: radial-gradient(4px 8px at 4px calc(100% - 8px), rgba(255, 255, 255, .25), transparent), radial-gradient(4px 8px at calc(100% - 4px) calc(100% - 8px), rgba(255, 255, 255, .25), transparent), radial-gradient(16px at -4px 0, white, transparent), radial-gradient(16px at calc(100% + 4px) 0, white, transparent);
          box-shadow: 0px 4px 12px rgba(118,75,162,0.15), inset 0 -1px 3px 3px rgba(0, 0, 0, .2);
          transition-property: border-radius, padding-top;
          transition-duration: .2s;
        }

        .button:active .button-bottom {
          border-radius: 14px;
          padding-top: 0;
        }

        .button-base {
          position: absolute;
          z-index: -2;
          top: 4px;
          left: 0;
          border-radius: 14px;
          width: 100%;
          height: calc(100% - 4px);
          background-color: rgba(0, 0, 0, .15);
          box-shadow: 0 1px 1px 0 rgba(255, 255, 255, .15), inset 0 2px 2px rgba(0, 0, 0, .25);
        }

        .hero-note {
          margin-top: 20px;
          font-size: 13px;
          color: #5f6975;
          font-weight: 400;
          padding: 0 8px;
        }

        .footer {
          position: absolute;
          bottom: 24px;
          left: 0;
          width: 100%;
          text-align: center;
          z-index: 2;
        }

        .footer p {
          font-family: 'Geist', -apple-system, sans-serif;
          font-weight: 400;
          margin: 0;
          font-size: 14px;
          color: #8b949e;
        }

        .footer-link {
          color: #7db2d3;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .footer-link:hover {
          color: #fffde2;
          text-decoration: underline;
        }

        .desktop-break {
          display:inline;
      }

      @media (max-width: 768px) {
        .desktop-break { display: none; }
        .hero-content { padding: 24px 16px; }
        .hero-eyebrow { margin: 0 0 32px; }
        .hero-subtitle { margin: 0 0 36px; }
      }

      @media (max-width: 400px) {
        .hero-eyebrow { font-size: clamp(32px, 9vw, 48px); }
      }

      @media (max-width:768px) {
          .desktop-break{
              display:none;
          }
      }
      `}</style>
    </main>
  );
}