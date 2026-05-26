# StudyDashboard

Dashboard de estudos com Pomodoro, Kanban, Cronograma Semanal, Frequência Mensal e Diário de Estudos — tudo integrado com banco de dados PostgreSQL via Prisma ORM.

## Sobre o Projeto

Este é um **upgrade** de um projeto anterior feito com Vanilla JS + Express + CSV — onde tudo era em páginas HTML puras, sem rotas ou componentização.

A versão atual foi reescrita com tecnologias modernas para melhor desempenho, escalabilidade e organização do código. O principal diferencial é o uso do **Next.js com API Routes**, que substitui o backend separado em Express: cada funcionalidade (Pomodoro, Kanban, Diário) tem seu próprio endpoint, acessado por rotas específicas, enquanto no projeto antigo tudo era servido em HTML estático sem separação entre frontend e backend.

- **Next.js 16** (App Router) — Frontend + API Routes próprias
- **React 19** — Componentes modulares e reutilizáveis
- **Prisma ORM 7** — Camada de banco de dados
- **PostgreSQL (Supabase)** — Persistência remota
- **Tailwind CSS 4** — Estilização com design system dark/glassmorphism

## Funcionalidades

| Feature | Descrição |
|---|---|
| **Dashboard** | Métricas em tempo real: horas de estudo, pomodoros, tarefas concluídas |
| **Pomodoro Timer** | Timer circular SVG com 3 modos (Foco 25min, Pausa Curta 5min, Pausa Longa 15min), sons, vínculo com tarefas e contador de distrações |
| **Kanban Board** | 4 colunas com drag-and-drop, criação/edição de tarefas, prioridades, estimativas e vínculo com matérias |
| **Cronograma Semanal** | Grade com blocos de estudo por dia da semana, destaque do dia atual |
| **Frequência Mensal** | Calendário interativo clicável com estatísticas de dias estudados |
| **Diário de Estudos** | Formulário com auto-preenchimento das métricas do dia e histórico completo |

## Como Rodar

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Edite .env com sua DATABASE_URL do PostgreSQL

# Rodar migrations e seed
npx prisma migrate deploy
npm run seed

# Iniciar dev server
npm run dev
```

Acesse `http://localhost:3000`.

## Stack

Next.js · React · TypeScript · Prisma ORM · PostgreSQL · Tailwind CSS
