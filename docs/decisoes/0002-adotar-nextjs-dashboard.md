# ADR-0002 — Adoção de Next.js + TypeScript + Tailwind + Recharts no Dashboard

**Status:** Aceito
**Data da decisão:** 04/05/2026 (Sprint Planning 2)
**Data da formalização documental:** 16/05/2026
**Autores:** G04

## Contexto

A rubrica peso 9 da Sprint 2 inclui a raia de **Indicadores QoS/QoP (4 pts)** e exige a entrega de um **dashboard operacional** que permita visualizar métricas essenciais do desenvolvimento (cycle time, throughput, estado do backlog, identificação de gargalos, conforme escopo do TAPI §4 e §MVP item 4).

Durante a Sprint 2, o time precisou definir a stack do dashboard. Havia tensão a resolver: o avaliador da Sprint 1 sinalizou que "frente web é aceitável desde que justificada e separada por track de firmware", e o `dev-rules.md` inicial misturava convenções de front-end web e firmware embarcado sem distinção clara.

## Decisão

Adotar **Next.js 14+ (App Router) + TypeScript + Tailwind CSS + Recharts** como stack do dashboard operacional do Jacto Drones OS v0.1.

A frente web é tratada como **track distinto** do firmware embarcado:
- **Firmware embarcado** segue PX4 / C++ / Pixhawk / clang-tidy + Google C++ Style.
- **Dashboard web** segue Next.js / TS / Tailwind / Recharts / ESLint + Prettier.
- O `dev-rules.md` documenta regras separadas por track.

## Alternativas consideradas

- **Vanilla HTML/JS + Chart.js:** descartado — falta de tipagem dificulta manutenção a médio prazo; React/Next acelera composição de painéis (`/qos`, `/qop`, `/manager`).
- **Streamlit ou Dash (Python):** descartado — desalinhamento com o ecossistema do restante do projeto (TypeScript predominante em front-end); deploy em GitLab CI mais simples para Node.
- **Grafana puro:** descartado para a MVP — exige instância gerenciada e fonte de dados estruturada que ainda não temos; pode ser introduzido em sprints futuras quando os dados reais estiverem instrumentados.

## Trade-offs aceitos

- **~11k linhas de TS/JSON adicionadas** ao repo (`src/`) num projeto cujo foco principal é a esteira de CI/CD. Aceitamos o volume porque a rubrica peso 9 cobra o dashboard como entregável obrigatório.
- **Coexistência de stacks** (C++/firmware × TS/web) em um mesmo repositório. Mitigada pela separação clara em `dev-rules.md` e pelo isolamento de pastas (`src/` para web, futura pasta dedicada para firmware).
- **Dependência do ecossistema Node:** atualizações de Next.js / React podem exigir refactor pontual; mitigada por pinning de versões em `package.json` e linter estrito.

## Consequências

- Dashboards `/qos`, `/qop` e `/manager` implementados em Next.js, consumindo dados mock durante a Sprint 2 (substituídos por dados reais quando a instrumentação dos jobs PX4 SITL estiver consolidada na Sprint 3).
- O `dev-rules.md` separa regras por track (Firmware / Web / Dados).
- A tese de "frente web justificada e separada" do feedback da Sprint 1 fica formalizada por este ADR.
- Esta decisão atende ao princípio operacional permanente "Decisão técnica controversa exige ADR" derivado do feedback da Sprint 1.

## Referências

- Feedback formal do avaliador da Sprint 1 (30/04/2026) e conversa oral pós-feedback.
- `docs/dashboard-implementation-report.md`.
- `docs/dev-rules.md` (regras por track).
- `cards-da-semana/semana_04.json` (rubrica peso 9 da Sprint 2).
- Princípios operacionais permanentes do G04 (`guia/guia-v1.md`).
