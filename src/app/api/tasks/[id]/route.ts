import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { prisma } = await import("@/lib/prisma");
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.status !== undefined) {
    updateData.status = body.status;
    if (body.status === "concluido") updateData.completedAt = new Date();
    else updateData.completedAt = null;
  }
  if (body.estimatedPomodoros !== undefined) updateData.estimatedPomodoros = body.estimatedPomodoros;
  if (body.subjectId !== undefined) updateData.subjectId = body.subjectId;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const task = await prisma.task.update({ where: { id }, data: updateData });
  return NextResponse.json({ task });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { prisma } = await import("@/lib/prisma");
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
