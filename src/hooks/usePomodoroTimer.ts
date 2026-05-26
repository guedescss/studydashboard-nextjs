"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

type TimerStatus = "idle" | "running" | "paused" | "completed";

interface TimerState {
  mode: "focus" | "short_break" | "long_break";
  status: TimerStatus;
  secondsRemaining: number;
  totalSeconds: number;
  distractionCount: number;
  taskId: string | null;
  notes: string;
}

interface PomodoroConfig {
  focus: number;
  short_break: number;
  long_break: number;
}

const DEFAULT_CONFIG: PomodoroConfig = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export function usePomodoroTimer(config: PomodoroConfig = DEFAULT_CONFIG) {
  const { toast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([]);

  const [state, setState] = useState<TimerState>(() => ({
    mode: "focus",
    status: "idle",
    secondsRemaining: config.focus,
    totalSeconds: config.focus,
    distractionCount: 0,
    taskId: null,
    notes: "",
  }));

  const playSound = useCallback((frequency: number, duration: number) => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const osc = audioRef.current.createOscillator();
      const gain = audioRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioRef.current.destination);
      osc.frequency.value = frequency;
      gain.gain.value = 0.15;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, audioRef.current.currentTime + duration);
      osc.stop(audioRef.current.currentTime + duration);
    } catch { /* noop */ }
  }, []);

  const loadSessionData = useCallback(async () => {
    try {
      const res = await fetch("/api/pomodoro");
      const data = await res.json();
      setSessionsToday(data.sessions.length);
      setTasks(data.tasks ?? []);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  const saveSession = useCallback(async () => {
    try {
      const now = new Date();
      await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: Math.round(state.totalSeconds / 60),
          type: state.mode,
          taskId: state.taskId,
          completed: true,
          distractionCount: state.distractionCount,
          notes: state.notes || null,
          startTime: null,
          endTime: now.toISOString(),
          date: now.toISOString(),
        }),
      });
      await loadSessionData();
    } catch { /* noop */ }
  }, [state, loadSessionData]);

  const startTimer = useCallback(() => {
    if (state.status === "completed") return;
    setState((prev) => ({ ...prev, status: "running" }));
  }, [state.status]);

  const pauseTimer = useCallback(() => {
    setState((prev) => ({ ...prev, status: "paused" }));
  }, []);

  const resetTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "idle",
      secondsRemaining: config[prev.mode],
      totalSeconds: config[prev.mode],
      distractionCount: 0,
      notes: "",
    }));
  }, [config]);

  const skipTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "completed",
      secondsRemaining: 0,
    }));
  }, []);

  const switchMode = useCallback(
    (mode: TimerState["mode"]) => {
      setState((prev) => ({
        ...prev,
        mode,
        status: "idle",
        secondsRemaining: config[mode],
        totalSeconds: config[mode],
        distractionCount: 0,
        taskId: null,
        notes: "",
      }));
    },
    [config]
  );

  const addDistraction = useCallback(() => {
    setState((prev) => ({ ...prev, distractionCount: prev.distractionCount + 1 }));
  }, []);

  const setTaskLink = useCallback((taskId: string | null) => {
    setState((prev) => ({ ...prev, taskId }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  useEffect(() => {
    if (state.status !== "running") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.secondsRemaining <= 1) {
          playSound(880, 0.5);
          setTimeout(() => playSound(660, 0.3), 200);
          saveSession();
          toast(
            prev.mode === "focus" ? "Pomodoro concluído!" : "Pausa concluída!",
            "success"
          );
          return { ...prev, secondsRemaining: 0, status: "completed" };
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.status, playSound, saveSession, toast]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(state.secondsRemaining / 60);
  const seconds = state.secondsRemaining % 60;
  const progress = state.totalSeconds > 0
    ? (state.totalSeconds - state.secondsRemaining) / state.totalSeconds
    : 0;

  return {
    ...state,
    minutes,
    seconds,
    progress,
    sessionsToday,
    tasks,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchMode,
    addDistraction,
    setTaskLink,
    setNotes,
  };
}
