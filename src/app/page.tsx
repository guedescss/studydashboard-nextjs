import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Visão geral do seu progresso de estudos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Horas Hoje", value: "0min", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Pomodoros Hoje", value: "0", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
          { label: "Tarefas Concluídas", value: "0/0", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Streak Atual", value: "0 dias", icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <svg className="w-8 h-8 text-violet-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-2">Timer Rápido</h2>
          <p className="text-zinc-400 text-sm">Inicie um Pomodoro ou registre uma distração.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white mb-2">Tarefas Ativas</h2>
          <p className="text-zinc-400 text-sm">Nenhuma tarefa ativa no momento.</p>
        </Card>
      </div>
    </div>
  );
}
