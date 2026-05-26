import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { prisma } = await import("@/lib/prisma");
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: { select: { name: true } } },
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const { prisma } = await import("@/lib/prisma");
  const body = await request.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      priority: body.priority ?? "media",
      status: body.status ?? "a_fazer",
      estimatedPomodoros: body.estimatedPomodoros ?? null,
      subjectId: body.subjectId ?? null,
      notes: body.notes ?? null,
      completedAt: body.status === "concluido" ? new Date() : null,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
