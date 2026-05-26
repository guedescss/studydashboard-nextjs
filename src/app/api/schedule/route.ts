import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_SCHEDULE_BLOCKS = [
  {
    dayOfWeek: "Segunda",
    startTime: "14:00",
    endTime: "16:00",
    subjectName: "Matematica",
    objective: "Estudo principal",
  },
  {
    dayOfWeek: "Segunda",
    startTime: "18:00",
    endTime: "20:00",
    subjectName: "Portugues",
    objective: "Questoes ou revisao",
  },
  {
    dayOfWeek: "Terca",
    startTime: "14:00",
    endTime: "16:00",
    subjectName: "Banco de Dados",
    objective: "Estudo principal",
  },
  {
    dayOfWeek: "Terca",
    startTime: "18:00",
    endTime: "19:30",
    subjectName: "Estrutura de Dados e Algoritmos",
    objective: "Estudo principal",
  },
  {
    dayOfWeek: "Quarta",
    startTime: "14:00",
    endTime: "16:00",
    subjectName: "Conhecimentos Bancarios",
    objective: "Estudo principal",
  },
  {
    dayOfWeek: "Quarta",
    startTime: "18:00",
    endTime: "19:00",
    subjectName: "Atualidades Mercado Financeiro",
    objective: "Estudo principal",
  },
  {
    dayOfWeek: "Quinta",
    startTime: "14:00",
    endTime: "16:00",
    subjectName: "Probabilidade e Estatistica",
    objective: "Estudo principal",
  },
  {
    dayOfWeek: "Quinta",
    startTime: "18:00",
    endTime: "19:00",
    subjectName: "Aprendizagem de Maquina",
    objective: "Estudo principal",
  },
  {
    dayOfWeek: "Sexta",
    startTime: "14:00",
    endTime: "15:00",
    subjectName: "Big Data",
    objective: "Estudo principal",
  },
  {
    dayOfWeek: "Sexta",
    startTime: "16:00",
    endTime: "17:00",
    subjectName: "Ferramentas e Linguagens",
    objective: "Estudo principal",
  },
  {
    dayOfWeek: "Sabado",
    startTime: "09:00",
    endTime: "11:00",
    subjectName: "Redacao Discursiva",
    objective: "Simulado ou questoes",
  },
  {
    dayOfWeek: "Domingo",
    startTime: "18:00",
    endTime: "18:30",
    subjectName: "Fechamento",
    objective: "Planejar proxima semana",
  },
];

function defaultBlocksResponse() {
  return DEFAULT_SCHEDULE_BLOCKS.map((block, index) => ({
    id: `default-${index}`,
    dayOfWeek: block.dayOfWeek,
    startTime: block.startTime,
    endTime: block.endTime,
    objective: block.objective,
    status: "Planejado",
    subject: { name: block.subjectName },
  }));
}

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
      include: { subject: { select: { name: true } } },
    });
    return NextResponse.json({ blocks });
  } catch (error) {
    console.error("Failed to load schedule blocks", error);
    return NextResponse.json({ blocks: defaultBlocksResponse() });
  }
}
