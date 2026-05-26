"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { COLUMNS } from "./types";
import type { Task } from "./types";

export function KanbanPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const [tasksRes, subjectsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/subjects"),
      ]);
      const { tasks: t } = await tasksRes.json();
      const { subjects: s } = await subjectsRes.json();
      setTasks(t);
      setSubjects(s ?? []);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = useCallback(
    async (data: Partial<Task>) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast("Tarefa criada!", "success");
        loadTasks();
      }
    },
    [loadTasks, toast]
  );

  const handleEdit = useCallback(
    async (data: Partial<Task>) => {
      if (!editingTask) return;
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast("Tarefa atualizada!", "success");
        setEditingTask(null);
        loadTasks();
      }
    },
    [editingTask, loadTasks, toast]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Tarefa removida", "info");
        loadTasks();
      }
    },
    [loadTasks, toast]
  );

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      setDragOverColumn(null);
      const taskId = e.dataTransfer.getData("taskId");
      if (!taskId) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === columnId) return;

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: columnId }),
      });

      if (res.ok) {
        toast(`Tarefa movida para ${COLUMNS.find((c) => c.id === columnId)?.label ?? columnId}`, "success");
        loadTasks();
      }
    },
    [tasks, loadTasks, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  }, []);

  const getColumnTasks = (columnId: string) =>
    tasks.filter((t) => t.status === columnId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kanban</h1>
          <p className="text-zinc-400 mt-1">Gerencie suas tarefas de estudo</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setShowForm(true); }}>
          + Nova Tarefa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column.id);
          return (
            <div
              key={column.id}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={() => setDragOverColumn(null)}
              className={`
                transition-all duration-200 rounded-2xl p-3 min-h-[200px]
                ${dragOverColumn === column.id ? "bg-violet-500/10 ring-2 ring-violet-500/40" : ""}
              `}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold text-zinc-300">{column.label}</h2>
                <span className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                    onDelete={handleDelete}
                    onDragStart={handleDragStart}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-white/5 rounded-xl">
                    Arraste tarefas aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleEdit : handleCreate}
        task={editingTask}
        subjects={subjects}
      />
    </div>
  );
}
