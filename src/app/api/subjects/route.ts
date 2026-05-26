import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { prisma } = await import("@/lib/prisma");
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json({ subjects });
}

export async function POST(request: Request) {
  const { prisma } = await import("@/lib/prisma");
  const body = await request.json();
  const subject = await prisma.subject.create({
    data: { name: body.name },
  });
  return NextResponse.json({ subject }, { status: 201 });
}
