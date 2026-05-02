# Plano de DesignOps — Jacto Drones OS v0.1

> **Grupo 04 · Módulo 10 (CI/CD) · Sprint 1**
> **Parceiro:** Jacto · **Produto:** Jacto Drones OS v0.1 — esteira de engenharia para o primeiro firmware proprietário da Jacto (substituindo a revenda de drones DJI por soberania técnica sobre produto, dados e pós-venda).
> **Documento:** Plano operacional de DesignOps aplicado à nossa esteira de CI/CD.
> **Entrega:** Atividade Ponderada — Profª Julia Stateri — 01/05/2026.

---

## 1. Introdução e Objetivo

Este documento define o plano de DesignOps do Jacto Drones OS v0.1, articulando pessoas, processos, ferramentas, métricas e pontos de integração com a esteira de CI/CD do projeto. Adotamos a leitura apresentada pela profª Julia Stateri de que **"DesignOps é o DevOps do Design"** [1] [2]: uma infraestrutura cultural, operacional e técnica que permite ao trabalho de design fluir com a mesma rastreabilidade, automação e cadência do código. No nosso contexto, isso vale tanto para o design de **interface UX/UI** quanto para o **design de software** [2], porque a experiência final não depende apenas de telas, mas também de fluxos de engenharia, critérios de validação e artefatos que passam por merge requests, builds, simulações e evidências auditáveis.

O DesignOps se justifica no projeto em três frentes complementares:

1. **Design do software**. O foco do Módulo 10 está na construção de uma esteira confiável para desenvolvimento e validação do firmware. Na Sprint 1, o produto operacional é o fluxo PR → build PX4 → simulação Gazebo → log `.ulg` validado; na Sprint 5, a previsão é evoluir esse caminho para um Problem Report automatizado. Esse desenho não é apenas implementação de pipeline: é design do fluxo de trabalho de engenharia, pois define como uma mudança técnica nasce, é validada, comunica falhas e se torna evidência para decisão [3].
2. **Dashboard de visibilidade**. A Sprint 4 prevê uma interface real de acompanhamento da saúde por raia e do cycle time da esteira. Essa entrega exige decisões consistentes de UX/UI, tokens, componentes versionados, regressão visual e acessibilidade. Sem DesignOps, o dashboard tenderia a depender de inspeção manual e acordos informais; com DesignOps, cada decisão visual passa a ter fonte, critério e verificação no mesmo ambiente em que o código evolui.
3. **Identidade visual herdada**. O parceiro já traz uma linguagem institucional que precisa ser preservada: Jacto Blue `#0a5193`, Jacto Orange `#ec6608`, paper `#f5f3ee`, tipografia Archivo e JetBrains Mono. No plano, essa identidade vira fonte de verdade visual, não apenas referência estética. O papel do DesignOps é manter a passagem do mock à produção sem retrabalho manual, garantindo que a marca da Jacto permaneça consistente nos artefatos do projeto.

O objetivo desta seção é estabelecer que decisões de design, sejam visuais, de fluxo ou de critério de aceitação, devem se transformar em **artefatos versionáveis no GitLab** e fluir pela esteira sem fricção operacional [3]. Isso implica responsabilidades claras, métricas de impacto auditáveis pelo framework REACH [4] e portas explícitas de integração com o pipeline já existente da Sprint 1. A intenção é reduzir ambiguidade entre Design, Dev, firmware e parceiro, fazendo com que cada decisão relevante possa ser rastreada, revisada e validada como parte do ciclo de entrega. Esta seção foi redigida com base nos Anexos A.1 e A.4 do TAP [7] e na apresentação de Sprint Review do grupo [6].

**Responsável: Calebe Matias**

---

## 2. Como Trabalhamos Juntos (Pessoas)

