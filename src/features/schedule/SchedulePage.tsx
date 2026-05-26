"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DAY_ORDER } from "@/lib/constants";

interface ScheduleBlock {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  objective: string | null;
  status: string;
  subject: { name: string } | null;
}

export function SchedulePage() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((d) => setBlocks(d.blocks))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  const grouped = DAY_ORDER.map((day) => ({
    day,
    blocks: blocks.filter((b) => b.dayOfWeek === day),
  }));

  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7;
  const todayName = DAY_ORDER[todayIndex];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Cronograma Semanal</h1>
        <p className="text-zinc-400 mt-1">Seu planejamento de estudos da semana</p>
      </div>

      {blocks.length === 0 && (
        <Card>
          <p className="text-zinc-400 text-center py-8">
            Nenhum bloco de estudo planejado. Adicione blocos no painel administrativo.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {grouped.map(({ day, blocks: dayBlocks }) => (
          <Card
            key={day}
            highlight={day === todayName}
            className={day === todayName ? "ring-1 ring-violet-500/30" : ""}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white text-sm">{day}</h2>
              {day === todayName && (
                <Badge variant="info">Hoje</Badge>
              )}
            </div>
            <div className="space-y-2">
              {dayBlocks.map((block) => (
                <div
                  key={block.id}
                  className="bg-white/5 rounded-xl p-3 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-violet-400">
                      {block.startTime} - {block.endTime}
                    </span>
                    <Badge
                      variant={block.status === "Planejado" ? "info" : "default"}
                    >
                      {block.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-zinc-100">
                    {block.subject?.name ?? "Sem matéria"}
                  </p>
                  {block.objective && (
                    <p className="text-xs text-zinc-500 mt-0.5">{block.objective}</p>
                  )}
                </div>
              ))}
              {dayBlocks.length === 0 && (
                <p className="text-xs text-zinc-600 text-center py-4">Nenhum bloco</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
