import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "node:fs";
import * as path from "node:path";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const DATA_DIR = path.resolve(__dirname, "..", "..");
const DATA_SUBDIRS = {
  tasks: path.join("03_Tarefas_de_Estudo", "tasks_estudo.csv"),
  pomodoro: path.join("02_Pomodoro_e_Horas", "controle_pomodoro.csv"),
  diary: path.join("04_Registro_do_Que_Foi_Estudado", "diario_de_estudo.csv"),
  frequency: path.join("01_Planejamento_de_Horarios", "frequencia_mensal.csv"),
  schedule: path.join("01_Planejamento_de_Horarios", "planejamento_semanal.csv"),
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function readCSV(filePath: string): Record<string, string>[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8").trim();
  if (!content) return [];
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = values[i] ?? "";
    });
    return record;
  });
}

function parseMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

const DIFFICULTY_MAP: Record<string, string> = {
  Fácil: "facil",
  Média: "medio",
  Difícil: "dificil",
};

async function seedSubjects() {
  const subjects = new Set<string>();

  const scheduleData = readCSV(path.join(DATA_DIR, DATA_SUBDIRS.schedule));
  for (const row of scheduleData) {
    if (row["Bloco"]) subjects.add(row["Bloco"]);
  }

  const diaryData = readCSV(path.join(DATA_DIR, DATA_SUBDIRS.diary));
  for (const row of diaryData) {
    const studied = row["O_que_foi_estudado"];
    if (studied) subjects.add(studied);
  }

  const subjectMap: Record<string, string> = {};
  for (const name of subjects) {
    const existing = await prisma.subject.findUnique({ where: { name } });
    if (existing) {
      subjectMap[name] = existing.id;
    } else {
      const created = await prisma.subject.create({ data: { name } });
      subjectMap[name] = created.id;
    }
  }
  return subjectMap;
}

async function seedSchedule(subjectMap: Record<string, string>) {
  const data = readCSV(path.join(DATA_DIR, DATA_SUBDIRS.schedule));
  for (const row of data) {
    if (!row["Dia"] || !row["Horario_Inicio"]) continue;
    await prisma.scheduleBlock.create({
      data: {
        dayOfWeek: row["Dia"],
        startTime: row["Horario_Inicio"],
        endTime: row["Horario_Fim"] ?? "",
        subjectId: subjectMap[row["Bloco"]] ?? null,
        objective: row["Objetivo"] ?? null,
        status: row["Status"] ?? "Planejado",
        notes: row["Observacoes"] ?? null,
      },
    });
  }
  console.log(`  ${data.length} schedule blocks seeded`);
}

async function seedTasks(subjectMap: Record<string, string>) {
  const data = readCSV(path.join(DATA_DIR, DATA_SUBDIRS.tasks));
  for (const row of data) {
    if (!row["Tarefa"]) continue;
    const statusMap: Record<string, string> = {
      "A Fazer": "a_fazer",
      "Fazendo Hoje": "fazendo_hoje",
      "Travado / Pendente": "travado_pendente",
      "Concluido": "concluido",
    };
    const priorityMap: Record<string, string> = {
      Alta: "alta",
      Media: "media",
      Baixa: "baixa",
    };
    await prisma.task.create({
      data: {
        title: row["Tarefa"],
        priority: (priorityMap[row["Prioridade"]] ?? "media") as any,
        status: (statusMap[row["Status"]] ?? "a_fazer") as any,
        estimatedPomodoros: row["Estimativa_Pomodoros"]
          ? parseInt(row["Estimativa_Pomodoros"], 10)
          : null,
        subjectId: subjectMap[row["Origem"]] ?? null,
        notes: row["Observacoes"] ?? null,
        completedAt: row["Data_Conclusao"] ? new Date(row["Data_Conclusao"]) : null,
      },
    });
  }
  console.log(`  ${data.length} tasks seeded`);
}

async function seedDiary() {
  const data = readCSV(path.join(DATA_DIR, DATA_SUBDIRS.diary));
  for (const row of data) {
    if (!row["Data"]) continue;
    await prisma.studyDiary.create({
      data: {
        date: new Date(row["Data"]),
        liquidTimeMinutes: parseMinutes(row["Tempo_Liquido"] ?? "0"),
        pomodoroCount: parseInt(row["Quantidade_Pomodoros"] ?? "0", 10),
        whatWasStudied: row["O_que_foi_estudado"] ?? null,
        whatWasCompleted: row["O_que_foi_concluido"] ?? null,
        difficulty: DIFFICULTY_MAP[row["Dificuldade"] ?? ""] ?? null,
        nextStep: row["Proximo_Passo"] ?? null,
      },
    });
  }
  console.log(`  ${data.length} diary entries seeded`);
}

async function seedFrequency() {
  const data = readCSV(path.join(DATA_DIR, DATA_SUBDIRS.frequency));
  for (const row of data) {
    if (!row["Mes_Ano"]) continue;
    await prisma.frequencyRecord.create({
      data: {
        monthYear: row["Mes_Ano"],
        markedDays: row["Dias_Marcados"] ?? null,
      },
    });
  }
  console.log(`  ${data.length} frequency records seeded`);
}

async function main() {
  console.log("Seeding database...");

  console.log("Creating subjects...");
  const subjectMap = await seedSubjects();
  console.log(`  ${Object.keys(subjectMap).length} subjects created`);

  console.log("Seeding schedule...");
  await seedSchedule(subjectMap);

  console.log("Seeding tasks...");
  await seedTasks(subjectMap);

  console.log("Seeding diary...");
  await seedDiary();

  console.log("Seeding frequency...");
  await seedFrequency();

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
