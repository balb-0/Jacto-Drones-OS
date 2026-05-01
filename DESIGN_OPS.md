# Plano de DesignOps — Jacto Drones OS v0.1

> **Grupo 04 · Módulo 10 (CI/CD) · Sprint 1**
> **Parceiro:** Jacto · **Produto:** Jacto Drones OS v0.1 — esteira de engenharia para o primeiro firmware proprietário da Jacto (substituindo a revenda de drones DJI por soberania técnica sobre produto, dados e pós-venda).
> **Documento:** Plano operacional de DesignOps aplicado à nossa esteira de CI/CD.
> **Entrega:** Atividade Ponderada — Profª Julia Stateri — 01/05/2026.

<!-- ============================================================
INSTRUÇÕES PARA O GRUPO (apagar antes do MR final)

- Cada seção é editada APENAS entre seus markers BEGIN/END SECTION.
- Antes de fazer push: git pull --rebase origin docs/design-ops
- A linha `**Responsável: Nome Completo**` é OBRIGATÓRIA no fim de cada seção.
- Citações usam os rótulos numerados [1] [2] [3] [4] [5] [6] [7] (definidos
  na seção Referências, no fim do documento).
- A Seção 5 já está preenchida e assinada — não editar.

============================================================ -->

---

<!-- BEGIN SECTION 1 -->

## 1. Introdução e Objetivo

> 🚧 A ser preenchido pelo **Membro 1** — usar o Prompt 1 do kit do grupo.
> Substituir este aviso pelo conteúdo gerado e a linha de assinatura abaixo.

**Responsável: <Membro 1 — substituir>**

<!-- END SECTION 1 -->

---

<!-- BEGIN SECTION 2 -->

## 2. Como Trabalhamos Juntos (Pessoas)

> 🚧 A ser preenchido pelo **Membro 2** — usar o Prompt 2 do kit do grupo.
> Cobrir: 2.1 Papéis e Responsabilidades, 2.2 Rituais de Colaboração, 2.3 Handover Design ↔ Dev.

**Responsável: <Membro 2 — substituir>**

<!-- END SECTION 2 -->

---

<!-- BEGIN SECTION 3.1 -->

## 3. Como o Trabalho é Feito (Processos e Ferramentas)

### 3.1 Ferramentas Utilizadas e Padronização

> 🚧 A ser preenchido pelo **Membro 3** — usar o Prompt 3 do kit do grupo.
> Cobrir: tabela de ferramentas (Figma, Tokens Studio, GitLab, Storybook, PX4/QGC/Gazebo, axe-core), padronização do Design System "Jacto Drones OS DS", tokens iniciais (paleta Jacto Blue/Orange + Archivo/JetBrains Mono).

**Responsável: <Membro 3 — substituir>**

<!-- END SECTION 3.1 -->

---

<!-- BEGIN SECTION 3.2 -->

### 3.2 Fluxo de Integração Design-to-Code

> 🚧 A ser preenchido pelo **Membro 4** — usar o Prompt 4 do kit do grupo.
> Cobrir: dois fluxos paralelos (UI dashboard via Figma↔Tokens↔Storybook; software embarcado via critério de voo↔script de log↔simulação Gazebo) e a simetria entre eles.

**Responsável: <Membro 4 — substituir>**

<!-- END SECTION 3.2 -->

---

<!-- BEGIN SECTION 4.1 -->

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

<!-- END SECTION 4.1 -->

---

<!-- BEGIN SECTION 4.2 -->

### 4.2 Métricas de Qualidade — Framework REACH adaptado

> 🚧 A ser preenchido pelo **Membro 6** — usar o Prompt 6 do kit do grupo.
> Cobrir: tabela REACH (Results, Efficiency, Ability, Clarity, Health) com 1 métrica de UI + 1 de software por eixo, e bloco de triangulação Value-Centered Design com objetivos do parceiro.

**Responsável: <Membro 6 — substituir>**

<!-- END SECTION 4.2 -->

---

<!-- BEGIN SECTION 5 -->

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

<!-- END SECTION 5 -->

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
| 1. Introdução e Objetivo | `<Membro 1>` | Visão geral + justificativa do plano. |
| 2. Como Trabalhamos Juntos (Pessoas) | `<Membro 2>` | Papéis, rituais, handover. |
| 3.1 Ferramentas e Padronização | `<Membro 3>` | Stack + Design System + tokens. |
| 3.2 Fluxo Design-to-Code | `<Membro 4>` | Diagrama dos dois fluxos (UI e software). |
| 4.1 Definition of Done | **Lucca Pereira** | Checklists por trilho. |
| 4.2 Métricas REACH | `<Membro 6>` | Triangulação UI + software + valor. |
| 5. Integração com a Esteira de CI/CD | **Fernando Bertholdo** | Linting, regressão visual, Storybook, métricas no pipeline. |
