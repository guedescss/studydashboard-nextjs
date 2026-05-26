"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { DAY_ORDER } from "@/lib/constants";

interface Subject {
  id: string;
  name: string;
}

interface ScheduleBlock {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  objective: string | null;
  status: string;
  subject: { id: string; name: string } | null;
}

interface BlockForm {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  objective: string;
  status: string;
}

const STATUS_OPTIONS = ["Planejado", "Em Andamento", "Concluido", "Cancelado"];

const initialForm: BlockForm = {
  dayOfWeek: "Segunda",
  startTime: "14:00",
  endTime: "15:00",
  subjectName: "",
  objective: "",
  status: "Planejado",
};

export function SchedulePage() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlockForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchBlocks() {
    const r = await fetch("/api/schedule");
    const d = await r.json();
    setBlocks(d.blocks);
  }

  async function fetchSubjects() {
    const r = await fetch("/api/subjects");
    const d = await r.json();
    setSubjects(d.subjects);
  }

  useEffect(() => {
    Promise.all([fetchBlocks(), fetchSubjects()]).finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  }

  function openEdit(block: ScheduleBlock) {
    setEditingId(block.id);
    setForm({
      dayOfWeek: block.dayOfWeek,
      startTime: block.startTime,
      endTime: block.endTime,
      subjectName: block.subject?.name ?? "",
      objective: block.objective ?? "",
      status: block.status,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.dayOfWeek || !form.startTime || !form.endTime) {
      toast("Preencha dia, horário inicio e fim", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const r = await fetch(`/api/schedule/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!r.ok) throw new Error();
        toast("Bloco atualizado", "success");
      } else {
        const r = await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!r.ok) throw new Error();
        toast("Bloco criado", "success");
      }
      setModalOpen(false);
      await fetchBlocks();
      await fetchSubjects();
    } catch {
      toast("Erro ao salvar bloco", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const r = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast("Bloco excluído", "success");
      setDeletingId(null);
      await fetchBlocks();
    } catch {
      toast("Erro ao excluir bloco", "error");
    }
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cronograma Semanal</h1>
          <p className="text-zinc-400 mt-1">Seu planejamento de estudos da semana</p>
        </div>
        <Button onClick={openCreate}>+ Novo Bloco</Button>
      </div>

      {blocks.length === 0 && (
        <Card>
          <p className="text-zinc-400 text-center py-8">
            Nenhum bloco de estudo planejado. Clique em &quot;Novo Bloco&quot; para começar.
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
              {day === todayName && <Badge variant="info">Hoje</Badge>}
            </div>
            <div className="space-y-2">
              {dayBlocks.map((block) => (
                <div
                  key={block.id}
                  className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-violet-400">
                      {block.startTime} - {block.endTime}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(block)}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
                        title="Editar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingId(block.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                        title="Excluir"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {block.subject?.name ?? "Sem matéria"}
                    </p>
                    {block.objective && (
                      <p className="text-xs text-zinc-500 mt-0.5">{block.objective}</p>
                    )}
                  </div>
                  <div>
                    <Badge variant={block.status === "Planejado" ? "info" : block.status === "Em Andamento" ? "warning" : block.status === "Concluido" ? "success" : "default"}>
                      {block.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {dayBlocks.length === 0 && (
                <p className="text-xs text-zinc-600 text-center py-4">Nenhum bloco</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Bloco" : "Novo Bloco"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Dia da Semana</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-200"
            >
              {DAY_ORDER.map((day) => (
                <option key={day} value={day} className="bg-zinc-900">{day}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Horário Início"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              label="Horário Fim"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Matéria</label>
            <select
              value={form.subjectName}
              onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-200"
            >
              <option value="" className="bg-zinc-900">Nenhuma</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name} className="bg-zinc-900">{s.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Objetivo"
            placeholder="Ex: Estudo principal"
            value={form.objective}
            onChange={(e) => setForm({ ...form, objective: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-200"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-zinc-900">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Excluir Bloco"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => deletingId && handleDelete(deletingId)}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-zinc-300">
          Tem certeza que deseja excluir este bloco do cronograma?
        </p>
      </Modal>
    </div>
  );
}
