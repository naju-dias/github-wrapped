import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchUserRepos, fetchUserEvents } from "@/lib/github";
import { computeMetrics } from "@/lib/metrics";
import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/wrapped:
 *   get:
 *     summary: Generate or retrieve a user's GitHub Wrapped
 *     description: >
 *       Fetches the authenticated user's GitHub data, computes metrics,
 *       caches the result in the database, and returns the full report.
 *     tags: [Wrapped]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: The year to generate the Wrapped for
 *       - in: query
 *         name: refresh
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force regeneration even if cached
 *     responses:
 *       200:
 *         description: Wrapped report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WrappedReport'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */

const QuerySchema = z.object({
  year: z.coerce.number().int().min(2008).max(new Date().getFullYear()).default(new Date().getFullYear()),
  refresh: z.coerce.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login com GitHub." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = QuerySchema.safeParse({
      year: searchParams.get("year"),
      refresh: searchParams.get("refresh"),
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos", details: query.error.flatten() },
        { status: 400 }
      );
    }

    const { year, refresh } = query.data;

    // Check cache unless refresh is requested
    if (!refresh) {
      const cached = await prisma.wrappedReport.findUnique({
        where: { userId_year: { userId: session.user.id, year } },
      });

      if (cached) {
        return NextResponse.json({
          cached: true,
          generatedAt: cached.generatedAt,
          data: cached.data,
        });
      }
    }

    // Fetch user from DB to get GitHub username
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const account = user.accounts.find((a) => a.provider === "github");
    if (!account?.access_token) {
      return NextResponse.json(
        { error: "Token do GitHub não encontrado. Faça login novamente." },
        { status: 401 }
      );
    }

    // Fetch data from GitHub API
    const [repos, events] = await Promise.all([
      fetchUserRepos(user.username, account.access_token),
      fetchUserEvents(user.username, account.access_token),
    ]);

    // Compute metrics
    const metrics = computeMetrics(events, repos, year);

    // Upsert report in database
    const report = await prisma.wrappedReport.upsert({
      where: { userId_year: { userId: session.user.id, year } },
      update: { data: metrics as unknown as Prisma.InputJsonValue, generatedAt: new Date() },
      create: { userId: session.user.id, year, data: metrics as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({
      cached: false,
      generatedAt: report.generatedAt,
      data: metrics,
    });
  } catch (error) {
    console.error("[GET /api/wrapped]", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar o Wrapped." },
      { status: 500 }
    );
  }
}