Esta seção responde ao pilar 1 do "menu de DesignOps" da NN/g [1] — *como o time se organiza para que o design escale sem virar gargalo*. Nosso time tem 7 integrantes e opera em sprints curtas com a Jacto e os docentes do Inteli como stakeholders externos. Dado o tamanho reduzido do grupo, a estrutura de trabalho foi pensada para ser enxuta, rotativa e documentada, evitando que qualquer função crítica dependa de uma única pessoa.

### 2.1 Papéis e Responsabilidades

Como o grupo é pequeno e cada integrante acumula múltiplos chapéus, adotamos **papéis funcionais rotativos por sprint**, em vez de cargos fixos. Essa escolha se justifica pela observação de que "DesignOps em times pequenos não é centro de operações, é cargo difuso" [2]. A rotação distribui a carga de conhecimento, reduz o risco de gargalos individuais e mantém o time engajado em diferentes frentes do projeto, conectando-se diretamente ao eixo **Health** do framework REACH [4] e combatendo o anti-padrão da NN/g de deixar uma única pessoa como "única fonte de verdade" [1].

| Papel | Responsabilidade central na esteira | Quando é acionado |
|---|---|---|
| **UX/UI Lead (rotativo)** | Custódia do Design System, validação de UI antes do merge | Toda MR que toca componentes do dashboard ou identidade Jacto |
| **Dev Lead (rotativo)** | Garante que tokens/componentes sejam consumíveis pelo código (PX4 toolchain + dashboard React/HTML) | Todo MR de UI ou pipeline |
| **DevOps/DesignOps Engineer (rotativo)** | Automação de assets, build de Storybook, regressão visual no GitLab CI | Manutenção contínua + setup de nova ferramenta |
| **Critérios de Voo Owner** | Traduz regras de aceitação de log `.ulg` em código de validação; equivalente ao "DesignOps" da camada de design de software | A cada novo critério proposto pela Jacto |
| **PO de Sprint** | Ponte com parceiro/orientadores; conduz a Validação de Critério (ver §2.2) | Toda Sprint Planning e Review |

A definição desses papéis é intencionalmente funcional: não há hierarquia fixa, apenas responsabilidades claras que se alternam a cada sprint, garantindo que todos os membros desenvolvam visão tanto de produto quanto de operação.

### 2.2 Rituais de Colaboração

Os rituais do Inteli (Daily, Planning, Review, Retro) [2] são a espinha dorsal da nossa comunicação. Sobre essa base, adicionamos três rituais específicos para reduzir fricção entre Design, Dev e o parceiro:

- **Design-Critério Sync (15 min, semanal)** — UX Lead + Dev Lead + Critério Owner alinham protótipos do dashboard e novos critérios de log. Resolve a fricção Dev↔Design ao forçar um encontro curto e recorrente [3].
- **Validação de Critério com a Jacto (sob demanda)** — Todo critério novo é validado com Vinícius e Held *antes* de virar PR, conforme a prática apresentada no slide 10 da Sprint Review.
- **Design Review no MR (assíncrono, gate de merge)** — Toda MR que toca `dashboard/`, `tokens/` ou `scripts/log_validation/` exige aprovação adicional do UX/UI Lead da sprint corrente. Isso transforma o Design Review em parte do pipeline, não em um passo opcional [1].

Esses rituais mantêm o time alinhado sem adicionar sobrecarga burocrática, aproveitando a cadência já existente dos eventos Scrum.

### 2.3 Handover Design ↔ Dev

O handover acontece **dentro do próprio GitLab**, não por links externos efêmeros. Seguimos 4 passos rastreáveis:

1. **Issue com label `design:proposed`** — registra a intenção da mudança e abre o rastreamento.
2. **Artefato fonte** (Figma frame, mock, ADR) anexado à issue ou linkado em `docs/design/` — materializa o que foi decidido.
3. **MR referencia a issue** (`Closes #N`) — o Design Review acontece no próprio MR, com comentários contextualizados.
4. **Para mudanças no dashboard**, o Storybook do branch é publicado automaticamente (ver Seção 5); a URL aparece no comentário do MR como evidência visual.

