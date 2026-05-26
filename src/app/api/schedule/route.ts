import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { prisma } = await import("@/lib/prisma");
  const blocks = await prisma.scheduleBlock.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    include: { subject: { select: { name: true } } },
  });
  return NextResponse.json({ blocks });
}
