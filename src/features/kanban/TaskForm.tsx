"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import type { Task } from "./types";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  task?: Task | null;
  subjects: { id: string; name: string }[];
}

export function TaskForm({ open, onClose, onSubmit, task, subjects }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [status, setStatus] = useState("a_fazer");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setPriority(task?.priority ?? "media");
      setStatus(task?.status ?? "a_fazer");
      setEstimatedPomodoros(task?.estimatedPomodoros?.toString() ?? "");
      setSubjectId(task?.subjectId ?? "");
      setNotes(task?.notes ?? "");
    }
  }, [open, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onSubmit({
      title: title.trim(),
      description: description || null,
      priority,
      status,
      estimatedPomodoros: estimatedPomodoros ? parseInt(estimatedPomodoros, 10) : null,
      subjectId: subjectId || null,
      notes: notes || null,
    });
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? "Editar Tarefa" : "Nova Tarefa"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
          <Button onClick={handleSubmit} isLoading={loading} type="submit">
            {task ? "Salvar" : "Criar"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Digite o nome da tarefa" />

        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Descrição</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm min-h-[80px] resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição opcional"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Prioridade</label>
            <select
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Status</label>
            <select
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Pomodoros Estimados" type="number" min="0" value={estimatedPomodoros} onChange={(e) => setEstimatedPomodoros(e.target.value)} placeholder="Ex: 3" />

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Matéria</label>
            <select
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">Nenhuma</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Observações</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm min-h-[60px] resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações opcionais"
          />
        </div>
      </form>
    </Modal>
  );
}