Essa abordagem segue a recomendação da NN/g de "documentar o handover" [1] e a orientação do template de usar Issues/MRs do GitLab para registrar *o porquê* de uma mudança [3], criando memória institucional acessível a todos os membros e stakeholders.

**Responsável: Marlos Guedes**

---

## 3. Como o Trabalho é Feito (Processos e Ferramentas)

Esta seção responde ao pilar 2 do "menu de DesignOps" [1] — *padronização de ferramentas, processos e inteligência compartilhada*. É onde a analogia "DesignOps = DevOps do Design" se materializa em código versionado [2]. A seção tem duas frentes:
- **3.1** trata das ferramentas e da padronização (fonte de verdade).
- **3.2** trata do fluxo concreto Design-to-Code dentro da esteira.

### 3.1 Ferramentas Utilizadas e Padronização

#### Ferramentas

| Categoria | Ferramenta | Função no projeto | Por que esta |
|---|---|---|---|
| Design (UI) | **Figma** (plano gratuito) | Mock-ups do dashboard de Sprint 4, biblioteca Jacto | Recomendado pela profª como "versão gratuita ampla que vocês podem usar" [2] |
| Tokens | **Tokens Studio (plugin Figma)** + `design/tokens.json` | Sync Figma↔Git via PR automático | Repositório como fonte de verdade |
| Repositório | **GitLab da Inteli** | Único home de código, docs e tokens | "Tudo focado no GitLab" [2] |
| Documentação viva | **Storybook** | Publicado em GitLab Pages a cada merge | Atende "inteligência compartilhada" do pilar 2 [1] |
| Modelagem do firmware | **PX4 Autopilot** + **QGroundControl (QGC)** + **Gazebo** | Design do software embarcado | Em uso desde a Sprint 1 |
| Logs | Formato **`.ulg`** (PX4) [5] + scripts Python | Costura Dev↔Validação↔Backlog | Slide 8 da Sprint Review |
| Acessibilidade | **axe-core** integrado ao CI | WCAG 2.1 AA | Critério em 4.1 |

#### Padronização e Harmonização

- **Design System "Jacto Drones OS DS"** vive em dois lugares espelhados: (i) biblioteca Figma versionada com SemVer; (ii) pacote interno `@jacto-drones/ui` no GitLab Package Registry. Releases anunciados via `CHANGELOG.md` no monorepo.
- **Tokens de Design** ficam em `design/tokens.json` (cores, spacing, tipografia, raios). Job de CI gera `src/styles/tokens.css` e `src/styles/tokens.ts` em cada merge na `develop`. Inclua o JSON inicial em bloco markdown:

```json
{
  "color": {
    "ink":    "#1f2227",
    "paper":  "#f5f3ee",
    "blue":   "#0a5193",
    "orange": "#ec6608"
  },
  "type": {
    "display": "Archivo",
    "mono":    "JetBrains Mono"
  }
}
```

- **Inteligência compartilhada** [1] (pilar 2 NN/g): além do Storybook, manter `docs/adr/` (Architecture Decision Records) tanto para decisões de software quanto de design. Resposta ao alerta da Julia em [2]: "cada um cuida de uma coisa, e não existe um momento de alinhamento geral".

**Responsável: Kauan Massuia**

---

### 3.2 Fluxo de Integração Design-to-Code

O fluxo abaixo é a tradução concreta da analogia "DesignOps é o DevOps do Design" [3]: cada etapa é um artefato versionado, com revisão e rastro no GitLab — exatamente como qualquer mudança de código. O projeto opera dois fluxos paralelos, um para a interface (dashboard de Sprint 4) e outro para o design do software embarcado (camada de critérios de validação de log [5]). Apesar de tratarem de objetos diferentes, ambos seguem a mesma anatomia: artefato versionado → gate automatizado → review humano nominal → rastreabilidade no MR.

