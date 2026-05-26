import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const DEFAULT_SUBJECTS = [
  "Matematica",
  "Portugues",
  "Banco de Dados",
  "Estrutura de Dados e Algoritmos",
  "Conhecimentos Bancarios",
  "Atualidades Mercado Financeiro",
  "Probabilidade e Estatistica",
  "Aprendizagem de Maquina",
  "Big Data",
  "Ferramentas e Linguagens",
  "Redacao Discursiva",
  "Fechamento",
];

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

async function main() {
  console.log("Seeding database...");

  console.log("Creating subjects...");
  const subjectMap: Record<string, string> = {};
  for (const name of DEFAULT_SUBJECTS) {
    const subject = await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    subjectMap[name] = subject.id;
  }
  console.log(`  ${Object.keys(subjectMap).length} subjects created`);

  console.log("Seeding schedule...");
  for (const block of DEFAULT_SCHEDULE_BLOCKS) {
    await prisma.scheduleBlock.create({
      data: {
        dayOfWeek: block.dayOfWeek,
        startTime: block.startTime,
        endTime: block.endTime,
        subjectId: subjectMap[block.subjectName],
        objective: block.objective,
        status: "Planejado",
      },
    });
  }
  console.log(`  ${DEFAULT_SCHEDULE_BLOCKS.length} schedule blocks seeded`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
