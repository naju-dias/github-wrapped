import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "GitHub Wrapped — Seu ano em código",
  description: "Descubra seu perfil de dev: commits, linguagens, horários e sua personalidade de programador.",
  openGraph: {
    title: "GitHub Wrapped",
    description: "Descubra seu ano em código.",
    images: ["/api/og?username=dev&commits=365&language=TypeScript&personality=Dev+Consistente&year=2024"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await auth();

  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body 
        style={{ margin: 0, backgroundColor: "#110C1D" }} 
        className="relative min-h-screen overflow-x-hidden"
      >
        <SessionProvider session={session}>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 0,
              backgroundImage: "radial-gradient(85% 70% at 50% -10%, #6460b1 0%, #231f70 25%, #0d0a48 55%, #050327 100%)",
              pointerEvents: "none",
            }}
          />
          <div className="relative z-10">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}