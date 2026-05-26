import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const { dayOfWeek, startTime, endTime, subjectName, objective, status } = body;

    const data: Record<string, unknown> = {};
    if (dayOfWeek !== undefined) data.dayOfWeek = dayOfWeek;
    if (startTime !== undefined) data.startTime = startTime;
    if (endTime !== undefined) data.endTime = endTime;
    if (objective !== undefined) data.objective = objective;
    if (status !== undefined) data.status = status;

    if (subjectName !== undefined) {
      if (subjectName) {
        const subject = await prisma.subject.upsert({
          where: { name: subjectName },
          update: {},
          create: { name: subjectName },
        });
        data.subjectId = subject.id;
      } else {
        data.subjectId = null;
      }
    }

    const block = await prisma.scheduleBlock.update({
      where: { id },
      data,
      include: { subject: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ block });
  } catch (error) {
    console.error("Failed to update schedule block", error);
    return NextResponse.json({ error: "Erro ao atualizar bloco" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");

    await prisma.scheduleBlock.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete schedule block", error);
    return NextResponse.json({ error: "Erro ao excluir bloco" }, { status: 500 });
  }
}
