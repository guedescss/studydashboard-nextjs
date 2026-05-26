"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatMinutes } from "@/lib/utils";

interface DiaryEntry {
  id: string;
  date: string;
  liquidTimeMinutes: number;
  pomodoroCount: number;
  whatWasStudied: string | null;
  whatWasCompleted: string | null;
  difficulty: string | null;
  nextStep: string | null;
}

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "facil", label: "Fácil" },
  { value: "medio", label: "Médio" },
  { value: "dificil", label: "Difícil" },
];

const difficultyVariant: Record<string, "success" | "warning" | "danger"> = {
  facil: "success",
  medio: "warning",
  dificil: "danger",
};

export function DiaryPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [liquidTime, setLiquidTime] = useState("");
  const [pomodoroCount, setPomodoroCount] = useState("");
  const [whatWasStudied, setWhatWasStudied] = useState("");
  const [whatWasCompleted, setWhatWasCompleted] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [saving, setSaving] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/diary");
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  const loadTodayMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setLiquidTime(String(data.todayMinutes || ""));
      setPomodoroCount(String(data.todayPomodoros || ""));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    loadEntries();
    loadTodayMetrics();
  }, [loadEntries, loadTodayMetrics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSaving(true);

    const res = await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        liquidTimeMinutes: liquidTime ? parseInt(liquidTime, 10) : 0,
        pomodoroCount: pomodoroCount ? parseInt(pomodoroCount, 10) : 0,
        whatWasStudied: whatWasStudied || null,
        whatWasCompleted: whatWasCompleted || null,
        difficulty: difficulty || null,
        nextStep: nextStep || null,
      }),
    });

    if (res.ok) {
      toast("Diário salvo!", "success");
      loadEntries();
      setWhatWasCompleted("");
      setWhatWasStudied("");
      setNextStep("");
      setDifficulty("");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Diário de Estudos</h1>
        <p className="text-zinc-400 mt-1">Registre o que estudou e acompanhe seu progresso</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Novo Registro</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <Input label="Tempo Líquido (min)" type="number" min="0" value={liquidTime} onChange={(e) => setLiquidTime(e.target.value)} placeholder="Ex: 120" />
            <Input label="Pomodoros" type="number" min="0" value={pomodoroCount} onChange={(e) => setPomodoroCount(e.target.value)} placeholder="Ex: 4" />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">O que foi estudado</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm min-h-[60px] resize-none"
              value={whatWasStudied}
              onChange={(e) => setWhatWasStudied(e.target.value)}
              placeholder="Ex: Matemática - Revisão de trigonometria"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">O que foi concluído</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm min-h-[60px] resize-none"
              value={whatWasCompleted}
              onChange={(e) => setWhatWasCompleted(e.target.value)}
              placeholder="Ex: 20 exercícios resolvidos"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1 block">Dificuldade</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <Input label="Próximo Passo" value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="Ex: Revisar amanhã" />
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={saving}>Salvar Registro</Button>
          </div>
        </form>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Histórico ({entries.length})</h2>
        {entries.length === 0 ? (
          <Card>
            <p className="text-zinc-400 text-center py-8">
              Nenhum registro no diário ainda.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-white">
                      {formatDate(entry.date)}
                    </span>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="info">{formatMinutes(entry.liquidTimeMinutes)}</Badge>
                      <Badge variant="default">{entry.pomodoroCount} pomodoros</Badge>
                      {entry.difficulty && (
                        <Badge variant={difficultyVariant[entry.difficulty] ?? "default"}>
                          {DIFFICULTY_OPTIONS.find((o) => o.value === entry.difficulty)?.label ?? entry.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {entry.whatWasStudied && (
                  <p className="text-sm text-zinc-300 mb-1">
                    <span className="text-zinc-500">Estudou:</span> {entry.whatWasStudied}
                  </p>
                )}
                {entry.whatWasCompleted && (
                  <p className="text-sm text-zinc-300 mb-1">
                    <span className="text-zinc-500">Concluiu:</span> {entry.whatWasCompleted}
                  </p>
                )}
                {entry.nextStep && (
                  <p className="text-sm text-violet-400">
                    <span className="text-zinc-500">Próximo:</span> {entry.nextStep}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
