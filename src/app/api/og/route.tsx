import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") ?? "dev";
  const commits = searchParams.get("commits") ?? "0";
  const language = searchParams.get("language") ?? "TypeScript";
  const personality = searchParams.get("personality") ?? "Dev Consistente";
  const year = searchParams.get("year") ?? "2024";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0d1117 0%, #1c1d24 50%, #0d1117 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(118,75,162,0.4) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(118,75,162,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", zIndex: 1 }}>
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "18px", color: "#764ba2", letterSpacing: "4px", textTransform: "uppercase" }}>
              GitHub Wrapped
            </div>
            <div style={{ color: "#764ba2", fontSize: "18px" }}>•</div>
            <div style={{ fontSize: "18px", color: "#764ba2", letterSpacing: "4px" }}>{year}</div>
          </div>

          {/* Username */}
          <div style={{ fontSize: "64px", fontWeight: "bold", color: "#ffffff" }}>
            @{username}
          </div>

          {/* Personality */}
          <div
            style={{
              fontSize: "28px",
              color: "#d9d5c5",
              padding: "12px 32px",
              border: "1px solid rgba(118,75,162,0.5)",
              borderRadius: "999px",
              background: "rgba(118,75,162,0.1)",
            }}
          >
            {personality}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "48px", marginTop: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "#764ba2" }}>{commits}</div>
              <div style={{ fontSize: "16px", color: "#888", marginTop: "4px" }}>commits</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "#764ba2" }}>{language}</div>
              <div style={{ fontSize: "16px", color: "#888", marginTop: "4px" }}>linguagem favorita</div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ fontSize: "16px", color: "#555", marginTop: "8px" }}>
            github-wrapped.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
