# Guia do Projeto — Módulo 10 — Jacto Drones OS v0.1

> **Versão:** v1
> **Branch:** `docs/guia-v1` (vive em branch própria; é rebaseada a partir de `main`/`develop` conforme o trabalho do projeto avança)
> **Criado em:** 2026-05-14 (Fluxo 1 — Setup Inicial em **modo catch-up parcial**: Sprint 1 já concluída e mergeada quando o guia nasceu)
> **Gerado a partir de:** `inteli-guia-kit` v1.1 (template + Fluxo 1 em modo catch-up).

## Propósito do Guia

Este guia é a **fonte de contexto operacional** para o desenvolvimento do projeto Jacto Drones OS v0.1, servindo dois leitores:

- **Humano** (líder técnico, grupo G04): decide direção, valida edições, aprova mudanças.
- **Agente IA de desenvolvimento**: lê este guia para executar contra os TGs (Task Groups) e DoD (Definition of Done) da sprint atual, e para responder consultas sobre o estado do projeto sem precisar re-derivar contexto do TAP toda vez.

O guia é mantido por agentes IA via 7 fluxos do `inteli-guia-kit` (Setup, Fim de Sprint, Pós-Feedback, Status Check, Reconciliação Inter-Branch, Pivotagem, Redistribuição). A cada sprint, o guia faz um bump de versão (`v1 → v2 → …`).

## Como Usar (3 passos)

1. Localize a sprint marcada como **`[ATUAL]`** no Bloco 2.
2. Se for sua primeira leitura, percorra o Bloco 1 (Contexto Fixo) e o pacote de onboarding.
3. Trabalhe contra os TGs e o DoD da sprint atual. Em caso de dúvida, consulte o documento principal (`docs/projeto.md`) e o TAP (`/Modulo10/M10-study/TAP_M10_Jacto_Drones.md`).

> **Nota da v1.** Hoje (2026-05-14) há um descasamento intencional entre guia e realidade: a **Sprint 1** está como `[CONSOLIDADA — feedback pendente]` e a **Sprint 2** como `[FUTURA PRELIMINAR]`, embora a Sprint 2 já esteja em curso no git (branches `docs-mapa-integracao` e `feat-controle-malha-fechada` ativas). Essa v1 do guia fecha apenas a Sprint 1; uma **v2** será criada subsequentemente (via Fluxo 2 ou Fluxo 1 catch-up) para promover a Sprint 2 para `[ATUAL]` a partir do documento de planejamento da Sprint 2.

## Regras de Ouro

- **Cumprir 100% do artefato com mínimo esforço.** Abordagens simples e elegantes. Alinhar (implícita ou explicitamente) com `docs/projeto.md` (documento principal avaliado).
- **Evitar complexidade desnecessária.** Não adicionar features além do que o artefato exige.
- **Análise de progresso/entrega parte SEMPRE do git.** Guia, doc principal e cards são representações; só o git é fato (P1 do kit).
- **Sprints consolidadas são memória histórica.** Não modificar (exceções nominais nos prompts do kit).

═══════════════════════════════════════════════════════════════════════
## BLOCO 1 — CONTEXTO FIXO
═══════════════════════════════════════════════════════════════════════

> Este bloco muda raramente. Pivotagens leves/médias não tocam aqui. Apenas pivotagens pesadas (mudança de conceito-chave do projeto) alteram este bloco.

### Contextualização do Projeto

#### Contexto institucional e recorte

Projeto desenvolvido pela turma 2026-1B-T13 do **Inteli** no **Módulo 10 — Esteira ágil de produção de software (CI/CD)**, em parceria com a **Jacto Drones**, unidade de São José dos Campos/SP da Jacto Máquinas Agrícolas S/A. A unidade é um time de P&D que está construindo **o primeiro produto proprietário da Jacto na vertical de drones**: hoje a empresa atua sobretudo como **revendedora de drones DJI** (programa de distribuição) e busca substituir essa dependência por **tecnologia proprietária** — com implicações claras de **soberania de dados**, redução de **dependência geopolítica** e mitigação de **risco regulatório**.

O **Grupo 04 (G04)** atua como camada de engenharia de software dessa estratégia, com recorte específico: **construir um protótipo funcional de um Operating System de continuous delivery para software de drones — o "OS v0.1"** — que organiza cadência, qualidade, automação e métricas de desenvolvimento, validado num caso pedagógico baseado no ecossistema open-source **Dronecode** (PX4 Autopilot + Gazebo + MAVLink + QGroundControl). Tudo o que o grupo entrega roda sobre código aberto + dados sintéticos; código proprietário, dados operacionais reais e o stack Matlab/Simulink interno da Jacto **estão fora do escopo** por restrição explícita do parceiro.

#### Desafio técnico do módulo

A Jacto Drones tem hoje **três frentes de desenvolvimento de software** que operam isoladas: (1) firmware embarcado (controle de voo, percepção, navegação), (2) plataforma do cliente (planejamento de missão, gestão de frota, pós-vendas), (3) plataforma de gestão e BI (telemetria, sistemas corporativos). Não existe um **sistema operacional unificado** que costure essas frentes em termos de cadência, critérios de qualidade, automação, integração contínua e métricas. O ecossistema atual é fragmentado: Notion, Word, Jira, Confluence e GitHub coexistem sem padronização, com rituais informais e atividades repetitivas manuais.

O nosso desafio técnico, portanto, é projetar e construir incrementalmente — ao longo de 5 sprints — uma **esteira de CI/CD funcional** que:

- Unifica o workflow de desenvolvimento (backlog, prioridades, estados, Definition of Done).
- Automatiza tarefas operacionais (templates, checklists, abertura automatizada de Problem Reports).
- Implementa um pipeline básico CI/CD (versionamento, build, validações, deploy controlado).
- Expõe um dashboard de métricas operacionais (cycle time, throughput, backlog health, métricas DORA).
- É demonstrável em um caso pedagógico realista de software para drones.

#### Objetivos operacionais

**Caso pedagógico escolhido pelo G04 (validado pelo parceiro na Sprint Review de 30/04/2026):** **digestão automatizada de logs `.ulg` do PX4**. A escolha foi feita após o workshop com o parceiro (24/04/2026), no qual o time técnico da Jacto (Vinícius/controle, Held/firmware) identificou a leitura manual de logs de voo como o gargalo mais quantificado do dia a dia deles: hoje gastam 2-3 dias por voo abrindo gráfico por gráfico em uma livraria Python caseira, sobre ~90 arquivos × ~120 parâmetros. A escolha foi confirmada na Sprint Review pelo próprio time técnico, que disse que **o parser `.ulg` já existe em livraria** (`pyulog`) — o valor que o G04 entrega não é reinventar parser, mas **orquestrar o loop fechado**: PR → build PX4 → simulação Gazebo → validação automática do `.ulg` → Problem Report no backlog.

**Vetores estratégicos cobrados pelo orientador acadêmico** (Reginaldo Arakaki, Sprint Review de 30/04/2026), a serem aterrissados ao longo das próximas sprints:

1. **"Como o rastro do processo ensina?"** — melhoria contínua rastreável. Cada novo critério do pipeline deve nascer de um incidente real (ADR mergeado *antes* do código que o implementa). Problem Report visível, versionado, ligado a regressão automática.
2. **Integridade do pipeline** — anti-corrupção e auditabilidade. Pedido nominal: *"Como sei que ninguém causou, por falta de conhecimento ou maldade, um problema? Como volta, acompanha, rastreia?"*. As normas (ISO 27001 A.5.21/A.8.28/A.8.31, DO-178C, assinatura digital de artefatos) já estão **citadas** nos docs entregues na Sprint 1, mas precisam virar **features demonstradas** do pipeline a partir da Sprint 2.

