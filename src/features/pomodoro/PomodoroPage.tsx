"use client";

import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const CIRCUMFERENCE = 2 * Math.PI * 120;

const MODE_ICON = {
  focus: "M13 10V3L4 14h7v7l9-11h-7z",
  short_break: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  long_break: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
};

export function PomodoroPage() {
  const timer = usePomodoroTimer();

  const modeLabels: Record<string, string> = {
    focus: "Foco",
    short_break: "Pausa Curta",
    long_break: "Pausa Longa",
  };

  const dashOffset = CIRCUMFERENCE - timer.progress * CIRCUMFERENCE;

  const timeDisplay = `${String(timer.minutes).padStart(2, "0")}:${String(timer.seconds).padStart(2, "0")}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Pomodoro</h1>
        <p className="text-zinc-400 mt-1">Timer de foco com técnica Pomodoro</p>
      </div>

      <div className="flex flex-col items-center">
        <Card className="w-full max-w-md">
          <div className="flex justify-center gap-2 mb-8">
            {(["focus", "short_break", "long_break"] as const).map((mode) => (
              <Button
                key={mode}
                variant={timer.mode === mode ? "primary" : "secondary"}
                size="sm"
                onClick={() => timer.switchMode(mode)}
              >
                {modeLabels[mode]}
              </Button>
            ))}
          </div>

          <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle
                cx="128" cy="128" r="120"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <circle
                cx="128" cy="128" r="120"
                fill="none"
                stroke={timer.mode === "focus" ? "#8b5cf6" : timer.mode === "short_break" ? "#34d399" : "#60a5fa"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-mono text-white tracking-wider">
                {timeDisplay}
              </span>
              <span className="text-sm text-zinc-400 mt-2 capitalize">
                {modeLabels[timer.mode]}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {timer.status === "running" ? (
              <Button onClick={timer.pauseTimer} variant="secondary" size="lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pausar
              </Button>
            ) : (
              <Button
                onClick={timer.startTimer}
                size="lg"
                disabled={timer.status === "completed"}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {timer.status === "idle" ? "Iniciar" : "Continuar"}
              </Button>
            )}
            <Button onClick={timer.resetTimer} variant="ghost" size="lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
            <Button onClick={timer.skipTimer} variant="ghost" size="lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          {timer.tasks.length > 0 && (
            <div className="mb-4">
              <label className="text-sm text-zinc-400 mb-1 block">Vincular à tarefa</label>
              <select
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                value={timer.taskId ?? ""}
                onChange={(e) => timer.setTaskLink(e.target.value || null)}
              >
                <option value="">Nenhuma</option>
                {timer.tasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <Button variant="ghost" size="sm" onClick={timer.addDistraction}>
              +1 Distração
            </Button>
            {timer.distractionCount > 0 && (
              <Badge variant="warning">{timer.distractionCount} distrações</Badge>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 w-full max-w-md">
          <Card>
            <p className="text-sm text-zinc-400">Sessões hoje</p>
            <p className="text-xl font-bold text-white mt-1">{timer.sessionsToday}</p>
          </Card>
          <Card>
            <p className="text-sm text-zinc-400">Modo atual</p>
            <p className="text-xl font-bold text-white mt-1 capitalize">{modeLabels[timer.mode]}</p>
          </Card>
          <Card>
            <p className="text-sm text-zinc-400">Status</p>
            <p className="text-xl font-bold text-white mt-1 capitalize">
              {timer.status === "idle" ? "Parado" : timer.status === "running" ? "Rodando" : timer.status === "paused" ? "Pausado" : "Concluído"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