**Fluxo A — UI (dashboard Sprint 4 e adiante).** Começa no Figma e termina em produção, com gates intermediários no pipeline GitLab CI:

```
[1] PROTÓTIPO NO FIGMA
       │  Branch Figma + componente atualizado na biblioteca Jacto Drones OS DS
       ▼
[2] EXPORT DE TOKENS (Tokens Studio plugin)
       │  Plugin abre PR automático em GitLab com diff de design/tokens.json
       ▼
[3] REVISÃO DO PR DE TOKENS
       │  UX/UI Lead aprova; CI gera tokens.css + tokens.ts
       ▼
[4] IMPLEMENTAÇÃO DO COMPONENTE / TELA
       │  Dev consome tokens; commit segue Conventional Commits
       ▼
[5] STORYBOOK BUILD + REGRESSÃO VISUAL (CI)
       │  Snapshot publicado; diff visual > 0.1% bloqueia merge
       ▼
[6] DESIGN REVIEW NO MR
       │  UX/UI Lead aprova visualmente; Dev Lead aprova tecnicamente
       ▼
[7] MERGE NA develop
       │  Storybook publicado em GitLab Pages
       ▼
[8] DEPLOY DO DASHBOARD
```

**Fluxo B — Software embarcado (camada PX4/Gazebo/log).** Começa numa proposta de critério de voo e termina num critério executável que bloqueia merges quando falha:

```
[A] CRITÉRIO DE VOO PROPOSTO (issue com label `criterio:proposto`)
       │  Validado com engenheiros Jacto (Vinícius/Held) — slide 10 [6]
       ▼
[B] CRITÉRIO VIRA CÓDIGO (scripts/log_validation/<criterio>.py)
       │  Threshold + função de extração do .ulg [5]
       ▼
[C] PR DISPARA BUILD PX4 + SIMULAÇÃO GAZEBO
       │  .ulg gerado é input do critério
       ▼
[D] FALHA DO CRITÉRIO → COMENTÁRIO AUTOMÁTICO NO MR
       │  Bloqueia merge se for critério crítico
       ▼
[E] APROVAÇÃO → MERGE
```

Os dois fluxos compartilham princípios de operação que justificam tratá-los como variantes do mesmo padrão de DesignOps: **artefato versionado** (token de design ou critério de voo, ambos como diff revisável no Git), **gate automatizado** (Storybook + regressão visual no fluxo A; build PX4 + simulação Gazebo no fluxo B), **review humano nominal** (UX/UI Lead da sprint corrente no fluxo A; Critérios de Voo Owner no fluxo B) e **rastreabilidade integral no MR** (issue de origem, diff e evidência publicada como comentário). É essa simetria que justifica a existência de um plano de DesignOps em um projeto majoritariamente embarcado: o design do fluxo de trabalho de engenharia, descrito em [3] como a frente onde "tarefas repetitivas devem ser operacionalizadas", segue as mesmas leis do design de UI [1]. Se um dos lados melhora e o outro estagna, perdemos o efeito sistêmico — o que conecta este fluxo diretamente às métricas de triangulação da Seção 4.2.

**Responsável: Otavio Vasconcelos**

---

## 4. Criação de Impacto (Mensuração e Entrega)

Esta seção responde ao pilar 3 do menu de DesignOps definido pela NN/g [1] — *create impact* — e à pergunta levantada pela professora Julia em aula: *como sabemos que o design está funcionando?* [2]. A própria NN/g reconhece que medir DesignOps é difícil pela subjetividade inerente ao trabalho de design [4]; nossa resposta é triangular múltiplas métricas sob o framework **REACH** (Results, Efficiency, Ability, Clarity, Health) [4], complementadas por uma Definição de Pronto (DoD) que serve de *gate* antes que qualquer mudança chegue à `main`. A Seção 4 está dividida em duas partes: **4.1 (DoD, esta)** e **4.2 (Métricas REACH)**, escrita por outro membro do grupo.

