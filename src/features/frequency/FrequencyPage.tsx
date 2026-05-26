"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface FrequencyRecord {
  id: string;
  monthYear: string;
  markedDays: string | null;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function FrequencyPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<FrequencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const loadRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/frequency");
      const data = await res.json();
      setRecords(data.records ?? []);
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const currentRecord = records.find((r) => r.monthYear === currentMonth);
  const markedSet = new Set(
    (currentRecord?.markedDays ?? "").split(",").map((d) => d.trim()).filter(Boolean)
  );

  const [year, month] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const today = new Date();

  const toggleDay = async (day: number) => {
    const dayStr = String(day);
    const newMarked = new Set(markedSet);
    if (newMarked.has(dayStr)) {
      newMarked.delete(dayStr);
    } else {
      newMarked.add(dayStr);
    }
    const markedDays = Array.from(newMarked).sort((a, b) => Number(a) - Number(b)).join(",");

    const res = await fetch("/api/frequency", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthYear: currentMonth, markedDays }),
    });

    if (res.ok) {
      toast(newMarked.has(dayStr) ? "Dia marcado!" : "Dia desmarcado", newMarked.has(dayStr) ? "success" : "info");
      loadRecords();
    }
  };

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        <div className="h-80 rounded-2xl bg-white/5" />
      </div>
    );
  }

  const daysStudied = markedSet.size;
  const percentage = daysInMonth > 0 ? Math.round((daysStudied / daysInMonth) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Frequência Mensal</h1>
        <p className="text-zinc-400 mt-1">Marque os dias que você estudou</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-zinc-400">Dias Estudados</p>
          <p className="text-2xl font-bold text-white mt-1">{daysStudied}/{daysInMonth}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Aproveitamento</p>
          <p className="text-2xl font-bold text-white mt-1">{percentage}%</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Mês Atual</p>
          <p className="text-2xl font-bold text-white mt-1">{MONTHS[month - 1]} {year}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h2 className="text-lg font-semibold text-white">
            {MONTHS[month - 1]} {year}
          </h2>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="text-center text-xs text-zinc-500 font-medium py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isMarked = markedSet.has(String(day));
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() + 1 === month &&
              today.getDate() === day;

            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`
                  aspect-square rounded-xl text-sm font-medium transition-all duration-150
                  ${isMarked
                    ? "bg-violet-600 text-white hover:bg-violet-500"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  }
                  ${isToday ? "ring-2 ring-violet-400/50" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-violet-600" /> Marcado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white/5 ring-1 ring-white/10" /> Disponível
          </span>
        </div>
      </Card>
    </div>
  );
}
