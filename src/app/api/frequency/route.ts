import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { prisma } = await import("@/lib/prisma");
  const records = await prisma.frequencyRecord.findMany({
    orderBy: { monthYear: "desc" },
  });
  return NextResponse.json({ records });
}

export async function PATCH(request: Request) {
  const { prisma } = await import("@/lib/prisma");
  const body = await request.json();

  const record = await prisma.frequencyRecord.upsert({
    where: { monthYear: body.monthYear },
    update: { markedDays: body.markedDays },
    create: { monthYear: body.monthYear, markedDays: body.markedDays ?? null },
  });

  return NextResponse.json({ record });
}
