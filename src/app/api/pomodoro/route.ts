import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { prisma } = await import("@/lib/prisma");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [todaySessions, tasks] = await Promise.all([
    prisma.pomodoroSession.findMany({
      where: { date: { gte: todayStart, lt: todayEnd } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: { status: { not: "concluido" } },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ sessions: todaySessions, tasks });
}

export async function POST(request: Request) {
  const { prisma } = await import("@/lib/prisma");
  const body = await request.json();

  const session = await prisma.pomodoroSession.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
      durationMinutes: body.durationMinutes ?? 25,
      type: body.type ?? "focus",
      taskId: body.taskId ?? null,
      completed: body.completed ?? true,
      distractionCount: body.distractionCount ?? 0,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json({ session }, { status: 201 });
}
