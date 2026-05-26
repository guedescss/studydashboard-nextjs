"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatMinutes } from "@/lib/utils";

interface DashboardMetrics {
  todayMinutes: number;
  todayPomodoros: number;
  weeklyMinutes: number;
  weeklyPomodoros: number;
  todayDistractions: number;
  totalTasks: number;
  completedTasks: number;
  diaryCount: number;
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const taskRatio = data?.totalTasks
    ? `${data.completedTasks}/${data.totalTasks}`
    : "0/0";

  const stats = [
    {
      label: "Horas Hoje",
      value: formatMinutes(data?.todayMinutes ?? 0),
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Pomodoros Hoje",
      value: String(data?.todayPomodoros ?? 0),
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      label: "Tarefas Concluídas",
      value: taskRatio,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Semana (Pomodoros)",
      value: `${data?.weeklyPomodoros ?? 0}`,
      icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Visão geral do seu progresso de estudos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <svg className="w-8 h-8 text-violet-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Timer Rápido</h2>
          <p className="text-3xl font-bold text-violet-400 mb-4 font-mono">25:00</p>
          <div className="flex gap-2">
            <Button size="sm">Iniciar</Button>
            <Button variant="secondary" size="sm">
              +1 Distração
            </Button>
          </div>
          {data && data.todayDistractions > 0 && (
            <p className="text-xs text-zinc-500 mt-3">
              Distrações hoje: {data.todayDistractions}
            </p>
          )}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Registros</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Horas estudadas hoje</span>
              <span className="text-white font-medium">{formatMinutes(data?.todayMinutes ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Horas na semana</span>
              <span className="text-white font-medium">{formatMinutes(data?.weeklyMinutes ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Entradas no diário</span>
              <span className="text-white font-medium">{data?.diaryCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Distrações hoje</span>
              <span className="text-white font-medium">{data?.todayDistractions ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
