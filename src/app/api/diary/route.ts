import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const entries = await prisma.studyDiary.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Failed to load diary entries", error);
    return NextResponse.json(
      { error: "Nao foi possivel carregar o diario." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();

    const date = new Date(body.date);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const existing = await prisma.studyDiary.findFirst({
      where: { date: { gte: dayStart, lt: dayEnd } },
    });

    let entry;
    if (existing) {
      entry = await prisma.studyDiary.update({
        where: { id: existing.id },
        data: {
          liquidTimeMinutes: body.liquidTimeMinutes ?? existing.liquidTimeMinutes,
          pomodoroCount: body.pomodoroCount ?? existing.pomodoroCount,
          whatWasStudied: body.whatWasStudied ?? existing.whatWasStudied,
          whatWasCompleted: body.whatWasCompleted ?? existing.whatWasCompleted,
          difficulty: body.difficulty ?? existing.difficulty,
          nextStep: body.nextStep ?? existing.nextStep,
        },
      });
    } else {
      entry = await prisma.studyDiary.create({
        data: {
          date,
          liquidTimeMinutes: body.liquidTimeMinutes ?? 0,
          pomodoroCount: body.pomodoroCount ?? 0,
          whatWasStudied: body.whatWasStudied ?? null,
          whatWasCompleted: body.whatWasCompleted ?? null,
          difficulty: body.difficulty ?? null,
          nextStep: body.nextStep ?? null,
        },
      });
    }

    return NextResponse.json({ entry }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Failed to save diary entry", error);
    return NextResponse.json(
      { error: "Nao foi possivel salvar o diario." },
      { status: 500 }
    );
  }
}
