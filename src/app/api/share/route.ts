import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * @swagger
 * /api/share:
 *   post:
 *     summary: Create a shareable link for a Wrapped report
 *     tags: [Share]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Share link created
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Report not found — generate it first
 */

const BodySchema = z.object({
  year: z.number().int().min(2008).max(new Date().getFullYear()),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const report = await prisma.wrappedReport.findUnique({
      where: { userId_year: { userId: session.user.id, year: parsed.data.year } },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Relatório não encontrado. Gere seu Wrapped primeiro." },
        { status: 404 }
      );
    }

    // Create or reuse existing share
    const existing = await prisma.share.findFirst({
      where: { reportId: report.id },
    });

    if (existing) {
      return NextResponse.json({ slug: existing.slug, new: false }, { status: 200 });
    }

    const share = await prisma.share.create({
      data: { reportId: report.id },
    });

    return NextResponse.json({ slug: share.slug, new: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/share]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/share:
 *   get:
 *     summary: Get a shared Wrapped report by slug
 *     tags: [Share]
 *     parameters:
 *       - in: query
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report found
 *       404:
 *         description: Not found
 */
export async function GET(req: NextRequest) {
  try {
    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Slug obrigatório." }, { status: 400 });
    }

    const share = await prisma.share.findUnique({
      where: { slug },
      include: {
        report: {
          include: { user: { select: { username: true, avatarUrl: true, name: true } } },
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Link não encontrado." }, { status: 404 });
    }

    // Increment view count
    await prisma.share.update({
      where: { id: share.id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json({
      user: share.report.user,
      data: share.report.data,
      year: share.report.year,
      views: share.viewsCount + 1,
    });
  } catch (error) {
    console.error("[GET /api/share]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
