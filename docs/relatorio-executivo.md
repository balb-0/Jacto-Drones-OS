# Relatório Executivo — Jacto Drones OS v0.1 (Esteira de CI/CD)

> **Grupo G04 · Sprint 5 · Módulo 10 (Inteli)**
> Entregável avaliado (peso 9). Confronta o processo manual da Jacto (**AS-IS**)
> com a esteira de Continuous Delivery automatizada que o grupo construiu sobre
> PX4 SITL (**TO-BE**), e propõe o caminho de produção.
>
> **Princípio do relatório — evidência no entorno imediato.** Cada número aparece
> ao lado da sua fonte auditável (pipeline #, tag, artefato versionado, ADR). O
> que **não** foi medido no protótipo é marcado **`[projetado]`** e nunca lido
> como resultado. Tudo aqui é lastreado em `docs/projeto.md` §4–§8,
> `evidence/`, `docs/decisoes/0001`–`0011`, `ci/*.yml`, `scripts/` e
> `src/src/data/*.json` — sem invenção de indicador.
>
> **Nota de transparência sobre vintages de snapshot.** Convivem dois cortes de
> coleta DORA, ambos versionados e reportados lado a lado: o **corte da Sprint 3**
> (pipeline `#30535`, `src/src/data/dora.json`, coletado `2026-05-29`) e o
> **corte reauditável da Sprint 4** (`evidence/dora.json` + `evidence/raw/`,
> coletado `2026-06-13`). Os números mudam entre cortes porque a amostra cresceu;
> a metodologia (`scripts/collect_gitlab_metrics.py`) é idêntica.

---

## Sumário

- [1. Contexto e leitura executiva](#1-contexto-e-leitura-executiva)
- [2. Diagnóstico Inicial — os 4 mapas](#2-diagnóstico-inicial--os-4-mapas)
  - [2.1 Mapa 1 — Automações de testes e deploy](#21-mapa-1--automações-de-testes-e-deploy-as-is--to-be)
  - [2.2 Mapa 2 — Arquitetura do Sistema](#22-mapa-2--arquitetura-do-sistema-iso-10746)
  - [2.3 Mapa 3 — Automação de Integração e Deploy](#23-mapa-3--automação-de-integração-e-deploy-cicd)
  - [2.4 Mapa 4 — Controle em Malha Fechada da Esteira](#24-mapa-4--controle-em-malha-fechada-da-esteira)
- [3. Esteira de CI/CD e Indicadores](#3-esteira-de-cicd-e-indicadores)
  - [3.1 Testes funcionais (dev/deploy)](#31-indicadores-de-testes-funcionais-devdeploy)
  - [3.2 Indicadores de produto (dev/deploy)](#32-indicadores-de-produto-devdeploy)
  - [3.3 Indicadores de processo (dev/deploy)](#33-indicadores-de-processo-devdeploy)
  - [3.4 Indicadores gerais](#34-indicadores-gerais)
  - [3.5 Estado AVALIADO vs. estado ATUAL](#35-estado-avaliado-0612-vs-estado-atual-v061)
- [4. Recomendações](#4-recomendações)
  - [4.1 Treinamento (Arquitetura e Processo)](#41-treinamento-arquitetura-e-processo)
  - [4.2 Arquitetura e Processo + roadmap de produção](#42-arquitetura-e-processo--roadmap-de-produção)
- [5. Limites pedagógicos (fora de escopo)](#5-limites-pedagógicos-honestidade-de-escopo)

---

## 1. Contexto e leitura executiva

A frente de drones da Jacto opera hoje com **~2 engenheiros técnicos + 1 gestora**
(`projeto.md` §4.0.4, TAPI Anexo B.1), três raias de desenvolvimento sem
orquestrador único (Model-Based/MATLAB, Test Rigs MIL/SIL/HIL, código PX4-style —
`projeto.md` §4.0.2) e **análise de log de voo `.ulg` 100% manual**: 2 a 3 dias por
voo, ~90 arquivos × ~120 parâmetros por voo de 15 manobras (`projeto.md` §4.0.3,
TAPI B.5). O custo de um bug detectado tarde é literal: drone protótipo ≈
**R$ 700.000**, microcontroladores importados com 3–4 meses de lead time. Houve
**queda real** por defasagem silenciosa comando×atuação que não foi detectada a
tempo (citação do Held, TAPI B.5).

O G04 entregou um **protótipo funcional de Continuous Delivery** (objetivo geral,
`projeto.md` §3) sobre o ecossistema Dronecode (PX4 + MAVLink), em GitLab CI/CD,
que **executa de fato a missão SITL a cada pipeline**, extrai métricas do `.ulg`
real e **bloqueia o merge** quando um invariante físico é violado. A leitura
executiva, em uma linha:

> A esteira converteu a inspeção manual de 2–3 dias em um **veredito automático em
> ~4–5 min** sobre o caso pedagógico reproduzível `square_50m`, com cada número
> auditável no próprio repositório — e já estendeu a malha até **canary
> health-check + notificação push** do resultado a quem decide (entrega desta
> Sprint 5).

**O que NÃO se afirma:** que o número de 2–3 dias → minutos vale para o `.ulg` de
**voo real de produção** da Jacto. A esteira mede `square_50m` (caso didático); a
aplicação ao voo real segue **`[projetado]`** (`projeto.md` §8.1.2).

---

