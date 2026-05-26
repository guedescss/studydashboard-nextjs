export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  estimatedPomodoros: number | null;
  subjectId: string | null;
  subject: { name: string } | null;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const COLUMNS = [
  { id: "a_fazer", label: "A Fazer" },
  { id: "fazendo_hoje", label: "Fazendo Hoje" },
  { id: "travado_pendente", label: "Travado / Pendente" },
  { id: "concluido", label: "Concluído" },
] as const;
