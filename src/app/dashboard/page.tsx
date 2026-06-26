"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { WrappedMetrics } from "@/lib/metrics";
import { WrappedSlides } from "@/components/wrapped/WrappedSlides";
import { LoadingScreen } from "@/components/wrapped/LoadingScreen";

interface ReportResponse {
  cached: boolean;
  generatedAt: string;
  data: WrappedMetrics;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
  const timer = setTimeout(() => setMinTimeDone(true), 5500);
  return () => clearTimeout(timer);
}, []);

useEffect(() => {
  const generate = async () => {
    try {
      const res = await fetch(`/api/wrapped?year=${new Date().getFullYear()}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao gerar Wrapped");
      }
      const data: ReportResponse = await res.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };
  generate();
}, []);

  const handleRefresh = async () => {
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch(`/api/wrapped?year=${new Date().getFullYear()}&refresh=true`);
      if (!res.ok) throw new Error("Erro ao atualizar");
      const data: ReportResponse = await res.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !minTimeDone) return <LoadingScreen />;

  if (error) {
    return (
      <div className="error-screen">
        <p>😕 {error}</p>
        <a href="/">Voltar ao início</a>
        <style>{`
          body { background: #0a0614; margin: 0; }
          .error-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #8b949e;
            font-family: sans-serif;
            gap: 16px;
          }
          .error-screen a { color: #7db2d3; }
        `}</style>
      </div>
    );
  }

  if (!report) return null;

  const btnStyle = {
    position: "fixed" as const,
    bottom: "24px",
    zIndex: 999,
    color: "#8b949e",
    fontFamily: "Geist",
    background: "none",
    border: "none",
    padding: "12px 0",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    letterSpacing: "0.5px",
    gap: "8px",
    transition: "color 0.2s ease",
  };

  return (
    <>
      <button 
        onClick={() => signOut({ callbackUrl: "/" })} 
        style={{ ...btnStyle, left: "50px" }}
        className="dashboard-btn"
      >
        ← Sair
      </button>

      <button 
        onClick={handleRefresh} 
        style={{ ...btnStyle, right: "50px" }}
        className="dashboard-btn"
      >
        🔄 Atualizar dados
      </button>

      <WrappedSlides
        metrics={report.data}
        username={session?.user?.username ?? session?.user?.name ?? undefined}
        avatarUrl={session?.user?.image ?? undefined}
      />

      <style>{`
        .dashboard-btn:hover {
          color: #c9d1d9 !important;
        }
      `}</style>
    </>
  );
}