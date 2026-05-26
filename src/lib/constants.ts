export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "Pomodoro", href: "/pomodoro", icon: "timer" },
  { label: "Kanban", href: "/kanban", icon: "kanban" },
  { label: "Cronograma", href: "/schedule", icon: "schedule" },
  { label: "Frequência", href: "/frequency", icon: "calendar" },
  { label: "Diário", href: "/diary", icon: "diary" },
] as const;

export const POMODORO_PRESETS = [
  { label: "Foco", minutes: 25, type: "focus" },
  { label: "Pausa Curta", minutes: 5, type: "short_break" },
  { label: "Pausa Longa", minutes: 15, type: "long_break" },
] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const STATUS_LABELS: Record<string, string> = {
  a_fazer: "A Fazer",
  fazendo_hoje: "Fazendo Hoje",
  travado_pendente: "Travado / Pendente",
  concluido: "Concluído",
};

export const DAY_ORDER = [
  "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo",
];
