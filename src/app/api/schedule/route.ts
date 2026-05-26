import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_SCHEDULE_BLOCKS = [
  { dayOfWeek: "Segunda", startTime: "14:00", endTime: "16:00", subjectName: "Matematica", objective: "Estudo principal" },
  { dayOfWeek: "Segunda", startTime: "18:00", endTime: "20:00", subjectName: "Portugues", objective: "Questoes ou revisao" },
  { dayOfWeek: "Terca", startTime: "14:00", endTime: "16:00", subjectName: "Banco de Dados", objective: "Estudo principal" },
  { dayOfWeek: "Terca", startTime: "18:00", endTime: "19:30", subjectName: "Estrutura de Dados e Algoritmos", objective: "Estudo principal" },
  { dayOfWeek: "Quarta", startTime: "14:00", endTime: "16:00", subjectName: "Conhecimentos Bancarios", objective: "Estudo principal" },
  { dayOfWeek: "Quarta", startTime: "18:00", endTime: "19:00", subjectName: "Atualidades Mercado Financeiro", objective: "Estudo principal" },
  { dayOfWeek: "Quinta", startTime: "14:00", endTime: "16:00", subjectName: "Probabilidade e Estatistica", objective: "Estudo principal" },
  { dayOfWeek: "Quinta", startTime: "18:00", endTime: "19:00", subjectName: "Aprendizagem de Maquina", objective: "Estudo principal" },
  { dayOfWeek: "Sexta", startTime: "14:00", endTime: "15:00", subjectName: "Big Data", objective: "Estudo principal" },
  { dayOfWeek: "Sexta", startTime: "16:00", endTime: "17:00", subjectName: "Ferramentas e Linguagens", objective: "Estudo principal" },
  { dayOfWeek: "Sabado", startTime: "09:00", endTime: "11:00", subjectName: "Redacao Discursiva", objective: "Simulado ou questoes" },
  { dayOfWeek: "Domingo", startTime: "18:00", endTime: "18:30", subjectName: "Fechamento", objective: "Planejar proxima semana" },
];

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const blockCount = await prisma.scheduleBlock.count();

    if (blockCount === 0) {
      for (const block of DEFAULT_SCHEDULE_BLOCKS) {
        const subject = await prisma.subject.upsert({
          where: { name: block.subjectName },
          update: {},
          create: { name: block.subjectName },
        });
        await prisma.scheduleBlock.create({
          data: {
            dayOfWeek: block.dayOfWeek,
            startTime: block.startTime,
            endTime: block.endTime,
            subjectId: subject.id,
            objective: block.objective,
            status: "Planejado",
          },
        });
      }
    }

    const blocks = await prisma.scheduleBlock.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: { subject: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ blocks });
  } catch (error) {
    console.error("Failed to load schedule blocks", error);
    return NextResponse.json(
      { blocks: DEFAULT_SCHEDULE_BLOCKS.map((b, i) => ({ id: `default-${i}`, dayOfWeek: b.dayOfWeek, startTime: b.startTime, endTime: b.endTime, objective: b.objective, status: "Planejado", subject: { name: b.subjectName } })) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const { dayOfWeek, startTime, endTime, subjectName, objective, status } = body;

    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: "dayOfWeek, startTime e endTime são obrigatórios" }, { status: 400 });
    }

    let subjectId: string | null = null;
    if (subjectName) {
      const subject = await prisma.subject.upsert({
        where: { name: subjectName },
        update: {},
        create: { name: subjectName },
      });
      subjectId = subject.id;
    }

    const block = await prisma.scheduleBlock.create({
      data: { dayOfWeek, startTime, endTime, subjectId, objective, status: status ?? "Planejado" },
      include: { subject: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule block", error);
    return NextResponse.json({ error: "Erro ao criar bloco" }, { status: 500 });
  }
}