### 4.1 Definição de Pronto (Definition of Done)

Toda alteração que toca a interface do dashboard ou a camada de critérios de log só é considerada *pronta* quando **todos os itens** abaixo são verdadeiros. A maior parte é validada automaticamente pelo pipeline descrito na Seção 5; os itens manuais ficam num checklist preenchido a partir do template `.gitlab/merge_request_templates/design.md`, o que materializa o "guia vivo" recomendado pela NN/g [1] e elimina o vai-e-vem assíncrono de revisão.

**DoD do Dashboard (Sprint 4 e adiante).**

- [ ] Design revisado tecnicamente pelo Dev Lead da sprint.
- [ ] Assets otimizados (SVG inlined ou comprimido com SVGO; WebP onde aplicável).
- [ ] Acessibilidade WCAG 2.1 AA validada por axe-core no CI (zero violações *serious* ou *critical*).
- [ ] Tokens utilizados — proibido cor/spacing literal fora de `tokens.css`. Lint bloqueia.
- [ ] Componente tem story no Storybook com pelo menos uma variante e estado de erro/empty.
- [ ] Diff visual aprovado (Chromatic ou alternativa) ou justificado no MR.
- [ ] Texto/microcopy revisado pelo PO da sprint.
- [ ] Issue de origem (`design:proposed`) referenciada no MR.

**DoD do Design de Software (camada de critérios de log).**

- [ ] Critério validado com os engenheiros Jacto (Vinícius/Held) antes do merge — alinhado ao slide 10 da Sprint Review [6].
- [ ] Threshold do critério tem ADR em `docs/adr/`.
- [ ] Função de extração do `.ulg` [5] tem teste unitário com pelo menos 1 voo de exemplo passando e 1 falhando.
- [ ] Pipeline executa em < 8 min (limite operacional do PX4 + Gazebo na máquina de CI).

Esse DoD é herdado diretamente do conceito *agreed to and well-understood* do critério **Clarity** do REACH [4]: nenhum dos itens acima foi decidido por uma pessoa só — todos foram acordados pelo grupo e compartilhados com stakeholders, incluindo orientadores e os engenheiros parceiros da Jacto, exatamente para que "pronto" signifique a mesma coisa para Design, Dev e firmware. Isso fecha a fricção operacional que a Julia descreveu em aula como a perda de horas tentando descobrir *de quem* é cada decisão [2] e materializa a recomendação da NN/g [1] de que toda esteira de DesignOps tenha um critério explícito e versionado de aceite.

**Responsável: Lucca Pereira**

---

### 4.2 Métricas de Qualidade — Framework REACH adaptado

Aplicamos o framework REACH (Results, Efficiency, Ability, Clarity, Health) [4] como esqueleto de medição do nosso DesignOps no Jacto Drones OS. Para evitar leitura parcial do desempenho do time, cada eixo foi traduzido em **duas métricas concretas**: uma da camada de UI (dashboard) e outra da camada de design de software (esteira de logs e validação). Essa triangulação é proposital e responde ao alerta da NN/g [4] de que "métricas isoladas não dão imagem precisa". Na prática, medimos resultado percebido, velocidade, capacitação, alinhamento e sustentabilidade do trabalho em dois trilhos que precisam evoluir juntos para cumprir o objetivo do parceiro.

Ao conectar UI e esteira de software no mesmo quadro de medição, reduzimos o risco de otimização local. Um dashboard pode estar visualmente estável e acessível, mas sem critério de voo automatizado o engenheiro ainda perde tempo em análise manual; da mesma forma, automação de log sem clareza de critérios para PO e parceiro gera retrabalho de produto. O REACH adaptado força leitura sistêmica: quando um indicador melhora e seu par piora, sabemos que houve assimetria na entrega. Esse desenho também conversa com a organização da nossa CI/CD na Seção 5, onde os jobs de lint, teste visual e validação de `.ulg` passam a produzir sinais objetivos para acompanhamento por sprint [2].