### Equipe e Distribuição de Trabalho

> Esta seção é fundamental: os fluxos write do kit usam estes dados para gerar planos de distribuição de tasks entre membros (P11). Sem ela preenchida, fluxos geram TGs sem atribuição de responsável.

#### Membros do grupo

Tabela canônica de identidades git para commits/PRs em nome de cada integrante. Os pares `user.name`/`user.email` abaixo são os que devem aparecer na autoria git de todo commit feito em nome do respectivo membro — independentemente de quem digitou o commit (ver "Convenções de Branch e Autoria" abaixo).

| Nome                       | Handle git (`user.name`)       | Email (`user.email`)                          |
|----------------------------|--------------------------------|-----------------------------------------------|
| Calebe Matias              | `Calebe Matias`                | `calebe.matias@sou.inteli.edu.br`             |
| Fernando Bertholdo         | `Fernando Bertholdo`           | `fernando.bertholdo@sou.inteli.edu.br`        |
| Kauan Massuia              | `Kauan Massuia`                | `kauan.massuia@sou.inteli.edu.br`             |
| Lucca Henrique Pereira     | `LuccaHP`                      | `lucca.pereira@sou.inteli.edu.br`             |
| Marlos Guedes              | `Marlos Guedes`                | `marlos.guedes@sou.inteli.edu.br`             |
| Otávio Vasconcelos         | `Otavio Vasconcelos`           | `otavio.vasconcelos@sou.inteli.edu.br`        |
| Vitor Balbo                | `Vitor Balbo`                  | `vitor.balbo@sou.inteli.edu.br`               |

#### Convenções de Branch e Autoria

- **Branch naming sugerido:** `<tipo>/<handle>/<tg-N-task-slug>` (tipos: `feature/`, `fix/`, `docs/`, `chore/`, `test/`).
  - Padrão observado na Sprint 1 não seguiu rigorosamente esse formato — branches reais incluíram `docs-gestao`, `feat-arquitetura-produto`, `docs/referencias-e-evidencias-do-parceiro`, `docs/planejamento-de-esteira`, `docs/design-ops`, `docs-mapa-integracao`, `feat-controle-malha-fechada`. A partir da Sprint 2, sugere-se padronizar (sem rigor excessivo — ajustar conforme conveniente).
- **Commit authorship:** o grupo trabalha em **sessões compartilhadas com o Claude** (assinatura dividida entre os integrantes), então é **esperado** que um membro digite o commit em nome de outro a partir da mesma máquina. O que importa é que a **autoria git registrada no commit reflita o autor lógico da task**, não quem digitou. Antes de cada commit, ajustar `user.name`/`user.email` para os valores da tabela acima — por commit (`git commit --author="Nome <email>"`), por sessão (`git -c user.name=... -c user.email=... commit`), ou alterando o `user.config` local temporariamente. Padrão observado e validado na Sprint 1 (branch `docs/design-ops`): os 10 commits dos 7 integrantes foram feitos a partir de uma única máquina, cada um assinado com a identidade correta.
- **PR/MR authorship:** dado o padrão de sessão compartilhada, qualquer membro pode abrir o PR/MR — preferencialmente o autor lógico da maior parte dos commits da branch. O que conta para rastreabilidade é a autoria dos commits, não do PR.
- **Política de revisão (preferência do grupo registrada em 2026-05-14):** **não ser estrito**. Priorizar **conciliação inter-branch** sobre cerimônia formal. Regra mínima sugerida: CI verde (quando existir pipeline, a partir da Sprint 2) + 1 revisão por membro diferente do autor **quando viável**. Em conflito de branches paralelas, acionar **Fluxo 5 (Reconciliação Inter-Branch)** do `inteli-guia-kit`.

#### Princípios de Distribuição (ordem de prioridade)

1. **Cobertura** — todos os 7 integrantes têm ≥1 task a cada sprint. Ninguém fica sem trabalho.
2. **Equilíbrio** — esforço comparável entre membros. Esforço explícito a partir da Sprint 2 para distribuir tasks com paridade entre os 7 integrantes, especialmente nas raias do artefato peso 9 que vão estruturar o pipeline executável.
3. **Expertise** — respeitar áreas observadas quando possível.
4. **Rotação** — ao longo das sprints, evitar concentrar o mesmo arquivo no mesmo membro.

Em caso de conflito entre princípios, a ordem decrescente prevalece.

### Pacote de Onboarding Rápido para Agentes IA

#### Ordem de leitura sugerida

1. **TAP — corpo + Anexos** — `/Users/fernandobertholdo/Documents/Inteli/Modulo10/M10-study/TAP_M10_Jacto_Drones.md`. Ler na ordem: corpo (problema, MVP, restrições), Anexo A (apresentação do parceiro: A.1 cliente, A.2 stack, A.3 gargalo de logs, A.4 diagrama do workflow, A.5 narrativa de soberania), Anexo B (workshop: B.1 time, B.2 stack detalhada, B.3 limites de acesso, B.4 priorização, **B.5 gargalo de logs em detalhe**, B.6 métricas faltantes, B.7 filosofia, B.8 vetor de foco recomendado).
2. **Slides da Sprint Review 1** — `/Users/fernandobertholdo/Documents/Inteli/Modulo10/M10-study/presentation/index.html`. 10 slides. Fixar atenção em: slide 4 (recorte de logs), slide 5 (gargalo em números), slide 6 (caso real da queda), slide 7 (workflow Jacto com costuras quebradas), slide 8 (onde nosso pipeline costura), slide 9 (roadmap Sprint 2-5), slide 10 (próximos passos).
3. **Documento principal avaliado** — `docs/projeto.md` (no próprio repo). Seções §4 (Arquitetura ISO 10746), §5 (Configuração da Esteira de Sistemas), §6 (Requisitos SCM).
4. **Documentos de referência** — `docs/referencias/mapeamento-ambiente-jacto.md` (ferramentas atuais da Jacto + integração GitLab) e `docs/referencias/normas-engenharia.md` (Dronecode + 10 normas ISO/IEC).
5. **Gestão de configuração detalhada** — `docs/gestao-configuração.md` (GitFlow, Conventional Commits, pipeline 5-stages, quality gates, IaC, DORA, rollback).
6. **Cards do módulo** — `/Users/fernandobertholdo/Documents/Inteli/Modulo10/M10-study/cards-da-semana/semana_NN.json`. Calendário canônico das 10 semanas, rubricas peso 9 e atividades ponderadas.

#### Notas importantes para evitar interpretações erradas

