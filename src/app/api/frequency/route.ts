import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const records = await prisma.frequencyRecord.findMany({
      orderBy: { monthYear: "desc" },
    });
    return NextResponse.json({ records });
  } catch (error) {
    console.error("Failed to load frequency records", error);
    return NextResponse.json(
      { error: "Nao foi possivel carregar a frequencia." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();

    const record = await prisma.frequencyRecord.upsert({
      where: { monthYear: body.monthYear },
      update: { markedDays: body.markedDays },
      create: { monthYear: body.monthYear, markedDays: body.markedDays ?? null },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Failed to save frequency record", error);
    return NextResponse.json(
      { error: "Nao foi possivel salvar a frequencia." },
      { status: 500 }
    );
  }
}