| Eixo REACH | Pergunta-guia | Métrica UI (dashboard) | Métrica Software (esteira) |
|---|---|---|---|
| **R**esults | A experiência melhorou? | Score axe-core: % de telas sem violações *serious/critical*. Meta: 100%. | % de voos com Problem Report gerado automaticamente quando critério falha. Meta Sprint 5: ≥ 95%. |
| **E**fficiency | Tempo bem investido? | Lead Time for Design Change (issue `design:proposed` → URL em produção). Meta: ≤ 1 sprint. | Tempo do PR ao .ulg validado. Meta: ≤ 8 min. |
| **A**bility | Time tem skills? | % de membros que abriram pelo menos 1 MR de UI por sprint. Meta: ≥ 70%. | % de membros capazes de adicionar novo critério ao `scripts/log_validation/`. Meta: ≥ 50%. |
| **C**larity | Stakeholders alinhados? | Validação de critério: PO + parceiro Jacto concordam por escrito (issue resolvida) antes do merge. Meta: 100%. | Cada critério tem ADR mergeado *antes* do código que o implementa. Meta: 100%. |
| **H**ealth | Time satisfeito? | Pulse de retro: 1 a 5 sobre "consigo entregar UI sem retrabalho". Meta: ≥ 4 média. | Pulse de retro: 1 a 5 sobre "carga de trabalho saudável". Meta: ≥ 4 média. |

O uso dessas métricas em conjunto também melhora governança de decisão. Em vez de discutir percepção subjetiva de "pipeline bom" ou "dashboard pronto", passamos a operar por evidência: artifacts de acessibilidade, tempos de ciclo da esteira, histórico de MRs e checklists de validação com stakeholder. Isso diminui dependência de memória individual do time, facilita handover entre sprints e antecipa gargalos antes de virarem incidente de entrega. Em especial, a métrica de Clarity no trilho de software (ADR antes do código) cria rastreabilidade de decisão técnica, reduzindo mudanças tardias de critério que tipicamente explodem prazo quando o simulador já está no ar [2].

**Triangulação com objetivos de negócio.** Seguindo a abordagem **Value-Centered Design** apresentada em aula [2, slides 31-32], também sobrepomos:
- **Objetivo de negócio Jacto** (do TAP [7]): reduzir tempo de análise de log de "2-3 dias manuais" para minutos.
- **Objetivo do usuário (engenheiros Jacto)**: confiar no Problem Report automatizado a ponto de fechar o loop sem releitura manual.

A interseção dessas duas frentes é o que valida se nosso DesignOps está entregando *valor*, não só *eficiência operacional*. Em termos práticos, isso significa que bater meta de tempo de pipeline ou de conformidade visual não é suficiente isoladamente: o sucesso real é observado quando os engenheiros usam o relatório automatizado como base de decisão e o fluxo fim a fim encurta o ciclo de diagnóstico com confiança. Esse é o critério que conecta REACH [4] ao resultado esperado no TAP [7] e à disciplina de medição orientada a valor defendida em aula [2].

**Responsável: Vitor Balbo**

---

## 5. Integração com a Esteira de CI/CD

Esta seção aterrissa todo o plano acima na esteira concreta do GitLab CI já em uso na Sprint 1. É onde o DesignOps vira *código* — pipeline declarado em `.gitlab-ci.yml`, jobs versionados, cache reproduzível.

A esteira tem **três trilhos de DesignOps**, cada um automatizando uma das fricções operacionais [2] que mapeamos:

### 5.1 Linting de Estilo + Tokens (gate de tokens)

**Problema que resolve.** Sem isso, qualquer dev pode commitar `color: #ec6608` literal e a paleta Jacto se desfaz silenciosamente — exatamente o tipo de "ruído entre Dev e Design" que o Designer Hangout aponta como gerador de débito de UX [2].