- **"Sprint" do projeto ≠ "Semana" do calendário Inteli.** As sprints duram 2 semanas. O que organiza a sprint são os marcos `Sprint Planning N → encontros de instrução → Sprint Review`. Sprint 1 = semanas 1-2 (22/04 → 30/04); Sprint 2 = semanas 3-4 (04/05 → 15/05); etc.
- **"Raias do workflow"** da Jacto (TAP §A.4) = 3 fluxos paralelos no diagrama do parceiro: Raia 1 — Model-Based Design (Matlab/Simulink); Raia 2 — Rigs de teste com versionamento (MIL → SIL → HIL/PIL); Raia 3 — Código tradicional estilo PX4. Os três fluxos compartilham backlog e Problem Reports.
- **"Envelope de voo"** = região operacional segura do drone, definida por variáveis físicas (massa, velocidade, aceleração). Fora dela, drone não voa de forma previsível.
- **"Log `.ulg`"** = formato canônico de log de voo do PX4 (ULog). É o **artefato central do nosso caso pedagógico**. Já existe parser oficial em Python (`pyulog`); o valor do nosso trabalho está acima do parsing.
- **Pixhawk vs. Jetson** = dois computadores embarcados no drone. Pixhawk roda RTOS (tempo real, controle de motores e energia); Jetson roda Linux (cargas pesadas como visão computacional). Não tratá-los como sinônimos.
- **PX4 do upstream = PX4 da Jacto.** Confirmado pelo Held na Sprint Review: a versão que o grupo baixa do upstream é a mesma que a Jacto usa em produção, inclusive simulador. "Não tem diferença na prática."
- **O foco é o processo, não o firmware.** O grupo *não* mexe em código de controle de voo. O objeto da esteira é o processo que cerca o desenvolvimento desse código (orquestração + log + critério + Problem Report).
- **"Avaliador" tem dois significados.** No `inteli-guia-kit`, "feedback do avaliador" = avaliação formal do artefato peso 9 (rubrica do prof. José Romualdo). Feedback de **Sprint Review com parceiro e orientador** (Reginaldo) é distinto e registrado em "Observações internas (retrospectiva)".
- **Sprint Review do M10 ≠ Sprint Review canônica do kit.** No kit, "Sprint Review" é o ritual final da sprint dentro do grupo. No M10, a "Sprint Review" do Inteli é a apresentação ao parceiro + orientador. As duas coisas convivem.

### Estrutura de Diretórios

Estrutura atual do repo `g04-gitlab` em `main` (após a Sprint 1):

```
g04-gitlab/
├── README.md                                    # overview do projeto, integrantes, professores
├── Cópia de TAPIOFICIAL_…docx.pdf               # TAP original em PDF (anexado por Marlos)
├── docs/
│   ├── index.md                                 # índice da documentação (com placeholders)
│   ├── projeto.md                               # ★ artefato peso 9 da Sprint 1 (ISO 10746)
│   ├── gestao-projeto.md                        # skeleton vazio (preencher por sprint)
│   ├── gestao-configuração.md                   # SCM detalhada (GitFlow, CI, DORA, Rollback)
│   ├── dev-rules.md                             # convenções de código (com débito de stack)
│   └── referencias/
│       ├── mapeamento-ambiente-jacto.md         # ferramentas Jacto + integração GitLab
│       └── normas-engenharia.md                 # Dronecode + 10 normas ISO/IEC
├── img/
│   └── diagrama_malha.png                       # Controle em Malha Fechada (referenciado em projeto.md §4.3)
├── guia/                                        # ★ este guia (branch docs/guia-v1)
│   └── guia-v1.md
└── .git/                                        # (várias branches — ver Histórico de branches abaixo)
```

**Estrutura futura prevista (a partir da Sprint 2, marcada como `(Placement)` no README.md):**

```
g04-gitlab/
├── src/
│   ├── core/                                    # scripts de automação da esteira
│   └── tests/
│       ├── unit/                                # nome_do_teste.py
│       └── integration/                         # nome_do_teste.py
├── .gitlab-ci.yml                               # pipeline de CI/CD GitLab
├── requirements.txt                             # dependências Python (pyulog, etc.)
└── …
```

**Histórico de branches da Sprint 1 (estado em 2026-05-14):**

| Branch                                          | Status           | Autor(es) principais            | Conteúdo                                                         |
|-------------------------------------------------|------------------|--------------------------------|------------------------------------------------------------------|
| `main`                                          | ativa            | (todos via merges de `develop`) | Estado consolidado da Sprint 1.                                  |
| `develop`                                       | ativa            | (todos)                        | Branch de integração contínua.                                   |
| `docs-gestao`                                   | mergeada         | Vitor                          | Template inicial + `gestao-configuração.md` (TG3 + TG5).         |
| `feat-arquitetura-produto`                      | mergeada         | Vitor                          | `docs/projeto.md` §4 + diagrama malha fechada (TG1).             |
| `docs/referencias-e-evidencias-do-parceiro`     | mergeada         | Marlos                         | `docs/referencias/*` + TAP PDF (TG4).                            |
| `docs/planejamento-de-esteira`                  | mergeada         | Otávio                         | `docs/projeto.md` §5 — Esteira de Sistemas (TG2).                |
| `docs/design-ops`                               | **não mergeada** | todos (Fernando, Marlos, Kauan, Otávio, Vitor, Calebe, Lucca) | `DESIGN_OPS.md` completo (ponderada peso 3 da Profª Julia, entrega 01/05/2026). |
| `docs-mapa-integracao`                          | **aberta — Sprint 2** | Vitor                       | Trabalho em curso da Sprint 2 (não escopo da v1).                |
| `feat-controle-malha-fechada`                   | **aberta — Sprint 2** | Vitor                       | CI pipeline config + commit hooks + MR template (Sprint 2).      |

### Documento Principal do Projeto

- **Path:** `docs/projeto.md`
- **Status:** existe, mergeado em `main` (entrega oficial da Sprint 1).
- **Estrutura observada:**

```
# (capa)
# 1. Introdução
# 2. Descrição do Problema
# 3. Objetivos
# 4. Arquitetura do Produto (ISO 10746)
#   4.1 Visão de Tecnologia
#   4.2 Visão de Engenharia
#   4.3 Controle em Malha Fechada
#   4.4 Aspectos Não Funcionais da Esteira
# 5. Configuração da Esteira de Sistemas
#   5.1 Visão Geral do Pipeline
#   5.2 Testes Funcionais (PX4 SITL/HITL, MAVLink, Validação de Missão)
#   5.3 Testes Não-Funcionais (SAST, gates de performance, escaneamento, assinatura)
#   5.4 Rastreabilidade Técnica (Notion → Jira → GitHub → GitLab → Jira → Notion)
#   5.5 Infraestrutura de Execução
# 6. Requisitos SCM
#   6.1 Políticas de Integração (GitFlow)
#   6.2 Fluxo de Promoção
#   6.3 Versionamento Semântico
#   6.4 Indicadores de Performance (DORA + Cycle Time + Lead Time + MTTR)
#   6.5 Definição de Pronto (DoD)
# 7. Referências
```

#### Seções-alvo por Sprint dentro do documento principal

| Sprint | Seção(ões) do `docs/projeto.md`                                                                   | Notas                                                                                          |
|--------|---------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| S1     | §4 + §5 + §6 + §7 (inteiras)                                                                      | **Entregue.**                                                                                  |
| S2     | Evolução de §5 (testes funcionais executáveis + SAST real) + §5.5 (runners reais)                 | Possível novo doc `docs/diagnostico-sprint-2.md` para a raia "Avaliação dos Resultados".       |
| S3     | Evolução de §5.4 (rastreabilidade do deploy) + §6.2 (Fluxo de Promoção real para CD)              | —                                                                                              |
| S4     | Integração: §5 inteira + §6 inteira amarradas em pipeline executável Dev+Deploy.                  | —                                                                                              |
| S5     | Doc separado: `docs/relatorio-executivo.md` (Diagnóstico + Esteira + Recomendações).              | —                                                                                              |

═══════════════════════════════════════════════════════════════════════
## BLOCO 2 — SPRINTS
═══════════════════════════════════════════════════════════════════════

### Sprint 1 — Gestão de Configuração — Produto e Processo (ISO 10746) [CONSOLIDADA — feedback pendente]

#### Objetivo

Entregar a **base de gestão de configuração e arquitetura da esteira** (segundo a norma ISO 10746 / RM-ODP), incluindo: definição do processo de desenvolvimento, mapeamento das ferramentas do parceiro, normas de referência (Dronecode + ISO/IEC), plano de pipeline em malha fechada, requisitos SCM (GitFlow, Conventional Commits, DORA Metrics, DoD), e organização do repositório como índice mestre de artefatos. Esta sprint é **integralmente documental** — entrega zero código executável; o pipeline real começa na Sprint 2 (marcado como `(Placement)` no README).

