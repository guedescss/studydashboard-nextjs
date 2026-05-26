import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { prisma } = await import("@/lib/prisma");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 86400000);

  const [todaySessions, weeklySessions, taskCounts, todayDistractions, diaryCount] = await Promise.all([
    prisma.pomodoroSession.findMany({
      where: { date: { gte: todayStart, lt: todayEnd }, completed: true },
    }),
    prisma.pomodoroSession.findMany({
      where: { date: { gte: weekStart, lt: todayEnd }, completed: true },
    }),
    prisma.task.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.distraction.count({
      where: { date: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.studyDiary.count(),
  ]);

  const todayMinutes = todaySessions
    .filter((s) => s.type === "focus")
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const todayPomodoros = todaySessions.filter((s) => s.type === "focus").length;

  const weeklyMinutes = weeklySessions
    .filter((s) => s.type === "focus")
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const weeklyPomodoros = weeklySessions.filter((s) => s.type === "focus").length;

  const totalTasks = taskCounts.reduce((acc, g) => acc + g._count, 0);
  const completedTasks = taskCounts.find((g) => g.status === "concluido")?._count ?? 0;

  return NextResponse.json({
    todayMinutes,
    todayPomodoros,
    weeklyMinutes,
    weeklyPomodoros,
    todayDistractions,
    totalTasks,
    completedTasks,
    diaryCount,
  });
}