**Implementação.**

- **Stylelint** rodando no `lint-style` job, com a regra `declaration-property-value-allowed-list` configurada para permitir cor/spacing apenas via `var(--token-*)`.
- **Validador de tokens** Python (`scripts/tokens/validate.py`) executado em `lint-tokens`: garante que `tokens.json` é JSON válido, todos os tokens citados existem, e que `tokens.css`/`tokens.ts` no commit foram regenerados a partir do JSON (não editados à mão).

```yaml
# .gitlab-ci.yml (trecho representativo)
lint-style:
  stage: lint
  image: node:20-alpine
  script:
    - npm ci
    - npx stylelint "src/**/*.css"
  rules:
    - changes: ["src/**/*.css", "design/tokens.json", "src/styles/tokens.*"]

lint-tokens:
  stage: lint
  image: python:3.12-slim
  script:
    - python scripts/tokens/validate.py
    - python scripts/tokens/regenerate.py --check
  rules:
    - changes: ["design/tokens.json", "src/styles/tokens.*"]
```

**Critério de bloqueio.** Falha em qualquer dos dois jobs reprova o MR. Não há override sem aprovação do UX/UI Lead da sprint.

### 5.2 Testes de Regressão Visual (gate visual)

**Problema que resolve.** Mudanças em código aparentemente locais quebram componentes em outras telas — o caso clássico relatado pela Julia em aula sobre "achar onde está o pixel que está quebrando o layout" [2].

**Implementação.**

- **Storybook** publicado a cada commit em GitLab Pages preview.
- **Chromatic** (ou alternativa OSS: `loki` + `puppeteer`) gera snapshots de cada story em ambiente headless e compara com a baseline aprovada. Diferenças são reportadas como comentário no MR com link para preview.

```yaml
visual-regression:
  stage: test
  image: mcr.microsoft.com/playwright:v1.45.0-jammy
  script:
    - npm ci
    - npm run build-storybook
    - npm run test:visual          # roda os snapshots
  artifacts:
    when: always
    paths: [test-results/]
    expire_in: 7 days
  rules:
    - changes: ["src/**/*", "design/tokens.json"]
```

**Critério de bloqueio.** Diff visual > 0.1% em qualquer story exige aprovação explícita do UX/UI Lead, com justificativa registrada no MR.

### 5.3 Build do Storybook + Métricas DesignOps no Pipeline

**Problema que resolve.** Documentação de design que vive em PDFs ou Notion morre rápido. Storybook publicado a cada merge na `main` materializa o "guia vivo" recomendado pela NN/g [1] e expõe automaticamente o estado atual do Design System.

**Implementação.**

- Job `pages` do GitLab CI publica o build do Storybook em `https://<grupo>.gitlab.io/jacto-drones-os/storybook` a cada merge na `main`.
- Adicionalmente, um job `metrics-designops` coleta as métricas de **REACH** definidas em 4.2 (Lead Time for Design Change vem do `git log` cruzado com o estado de issues; score axe-core vem dos artifacts do job de acessibilidade) e publica um JSON em `metrics/designops-<sha>.json` que alimenta o dashboard interno do grupo.

```yaml
pages:
  stage: deploy
  image: node:20-alpine
  script:
    - npm ci
    - npm run build-storybook -- -o public/storybook
  artifacts:
    paths: [public]
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

metrics-designops:
  stage: report
  image: python:3.12-slim
  script:
    - python scripts/metrics/reach.py --sha $CI_COMMIT_SHA --out metrics/
  artifacts:
    paths: [metrics/]
    reports:
      metrics: metrics/designops.txt   # GitLab exibe na MR widget
  rules:
    - if: '$CI_COMMIT_BRANCH == "develop" || $CI_COMMIT_BRANCH == "main"'
```

### 5.4 Pontos de costura com a esteira PX4/Gazebo já existente