#### Plano de tasks original (do `Planejamento Sprint 1.md`, fornecido pelo grupo)

| TG | Descrição                                              | Tasks                                                                                  | Responsável original |
|----|--------------------------------------------------------|----------------------------------------------------------------------------------------|----------------------|
| 1  | Arquitetura do Produto (ISO 10746)                     | 1.1 Funcionalidades e Viewpoints; 1.2 Aspectos Não Funcionais; 1.3 Controle em Malha Fechada | **Vitor** (marcado "Feito" no plano) |
| 2  | Configuração da Esteira de Sistemas                    | 2.1 Plano de Testes Funcionais; 2.2 Testes Não Funcionais e Quality Gates; 2.3 Matriz de Rastreabilidade Técnica | (sem dono no plano) |
| 3  | Requisitos SCM (Integração e Deployment)               | 3.1 Políticas de Integração e Branching; 3.2 Fluxo de Promoção e Deployment; 3.3 Indicadores de Performance (DORA) | (sem dono no plano) |
| 4  | Referências e Evidências do Parceiro                   | 4.1 Mapeamento do Ambiente Jacto; 4.2 Normas de Engenharia                              | (sem dono no plano)  |
| 5  | Gestão de Ativos e Documentação (Índice de Artefatos)  | 5.1 Estruturação e Nomenclatura; 5.2 Índice Mestre; 5.3 Controle de Versão de Documentos | **Vitor** (marcado "Feito" no plano) |

#### Entregas mergeadas na `main` — cruzamento `git log` × plano

> Fonte: `git log main --no-merges --name-only` no repo. Datas são `git author date`. PRs/MRs identificadas pelos merge commits da `develop`.

| Commit       | Autor                | Data       | Arquivos                                                                       | TG  | Tasks cobertas                                  |
|--------------|----------------------|------------|--------------------------------------------------------------------------------|-----|-------------------------------------------------|
| `4694579`    | Vitor Balbo          | 2026-04-28 | `README.md`, `docs/dev-rules.md`, `docs/gestao-configuração.md`, `docs/gestao-projeto.md`, `docs/index.md`, `docs/projeto.md` | TG5 | 5.1, 5.2, 5.3 — template inicial + índice mestre |
| `380a916`    | Vitor Balbo          | 2026-04-28 | `README.md`, `docs/dev-rules.md`, `docs/gestao-configuração.md`, `docs/projeto.md` | TG3 | 3.1, 3.2, 3.3 — gestão de configuração inicial   |
| `2df9d90`    | Kauan Massuia (merge) | 2026-04-28 | (merge `docs-gestao → develop`)                                                | TG3+TG5 | Integração de TG3 e TG5 em develop          |
| `b79a267`    | Vitor Balbo          | 2026-04-28 | `docs/projeto.md`                                                              | TG1 | 1.1 + 1.2 — Section 4 (Arquitetura ISO 10746)    |
| `54dc56c`    | Vitor Balbo          | 2026-04-28 | `img/diagrama_malha.png`                                                       | TG1 | 1.3 — Modelagem de Controle em Malha Fechada     |
| `2437db1`    | Kauan Massuia (merge) | 2026-04-29 | (merge `feat-arquitetura-produto → develop`)                                   | TG1 | Integração de TG1 em develop                     |
| `e39e2f9`    | Marlos Guedes        | 2026-04-29 | `docs/index.md`, `docs/projeto.md`, `docs/referencias/mapeamento-ambiente-jacto.md`, `docs/referencias/normas-engenharia.md`, `Cópia de TAPIOFICIAL_….pdf` | TG4 | 4.1 + 4.2 + TAP do parceiro anexado              |
| `4fc49bc`    | Vitor Balbo (merge)  | 2026-04-29 | (merge `docs/referencias-e-evidencias-do-parceiro → develop`)                  | TG4 | Integração de TG4 em develop                     |
| `273c90d`    | Otávio Vasconcelos   | 2026-04-29 | `docs/projeto.md`                                                              | TG2 | 2.1 + 2.2 + 2.3 — Section 5 (Configuração da Esteira de Sistemas) |
| `33dd031`    | Vitor Balbo (merge)  | 2026-04-29 | (merge `develop → docs/planejamento-de-esteira`)                               | —   | Sincronização                                    |
| `b2d08e0`    | Vitor Balbo (merge)  | 2026-04-29 | (merge `docs/planejamento-de-esteira → develop`)                               | TG2 | Integração de TG2 em develop                     |
| `db697a9`    | Fernando Bertholdo (merge) | 2026-05-01 | (merge `develop → main`)                                                  | —   | **Merge final consolidando a Sprint 1 em `main`.** |

#### Mapeamento entregas ↔ rubrica peso 9 da Sprint 1

> Rubrica oficial (`cards-da-semana/semana_02.json`, ponderada "Gestão de Configuração de Software — Produto e Processo"): 10 pontos divididos em 4 raias.

| Raia da rubrica (peso 9 — total 10 pts)                         | Pts  | Onde foi entregue na `main`                                                                                  | TG do plano | Status |
|------------------------------------------------------------------|------|--------------------------------------------------------------------------------------------------------------|-------------|--------|
| **Arquitetura Produto (ISO 10746)** — Funcionalidades + Não-funcionais + Controle Malha Fechada de Requisitos | 3    | `docs/projeto.md` §4 (Viewpoints Tecnologia/Engenharia + §4.3 Malha Fechada + §4.4 Não-funcionais); `img/diagrama_malha.png` | TG1         | ✓      |
| **Configuração da Esteira de Sistemas** — Testes Funcionais + Não-funcionais + Rastreabilidade SC | 3    | `docs/projeto.md` §5 (Pipeline + Testes Func SITL/HITL/MAVLink + Não-Func SAST + §5.4 Rastreabilidade + §5.5 Infra) | TG2         | ✓      |
| **Requisitos SCM** — Integração + Deployment + Indicadores e Rastreabilidade SC | 3    | `docs/projeto.md` §6 (GitFlow + Fluxo de Promoção + SemVer + DORA + DoD); `docs/gestao-configuração.md` (reforço detalhado) | TG3         | ✓      |
| **Referências** — Evidências do ambiente do parceiro + Normas de Engenharia | 1    | `docs/projeto.md` §7; `docs/referencias/mapeamento-ambiente-jacto.md`; `docs/referencias/normas-engenharia.md`; `Cópia de TAPIOFICIAL_….pdf` | TG4         | ✓      |

**Cobertura da rubrica: 10/10 raias formalmente endereçadas.** A avaliação formal de pontuação ainda depende da rubrica do prof. José Romualdo — registrada como **feedback do avaliador pendente** (seção abaixo).

#### Resumo quantitativo

- **5 TGs planejados, 5 TGs entregues.**
- **13 commits totais em `main`** (4 commits de conteúdo não-merge + 6 merges + 1 inicial GitLab + 2 sincronizações de develop).
- **~1.628 linhas de markdown adicionadas** em `main`, distribuídas entre os 5 TGs.
- **7 branches da Sprint 1 criadas**, 4 mergeadas (`docs-gestao`, `feat-arquitetura-produto`, `docs/referencias-e-evidencias-do-parceiro`, `docs/planejamento-de-esteira`), 1 ainda não mergeada (`docs/design-ops` — entrega da ponderada peso 3 paralela).
- **8 arquivos finais em `main`** (excluindo TAP PDF e diagrama): `README.md`, `docs/index.md`, `docs/projeto.md`, `docs/gestao-projeto.md`, `docs/gestao-configuração.md`, `docs/dev-rules.md`, `docs/referencias/mapeamento-ambiente-jacto.md`, `docs/referencias/normas-engenharia.md`.

