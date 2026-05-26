"use client";

import { Badge } from "@/components/ui/Badge";
import { PRIORITY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Task } from "./types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
}

const priorityVariant: Record<string, "danger" | "warning" | "info"> = {
  alta: "danger",
  media: "warning",
  baixa: "info",
};

export function TaskCard({ task, onEdit, onDelete, onDragStart }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className="group bg-white/5 rounded-xl p-4 border border-white/5 hover:border-violet-500/30 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-zinc-100 leading-snug line-clamp-2">{task.title}</h3>
        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all p-0.5"
          aria-label="Delete task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge variant={priorityVariant[task.priority] ?? "default"}>
          {PRIORITY_LABELS[task.priority] ?? task.priority}
        </Badge>
        {task.estimatedPomodoros && (
          <Badge variant="default">{task.estimatedPomodoros} pomodoros</Badge>
        )}
      </div>

      {task.subject && (
        <p className="text-xs text-zinc-500 mb-1">{task.subject.name}</p>
      )}

      <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
        <span>{formatDate(task.createdAt)}</span>
        <button
          onClick={() => onEdit(task)}
          className="text-violet-400 hover:text-violet-300 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  );
}