A esteira de logs da Sprint 1 (`pr-build-px4` → `simulate-gazebo` → `validate-ulg`) **não muda**. O DesignOps **estende** o `.gitlab-ci.yml` adicionando os stages `lint`, `test` (regressão visual) e `report` (métricas REACH) sem tocar nos jobs de firmware. Isso é deliberado: a profª foi explícita ao falar em aula sobre o risco de "parar para olhar processo no meio do susto" [2] — preservamos o pipeline de firmware funcionando e crescemos o pipeline de UI ao lado.

A imagem mental é exatamente a do slide 8 da nossa Sprint Review: **uma esteira só, três costuras** — a partir da Sprint 4 a costura nova (UI/dashboard) entra como uma quarta costura no mesmo `.gitlab-ci.yml`.

**Referências externas usadas nesta seção.** Documentação oficial do Stylelint, Storybook, GitLab CI Pages, Chromatic, axe-core, e a fundamentação teórica de NN/g [1] e Designer Hangout [2] como justificativas de cada gate.

**Responsável: Fernando Bertholdo**

---

## Referências

[1] **Kaplan, K.** *DesignOps 101.* Nielsen Norman Group, 2019. URL: https://www.nngroup.com/articles/design-operations-101/ — Fonte primária do "menu de DesignOps" e dos três pilares utilizados como esqueleto deste documento.

[2] **Stateri, J.** *Introdução ao DesignOps — Operações de Design para escalabilidade.* Aula, Inteli, M10, Semana 2, Encontro 1, 29/04/2026. — Material apresentado em sala, transcrição integral disponível no repositório do grupo. Inclui o argumento de "DesignOps é o DevOps do Design" e a discussão sobre Value-Centered Design.

[3] *What is Design Operations and Why Should You Care?* Designer Hangout, Medium. URL: https://medium.com/designer-hangout/what-is-design-operations-and-why-should-you-care-b72f02b47761 — Fonte sobre fricção operacional e débito de UX.

[4] **Kaplan, K.** *DesignOps Impact: Measuring with the REACH Framework.* Nielsen Norman Group. — Fundamentação do framework de mensuração REACH (Results, Efficiency, Ability, Clarity, Health) aplicado em §4.2.

[5] **PX4 Autopilot Documentation.** ULog file format. URL: https://docs.px4.io/main/en/dev_log/ulog_file_format.html — Especificação do artefato `.ulg` referenciado em §3.2 e §5.4.

[6] **Apresentação de Sprint Review — Grupo 04 (Jacto Drones OS v0.1).** Inteli, M10, Sprint 1, 30/04/2026. — Documento interno do grupo referenciado nas seções 1, 3.1, 4.2 e 5.4.

[7] **Termo de Abertura de Projeto (TAP) — Jacto Drones.** Anexos A.1 (parceiro), A.4 (workflow atual), B.5 (gargalo de logs). — Documento do parceiro referenciado nas seções 1 e 4.2.

---

## Apêndice — Mapa de Responsabilidades

| Seção | Responsável | Foco |
|---|---|---|
| 1. Introdução e Objetivo | **Calebe Matias** | Visão geral + justificativa do plano. |
| 2. Como Trabalhamos Juntos (Pessoas) | **Marlos Guedes** | Papéis, rituais, handover. |
| 3.1 Ferramentas e Padronização | **Kauan Massuia** | Stack + Design System + tokens. |
| 3.2 Fluxo Design-to-Code | **Otavio Vasconcelos** | Diagrama dos dois fluxos (UI e software). |
| 4.1 Definition of Done | **Lucca Pereira** | Checklists por trilho. |
| 4.2 Métricas REACH | **Vitor Balbo** | Triangulação UI + software + valor. |
| 5. Integração com a Esteira de CI/CD | **Fernando Bertholdo** | Linting, regressão visual, Storybook, métricas no pipeline. |
