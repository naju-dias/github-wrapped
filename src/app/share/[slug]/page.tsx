import { notFound } from "next/navigation";
import { WrappedSlides } from "@/components/wrapped/WrappedSlides";
import { WrappedMetrics } from "@/lib/metrics";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

interface ShareData {
  user: { username: string; avatarUrl: string; name: string };
  data: WrappedMetrics;
  year: number;
  views: number;
}

async function getShareData(slug: string): Promise<ShareData | null> {
  try {
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/share?slug=${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getShareData(slug);
  if (!data) return { title: "GitHub Wrapped" };

  const topLang = data.data.topLanguages[0]?.name ?? "TypeScript";

  return {
    title: `GitHub Wrapped ${data.year} — @${data.user.username}`,
    description: `${data.data.personalityType} · ${data.data.totalCommits} commits · ${topLang}`,
    openGraph: {
      images: [
        {
          url: `/api/og?username=${data.user.username}&commits=${data.data.totalCommits}&language=${topLang}&personality=${encodeURIComponent(data.data.personalityType)}&year=${data.year}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function SharePage({ params }: Props) {
  const { slug } = await params;
  const data = await getShareData(slug);
  if (!data) notFound();

  return (
    <div>
      <div className="share-header">
        <img src={data.user.avatarUrl} alt={data.user.username} className="avatar" />
        <div>
          <p className="share-name">{data.user.name ?? data.user.username}</p>
          <p className="share-username">@{data.user.username} · {data.views} visualizações</p>
        </div>
      </div>

      <WrappedSlides metrics={data.data} />

      <style>{`
        body { background: #0d1117; margin: 0; }
        .share-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 24px 32px;
          border-bottom: 1px solid #21262d;
        }
        .avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 2px solid #764ba2;
        }
        .share-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #e6edf3;
          font-family: sans-serif;
        }
        .share-username {
          margin: 2px 0 0;
          font-size: 13px;
          color: #484f58;
          font-family: sans-serif;
        }
      `}</style>
    </div>
  );
}