#### Padrões técnicos consolidados (memória institucional do projeto)

Decisões e padrões que **valem a partir da Sprint 1** e devem ser preservados nas próximas:

- **GitFlow** como modelo de branching (main / develop / feature/* / release/* / hotfix/*) — `gestao-configuração.md` §2.
- **Conventional Commits** como formato obrigatório de mensagens de commit — `gestao-configuração.md` §3.1.
- **Rastreabilidade obrigatória** via chave de tarefa (ex.: `JACTO-XXX`) no commit/PR — `gestao-configuração.md` §3.2 + `projeto.md` §5.4.
- **Pipeline 5-stages** (Lint → Build → Test → SAST → Package → Deploy) — `gestao-configuração.md` §4 + `projeto.md` §5.1.
- **Controle em Malha Fechada** como princípio arquitetural — `projeto.md` §4.3 + `img/diagrama_malha.png`. *Falhas detectadas pelos testes/SAST realimentam o backlog automaticamente; deploy abortado instantaneamente.*
- **ISO 10746 (RM-ODP)** como framework de descrição arquitetural — viewpoints Tecnologia e Engenharia adotados em `projeto.md` §4.
- **DORA Metrics** como linguagem oficial de indicadores de performance (Deployment Frequency, Lead Time for Changes, Change Failure Rate, MTTR) — `projeto.md` §6.4 + `gestao-configuração.md` §7.
- **PX4 SITL/HITL + MAVLink + QGroundControl** como pilha de validação do caso pedagógico — `projeto.md` §5.2 + `referencias/normas-engenharia.md` §2.
- **ISO 27001:2022** como guia de segurança de cadeia de suprimentos (A.5.21 SBOM, A.8.28 codificação segura, A.8.31 separação de ambientes) — `referencias/normas-engenharia.md` §3.4.
- **Time to Feedback < 15 min** como meta não-funcional do pipeline — `projeto.md` §4.4.
- **Assinatura digital + SBOM** obrigatórios para todo artefato promovido — `projeto.md` §4.4 + §5.3.
- **Pixhawk (RTOS) + Jetson (Linux)** como modelo de separação real-time / soft-real-time — `referencias/normas-engenharia.md` §2.3.

#### Documentação consolidada (paths absolutos)

- `g04-gitlab/docs/projeto.md` — documento principal avaliado.
- `g04-gitlab/docs/gestao-configuração.md` — gestão de configuração detalhada.
- `g04-gitlab/docs/referencias/mapeamento-ambiente-jacto.md` — ferramentas atuais Jacto + estratégia de integração.
- `g04-gitlab/docs/referencias/normas-engenharia.md` — Dronecode + 10 normas ISO/IEC + mapeamento norma↔stage do pipeline.
- `g04-gitlab/img/diagrama_malha.png` — diagrama do Controle em Malha Fechada.
- `g04-gitlab/Cópia de TAPIOFICIAL_….pdf` — TAP do parceiro anexado.

#### DoD verificado (inferido da rubrica peso 9 + plano de tasks)

> Cada item checado contra a entrega real em `main`. Inferido por não haver DoD esquemático no `Planejamento Sprint 1.md`.

- [x] **TG1 cumprido:** Arquitetura ISO 10746 com Viewpoints Tecnologia e Engenharia (`projeto.md` §4.1 + §4.2), Controle em Malha Fechada documentado + diagrama (`§4.3` + `img/diagrama_malha.png`), Aspectos Não-Funcionais definidos (`§4.4`).
- [x] **TG2 cumprido:** Plano de Testes Funcionais (`§5.2` — SITL/HITL/MAVLink), Testes Não-Funcionais e Quality Gates (`§5.3` — SAST, performance, escaneamento, assinatura), Matriz de Rastreabilidade Técnica (`§5.4`).
- [x] **TG3 cumprido:** Políticas de Integração e Branching (`§6.1` + `gestao-configuração.md` §2 GitFlow), Fluxo de Promoção e Deployment (`§6.2`), Indicadores DORA (`§6.4`).
- [x] **TG4 cumprido:** Mapeamento Ambiente Jacto (`docs/referencias/mapeamento-ambiente-jacto.md`), Normas de Engenharia (`docs/referencias/normas-engenharia.md`).
- [x] **TG5 cumprido:** Estruturação e Nomenclatura (estrutura `docs/` + `img/` + `referencias/`), Índice Mestre (`docs/index.md`, com débito de placeholders), Controle de Versão de Documentos (Git + Conventional Commits — `gestao-configuração.md` §3).
- [x] **Rubrica peso 9 (10/10 raias) endereçada formalmente** — ver mapeamento acima.

#### Itens pendentes

> Esses débitos foram identificados na revisão pós-merge (2026-05-01) e devem ser absorvidos como tasks da Sprint 2.

- **`DESIGN_OPS.md` não mergeado em `main`.** O documento está completo na branch `docs/design-ops` (todos os 7 integrantes contribuíram) e foi entregue como ponderada peso 3 da Profª Julia Stateri em 01/05/2026. Continua aguardando merge para `main`. *Ação proposta:* mergear na primeira oportunidade da Sprint 2 (não exige rebase complexo — branch isolada que toca apenas o arquivo `DESIGN_OPS.md` na raiz).
- **`docs/dev-rules.md` com stack errada.** Convenções listam camelCase, Jest, Cypress, ESLint, Angular, JavaScript/TypeScript — mas o projeto é **Python + C/C++** (PX4 firmware). O próprio `referencias/normas-engenharia.md` cobra clang-tidy + Google C++ Style Guide + GTest/Catch2 + MAVSDK. **Risco:** inconsistência detectável em qualquer leitura cruzada da banca. *Ação proposta:* reescrever cedo na Sprint 2.
- **`docs/gestao-projeto.md` vazio.** Estrutura criada (Avaliação Sprints 1-5, Análise de Riscos, Post Mortem), todos os campos com `_conteúdo_`. Confirmar se é skeleton intencional. *Ação proposta:* preencher §2.1 (avaliação da Sprint 1) cedo, enquanto a fonte está fresca.
- **`docs/index.md` com placeholders.** Ainda tem `<nome do projeto>` e `<nome do grupo>` literais. Link para `gestao-configuracao.md` (sem `ç`) diverge do nome real `gestao-configuração.md` (com `ç`) — pode quebrar em alguns renderizadores.
- **Inconsistência de nome do projeto.** "Jacto Drones Operating System v0.1" em uns docs, "Jacto Drones OS v0.1" em outros, "Jacto Drones OS · v0.1" na apresentação. *Ação proposta:* padronizar como "Jacto Drones OS v0.1" (forma mais usada nos slides e no README).

#### Observações internas (retrospectiva — Sprint Review 1 com parceiro Jacto + orientador Reginaldo, 30/04/2026)

> Conteúdo bruto da Sprint Review apresentada para Vinícius (controle), Held (firmware) e Tamires (gestão) da Jacto, mais o orientador Reginaldo Arakaki. Texto preservado em citações literais (P10 do kit).

**Validações dadas pelo time técnico da Jacto:**

1. **Foco em logs validado, com ressalva sobre parsing.** O Held confirmou: *"hoje o que eu vejo, os a questão de abrir e extrair eles é feito, mas é feito manualmente, na livraria"*. Implicação: o `pyulog` da comunidade resolve o parser; o valor que o G04 entrega está **acima** do parsing.
2. **Versão PX4 do upstream = versão da Jacto, inclusive simulador.** Pergunta do grupo: *"a versão que a gente baixa, o comando no repositório agora, é a mesma que vocês usam, em produção hoje?"*. Resposta: *"Sim. E o simulador? Também. Não tem diferença na prática."* Elimina risco de stack não-representativa.
3. **Confirmação de que o foco é o processo, não o firmware.** Fala final do grupo: *"o foco não é o firmware em si. Importa é como esse processo… o dado não está pegando"*. Validado pela Jacto.

**Cobranças nominais do orientador Reginaldo Arakaki** (vão direcionar as próximas sprints):

1. **Eixo 1 — "Como o rastro do processo ensina?"** *"Por exemplo mostrar de que jeito que, como que a gente não repete 1 problema? De que jeito que o rastro do processo ensina? Então, é explorar bem isso daí também. A história da melhoria contínua."* — exige aterrissar: cada novo critério do pipeline nasce de um incidente real (ADR antes do código), Problem Report versionado, regressão automática garantida.
2. **Eixo 2 — Integridade do pipeline.** *"Como é que eu sei que alguém não causou, ou por falta de conhecimento ou por maldade ou algo estranho mesmo no processo, como é que você volta, ou acompanha ou rastreia? Não deixa aqui cuidar."* — pedido direcionado nominalmente ao Fernando. Outros grupos estão atacando integridade. As normas já estão **citadas** nos docs (ISO 27001 A.5.21/A.8.28/A.8.31, DO-178C, assinatura digital), mas precisam virar **features demonstradas**: commit signing (GPG), branch protection ativa, Gitleaks no pre-commit, SAST + Trivy bloqueando severities Altas/Críticas, SBOM (syft/`docker sbom`) por imagem, audit log do GitLab consultável.
3. **Reforço sobre simulação SITL.** *"Quando a gente fala em simulação, para nós no mundo da do pessoal da Jato é, por exemplo você pega 1 versão e estraga 1 componente lá, no ambiente, não é, ele vai voar tudo na rua."* — implica que a esteira precisa **mostrar cenários destrutivos rodados em SITL** comprovando o valor do gate, não só caminho feliz.

#### Feedback do avaliador

> [aguardando avaliação formal do artefato peso 9 — rubrica do prof. José Romualdo. Feedback substantivo do **orientador Reginaldo Arakaki** e do **parceiro Jacto** na Sprint Review de 30/04/2026 está preservado em "Observações internas (retrospectiva)" acima e em "Decisões Tomadas Durante a Sprint Atual" (Bloco 3). Atualizar esta seção via Fluxo 3 (Pós-Feedback) quando a avaliação formal chegar.]

#### Recomendações derivadas

> [pendente até feedback formal. No entanto, os dois eixos do Reginaldo (rastro / integridade) e as 3 validações do parceiro Jacto já estão registrados em "Decisões Tomadas Durante a Sprint Atual" (Bloco 3) como direcionamento assumido pelo grupo a partir da Sprint 2.]

---

### Sprint 2 — Configuração Esteira de CI [FUTURA PRELIMINAR]

> Esta seção será **promovida para `[ATUAL]`** na próxima iteração do guia, a partir do documento de planejamento da Sprint 2 (a ser fornecido pelo grupo) + análise git das branches `docs-mapa-integracao` e `feat-controle-malha-fechada` (já abertas pelo Vitor em 2026-05-05).

#### Objetivo [preliminar]

Construir a **esteira CI executável** que materializa, em código e pipeline, o que a Sprint 1 entregou em documento. Concretamente: **PR → build PX4 → simulação Gazebo SITL → validação automática do `.ulg` → SAST → gates de quality**, aterrissando os 3 pilares da rubrica peso 9 da Sprint 2 (Serviços de Integração + Indicadores QoS/QoP + Avaliação dos Resultados).

#### Prioridades (P0/P1/P2) [preliminar — citações dos cards da semana + rubrica peso 9]

**P0 — Crítico para passar no artefato peso 9 da Sprint 2** (rubrica oficial em `cards-da-semana/semana_04.json`, card "Configuração Esteira de CI", peso 9, total 10 pts):

- *"Serviços de Integração [4 pts]: 1 — Mapa de Cobertura de Funcionalidades; 2 — Mapa de Cobertura de Não Funcionalidades; 3 — Mapa de Cobertura da Integração; 4 — Controle em Malha Fechada da Integração Contínua."*
- *"Indicadores de QoS e QoP [4 pts]: 1 — Testes funcionais; 2 — Indicadores de Produto; 3 — Indicadores de Processo; 4 — Indicadores Gerais."*
- *"Avaliação dos Resultados [2 pts]: 1 — Diagnóstico (qualitativo e quantitativo); 2 — Melhoria do Projeto (qualitativo e quantitativo)."*

**P1 — Conteúdo programático da Sprint 2** (semanas 3 e 4 do M10):

- *Aula CI parte 1: etapas locais* (José Romualdo, 11/05): hooks Git, Husky, Gitleaks (shift-left de validação), Docker, Dockerfile, Trivy (CVE em imagens).
- *Aula CI com foco em SAST e segurança* (José Romualdo, 13/05): GitLab SAST, twelve-factor, OWASP Top 10.
- *Aula Métricas de processo de software* (José Romualdo, 28/04 da Sprint 1 mas aplicação real na Sprint 2): DORA, Four Keys, SRE.
- *Aula Qualidade de software e IA no processo* (José Romualdo, 07/05): clean code, code review GitHub, SAST.

**P2 — Aterrissagem dos eixos do Reginaldo (não cobrados pela rubrica peso 9 da S2, mas obrigatórios pela orientação)**:

- **Vetor "integridade"** (Eixo 2 do Reginaldo) — commit signing GPG, branch protection em `main`/`develop`, Gitleaks no pre-commit, SAST + Trivy bloqueando severities Altas/Críticas, SBOM por imagem promovida.
- **Vetor "rastro que ensina"** (Eixo 1 do Reginaldo) — ADR para cada novo critério de validação de log (vibração média + defasagem comando/execução como os dois primeiros), referenciando o caso real da queda compartilhado pelo Held no workshop (Anexo B.5 do TAP).

#### Estado do git no início da Sprint 2 (descoberta automática em 2026-05-14)

Sprint 2 já está em execução. Branches ativas com trabalho da Sprint 2 (autor: Vitor, datas 2026-05-05):

- `docs-mapa-integracao` — 3 commits (`chore: minor changes to gitlab`, `docs: adiciona imagem da malha fechada`, `docs: adiciona documentação do fluxo de integração`).
- `feat-controle-malha-fechada` — 6 commits (inclui `chore: setup project CI/CD pipeline, commit hooks, and merge request templates`, `feat: add merge request template and CI artifact documentation file`, `docs: add CI pipeline configuration artifact with integration services and QoS/QoP metrics`).

Esses commits **não estão refletidos** nesta seção preliminar — a promoção para `[ATUAL]` na próxima versão do guia vai integrar esse trabalho como ponto de partida da Sprint 2.

---

### Sprint 3 — Configuração Esteira de CD [FUTURA PRELIMINAR]

#### Objetivo [preliminar]

Estender a esteira CI para **CD** (Continuous Deployment), levando o artefato validado a um ambiente de staging/simulação controlado, com gates de deploy (rastreabilidade, assinatura, SBOM, escaneamento) e métricas de deploy (Deployment Frequency, Lead Time for Changes).

#### Prioridades (P0/P1/P2) [preliminar — citações dos cards da semana + rubrica peso 9]

**P0** (rubrica oficial `cards-da-semana/semana_06.json`, card "Configuração da esteira de CD", peso 9, total 10 pts):

- *"Serviços de Deploy [4 pts]: 1 — Mapa de Cobertura de Funcionalidades; 2 — Mapa de Cobertura de Não Funcionalidades; 3 — Mapa de Cobertura de Deploy; 4 — Controle em Malha Fechada da Deploy."*
- *"Indicadores de QoS e QoP [4 pts]: 1 — Indicadores de Testes funcionais; 2 — Indicadores de Produto; 3 — Indicadores de Processo; 4 — Indicadores Gerais."*
- *"Avaliação dos Resultados [2 pts]: 1 — Diagnóstico; 2 — Melhoria do Projeto."*

**P1** (conteúdo das semanas 5 e 6):

- *Continuous Deployment com GitHub Actions e AWS* (Hermano, 19/05) — ponderada peso 4 paralela.
- *DesignOps + Design System* (Julia, 21/05) — extensão do trabalho de DesignOps da Sprint 1.
- *Métricas pipeline CI/CD: Prometheus + Grafana* (José Romualdo, 22/05).
- *Testes de integração bem feitos* (Hermano, 26/05) — ponderada peso 2 paralela.

**P2**:

- Evolução dos vetores Reginaldo: integridade no deploy (assinatura, SBOM, audit log), rastro do deploy (ADR para cada gate).

---

### Sprint 4 — CI + CD Integração [FUTURA PRELIMINAR]

#### Objetivo [preliminar]

Integrar CI + CD em **um único pipeline coeso**, ponta-a-ponta (Dev + Deploy), com **dashboard real** consumindo as métricas DORA e os indicadores de saúde dos critérios de validação de log (vibração, defasagem, etc.). Esta é a sprint onde o "dashboard" do MVP do TAP entra de fato.

#### Prioridades (P0/P1/P2) [preliminar — citações dos cards da semana + rubrica peso 9]

**P0** (rubrica oficial `cards-da-semana/semana_08.json`, card "Esteira de CI e CD (Integração)", peso 9, total 10 pts):

- *"Serviços de Deploy [4 pts] (Dev e Deploy): 1 — Mapa de Cobertura de Funcionalidades; 2 — Mapa de Cobertura de Não Funcionalidades; 3 — Mapa de Cobertura de Dev e Deploy; 4 — Controle em Malha Fechada de Dev e Deploy."*
- *"Indicadores de QoS e QoP [4 pts] (Dev e Deploy)."*
- *"Avaliação dos Resultados [2 pts]."*

**P1** (conteúdo das semanas 7 e 8):

- *Performance de código: Prometheus + Grafana* (Hermano, 03/06) — ponderada peso 2 paralela.
- *Coloração de Grafos* (Pizzo, 09/06) — ponderada peso 2 (matemática discreta — agendamento de pipeline jobs).
- *REACH framework em UX* (Julia, 10/06) — ponderada peso 2 paralela (mede DesignOps).
- *Terraform / IaC* (José Romualdo, 11/06) — ponderada peso 2 paralela.

**P2**:

- Dashboard com "saúde por raia" (referência aos slides do projeto): % de voos simulados que passaram critério X, vibração média por sprint, defasagem máxima observada, tempo do build até log gerado, cycle time consolidado.

---

### Sprint 5 — Relatório Executivo CI/CD + Apresentação Final [FUTURA PRELIMINAR]

#### Objetivo [preliminar]

Fechar o módulo com **Relatório Executivo da esteira CI/CD** (diagnóstico inicial + esteira final + recomendações) e **Apresentação Final** ao parceiro Jacto. Esta é a sprint do "post-mortem" do projeto inteiro e do "loop fechado" pleno (Problem Report retorna ao backlog automaticamente — slide 9 da apresentação da Sprint 1 mapeia isso explicitamente).

#### Prioridades (P0/P1/P2) [preliminar — citações dos cards da semana + rubrica peso 9]

**P0** (rubrica oficial `cards-da-semana/semana_10.json`, card "Relatório Executivo Esteira CI/CD", peso 9, total 10 pts):

- *"Diagnóstico Inicial [4 pts]: 1 — Automações de testes e deploy; 2 — Mapa da Arquitetura do Sistema; 3 — Mapa da Automação de Integração e Deploy; 4 — Mapa de Controle em Malha Fechada da Esteira."*
- *"Esteira de CI/CD e Automações [4 pts]: 1 — Indicadores de Testes funcionais; 2 — Indicadores de Produto (Dev e Deploy); 3 — Indicadores de Processo; 4 — Indicadores Gerais."*
- *"Recomendações [2 pts]: 1 — Recomendações de Treinamento (Arq e Processo); 2 — Recomendações de Arquitetura e Processo."*

**P1** (conteúdo das semanas 9 e 10):

- *SRE — Princípios e práticas* (Hermano, 16/06).
- *Design Playbook* (Julia, 23/06).
- *Ética organizacional* (Cláudio, 24/06).
- **Prova do Módulo (peso 20) em 19/06/2026** — não é entrega de sprint, mas concorre com o tempo de projeto.

**P2**:

- Recomendações específicas para a Jacto sobre como evoluir o OS v0.1 para um OS de produção real (Sprint 5 = transferência de conhecimento + roadmap).
- Conexão final entre os eixos do Reginaldo (rastro + integridade) e o capítulo de Recomendações.

═══════════════════════════════════════════════════════════════════════
## BLOCO 3 — META-GOVERNANÇA
═══════════════════════════════════════════════════════════════════════

### Calendário de Sprints

> Extraído de `cards-da-semana/semana_NN.json`. As datas marcam Sprint Planning (início) e Sprint Review (fim). Tolerância padrão para janela de `git log`: ±2 dias.

| Sprint | Início     | Fim        | Sprint Review        | Artefato peso 9                                          |
|--------|------------|------------|----------------------|----------------------------------------------------------|
| S1     | 2026-04-22 | 2026-04-30 | 2026-04-30           | Gestão de Configuração — Produto e Processo (ISO 10746)  |
| S2     | 2026-05-04 | 2026-05-15 | 2026-05-15           | Configuração Esteira de CI                               |
| S3     | 2026-05-18 | 2026-05-29 | 2026-05-29           | Configuração Esteira de CD                               |
| S4     | 2026-06-01 | 2026-06-12 | 2026-06-12           | Esteira de CI e CD (Integração)                          |
| S5     | 2026-06-15 | 2026-06-26 | 2026-06-26 (Final)   | Relatório Executivo Esteira CI/CD                        |

**Marcos paralelos:** Prova do Módulo (peso 20) em **2026-06-19**.

### Contrato de Evidência (PASS/FAIL)

> Esta seção **evolui a partir da Sprint 2**, quando RF/RNF/INT começam a ser aferidos pela esteira real. Na Sprint 1 fica como placeholder, com esboço dos dois critérios preliminares discutidos no slide 10 da apresentação.

#### Esboço inicial (a confirmar com Vinícius/Held antes de virar Definition of Done — slide 10 da apresentação)

| ID    | Critério                  | Como aferir                                                                                  | Limiar PASS (provisório) |
|-------|---------------------------|----------------------------------------------------------------------------------------------|--------------------------|
| LOG-1 | Vibração média            | Média do parâmetro de vibração no `.ulg` gerado pela simulação Gazebo SITL                  | A definir com Vinícius/Held |
| LOG-2 | Defasagem comando/execução | Diferença temporal/angular entre setpoint e resposta observada no `.ulg`                    | A definir com Vinícius/Held |

#### Separação de papéis (a definir a partir da Sprint 2)

[Quem captura evidência? Quem valida? Quem reporta? — a definir conforme pipeline real.]

#### Matriz padrão de rastreabilidade (a definir a partir da Sprint 2)

| Item | Driver/Requisito | Implementação | Evidência | Status |
|------|------------------|---------------|-----------|--------|

### Planejamento por Papel / Regra de Merge

**Preferência do grupo registrada em 2026-05-14:** **não ser estrito**. Priorizar conciliação inter-branch sobre cerimônia formal.

- **Regra mínima sugerida:** CI verde (quando o pipeline existir, a partir da Sprint 2) + 1 revisão por membro diferente do autor **quando viável**. Não bloquear merge por ausência de revisão se a Sprint estiver sob pressão de prazo — preferir registrar a decisão em "Decisões Tomadas" e seguir.
- **Em conflito de branches paralelas** (problema típico observado já na Sprint 1, onde Vitor concentrou 3 TGs em paralelo): acionar **Fluxo 5 (Reconciliação Inter-Branch)** do `inteli-guia-kit` antes de mergear. O fluxo lê branches paralelas e sugere ordem de merge minimizando conflito + acoplamento.
- **Em redistribuição de tasks mid-sprint** (sobrecarga, bloqueio, mudança de equipe): acionar **Fluxo 7 (Redistribuição)** do `inteli-guia-kit`.

### Checklist Transversal (usar em toda sprint a partir da S2)

- [ ] Testes passam sem regressão.
- [ ] Sem secrets hardcoded (Gitleaks no pre-commit verifica).
- [ ] `docs/projeto.md` atualizado na seção da sprint corrente.
- [ ] Evidências geradas e referenciadas (matriz de rastreabilidade preenchida).
- [ ] DoD da sprint verificado item a item.
- [ ] **Pipeline completo < 15 min** (limite não-funcional do `projeto.md` §4.4).
- [ ] **Chave de tarefa (`JACTO-XXX` ou equivalente) no título do PR e nos commits** (Conventional Commits + Smart Commits — `gestao-configuração.md` §3).
- [ ] **Commits assinados (GPG) quando a política for ativada** (provavelmente Sprint 2 ou 3).
- [ ] **SBOM gerado para cada imagem promovida** (a partir da Sprint 2 ou 3).

### Governança do Guia

- **Versão atual:** v1.
- **Versionamento:** 1 versão por sprint atual. Bump no **Fluxo 2 (Fim de Sprint)** do `inteli-guia-kit`.
- **Branch dedicada:** `docs/guia-v1` (esta). A partir da v2, o nome da branch acompanha a versão (`docs/guia-v2`, etc.), e é **rebaseada a partir de `main`/`develop`** conforme necessário para refletir o estado do projeto.
- **Exceção:** pivotagem pesada → bump excepcional `vN-pivot` (Fluxo 6 com severidade pesada).
- **Política de doc avaliado** (`docs/projeto.md`): nenhum fluxo edita proativamente. Setup pôde criar/observar; outros fluxos verificam consistência ou sinalizam.
- **Fluxos do kit aplicáveis a esta fase do projeto:**
  - **Próximo natural:** Fluxo 2 (Fim de Sprint) ou Fluxo 1 catch-up para promover Sprint 2 para `[ATUAL]`.
  - **Sob demanda:** Fluxo 4 (Status Check, read-only) a qualquer momento dentro da sprint.
  - **Quando feedback formal chegar:** Fluxo 3 (Pós-Feedback) atualiza Sprint 1 para `[CONSOLIDADA]`.

### Referências Utilizadas na Construção deste Guia

- **TAP M10** — `/Users/fernandobertholdo/Documents/Inteli/Modulo10/M10-study/TAP_M10_Jacto_Drones.md` (corpo + Anexo A apresentação do parceiro + Anexo B workshop com Q&A).
- **Transcrição do workshop com a Jacto** — `uploads/transcription__Inteli M10 - Workshop parceiro JACTO Drones.txt` (24/04/2026).
- **Transcrição da Sprint Review 1** — `uploads/transcription__M10 Sprint 1 review.txt` (30/04/2026).
- **Slides da Sprint Review 1** — `/Users/fernandobertholdo/Documents/Inteli/Modulo10/M10-study/presentation/index.html` (10 slides).
- **Cards da semana** — `/Users/fernandobertholdo/Documents/Inteli/Modulo10/M10-study/cards-da-semana/semana_01.json` a `semana_10.json` (calendário, rubricas peso 9, ponderadas).
- **`Planejamento Sprint 1.md`** — documento apartado de planejamento da Sprint 1 (5 TGs com 15 tasks).
- **Repositório `g04-gitlab`** — `git log` em `main` e nas 8 branches relevantes da Sprint 1.
- **`inteli-guia-kit` v1.1** — `/Users/fernandobertholdo/Documents/Inteli/inteli-guia-kit/` (template + 7 prompts + design-spec).

### Decisões Tomadas Durante a Sprint Atual

| Data       | Origem                     | Decisão                                                                                                                                       | Seções afetadas |
|------------|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| 2026-05-14 | adoção tardia              | Guia adotado retroativamente após a Sprint 1 entregue (30/04/2026) e a Sprint 2 já em curso. Plano apartado (`Planejamento Sprint 1.md`) preservado como histórico paralelo. Sprint 1 reconstruída a partir do estado git + plano + rubrica peso 9; Sprint 2 deixada como `[FUTURA PRELIMINAR]` por escolha do grupo, para promoção em rodada subsequente quando o documento de planejamento da Sprint 2 estiver disponível. | Todas           |
| 2026-04-24 | aprendizado (workshop Jacto) | **Foco em logs `.ulg` do PX4 como caso pedagógico do OS v0.1.** Decisão baseada em três fatores: (a) gargalo mais quantificado pelo time técnico da Jacto (2-3 dias/voo manual, 90 arq × 120 params); (b) custos concretos (R$ 700k/drone, 3-4 meses microcontrolador); (c) caso real de queda por defasagem não detectada compartilhado pelo Held. | Sprint 1 (validação), Sprint 2-5 (incrementos) |
| 2026-04-30 | validação parceiro (Sprint Review) | Parceiro Jacto **confirmou foco em logs** e **derrubou três incertezas técnicas**: (1) parser `.ulg` já existe em livraria (`pyulog`) — valor está acima do parsing; (2) PX4 upstream = PX4 da Jacto, inclusive simulador, sem diferença na prática; (3) o objeto da esteira é o processo, não o firmware. | Sprint 2-5 (escopo e direção) |
| 2026-04-30 | feedback orientador (Reginaldo) | **Eixo 1 — "Como o rastro do processo ensina?"** Cobrado nominalmente. Aterrissar em ADRs por critério novo, post-mortems versionados, regressão automática. | Sprint 2-5 (todas) |
| 2026-04-30 | feedback orientador (Reginaldo) | **Eixo 2 — Integridade do pipeline.** Pedido nominal ao Fernando (*"Não deixa aqui cuidar"*). Aterrissar em commit signing, branch protection, Gitleaks, SAST+Trivy, SBOM, audit log. | Sprint 2-5 (todas) |
| 2026-05-14 | preferência do grupo       | **Política de revisão e merge não-estrita.** Priorizar conciliação inter-branch sobre cerimônia formal. Regra mínima: CI verde + 1 revisor diferente quando viável. Acionar Fluxo 5 do kit em conflito de branches paralelas. | Bloco 1 (Equipe), Bloco 3 (Planejamento por Papel) |

---

**Fim da v1 do guia.** Próxima ação prevista: promoção da Sprint 2 para `[ATUAL]` em uma `guia-v2.md`, mediante (a) recebimento do feedback formal da avaliação peso 9 da Sprint 1 e (b) compartilhamento do documento de planejamento da Sprint 2.
