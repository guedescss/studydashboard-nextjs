-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('alta', 'media', 'baixa');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('a_fazer', 'fazendo_hoje', 'travado_pendente', 'concluido');

-- CreateEnum
CREATE TYPE "PomodoroType" AS ENUM ('focus', 'short_break', 'long_break');

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'media',
    "status" "TaskStatus" NOT NULL DEFAULT 'a_fazer',
    "estimatedPomodoros" INTEGER,
    "subjectId" TEXT,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PomodoroSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TEXT,
    "endTime" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 25,
    "type" "PomodoroType" NOT NULL DEFAULT 'focus',
    "taskId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "distractionCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PomodoroSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyDiary" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "liquidTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "pomodoroCount" INTEGER NOT NULL DEFAULT 0,
    "whatWasStudied" TEXT,
    "whatWasCompleted" TEXT,
    "difficulty" TEXT,
    "nextStep" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyDiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequencyRecord" (
    "id" TEXT NOT NULL,
    "monthYear" TEXT NOT NULL,
    "markedDays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrequencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleBlock" (
    "id" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subjectId" TEXT,
    "objective" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Planejado',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distraction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pomodoroSessionId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Distraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FrequencyRecord_monthYear_key" ON "FrequencyRecord"("monthYear");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PomodoroSession" ADD CONSTRAINT "PomodoroSession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleBlock" ADD CONSTRAINT "ScheduleBlock_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distraction" ADD CONSTRAINT "Distraction_pomodoroSessionId_fkey" FOREIGN KEY ("pomodoroSessionId") REFERENCES "PomodoroSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
