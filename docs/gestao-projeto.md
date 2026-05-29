<Table>
  <tr>
    <td><a href= "link"><img src="img/logo.png" alt="Nome" border="0"></td>
    <td>
      <a href= "https://www.inteli.edu.br/"><img src="img/logo-Inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0"></a>
    </td>
  </tr>
</table>

# Nome do Projeto: Jacto Drones OS v0.1

## Nome do Grupo: G04

## Integrantes:

- <a href="https://git.inteli.edu.br/calebe.matias">Calebe Matias</a>
- <a href="https://git.inteli.edu.br/fernando.bertholdo">Fernando Bertholdo</a>
- <a href="https://git.inteli.edu.br/kauan.massuia">Kauan Massuia</a>
- <a href="https://git.inteli.edu.br/lucca.pereira">Lucca Henrique Pereira</a>
- <a href="https://git.inteli.edu.br/marlos.guedes">Marlos Guedes</a>
- <a href="https://git.inteli.edu.br/otavio.vasconcelos">Otávio Vasconcelos</a>
- <a href="https://git.inteli.edu.br/margarido">Vitor Balbo</a>


# Sumário
- [1. Introdução](#1-introdução)
- [2. Avaliação das Sprints](#2-avaliação-das-sprints)
  - [2.1 Sprint 1](#21-sprint-1)
  - [2.2 Sprint 2](#22-sprint-2)
  - [2.3 Sprint 3](#23-sprint-3)
  - [2.4 Sprint 4](#24-sprint-4)
  - [2.5 Sprint 5](#25-sprint-5)
- [3. Análise de Riscos](#3-análise-de-riscos)
  - [3.1 Riscos identificados](#31-riscos-identificados)
  - [3.2 Mitigação de Riscos](#32-mitigação-de-riscos)
- [4. Análise Post Mortem](#4-análise-post-mortem)
  - [4.1 Sucessos do Projeto](#41-sucessos-do-projeto)
  - [4.2 Oportunidades de Melhoria](#42-oportunidades-de-melhoria)
  - [4.3 Lições Aprendidas](#43-lições-aprendidas)

# 1. Introdução

Este documento registra a **gestão do projeto** Jacto Drones OS v0.1: a avaliação sprint a sprint (nota recebida, entregas, lições aprendidas e a resposta aos feedbacks da avaliação), a análise de riscos e o post mortem do projeto. Ele **complementa o [`projeto.md`](projeto.md)** — que descreve o produto e a esteira de CI/CD — trazendo a **visão de processo e de gestão**: como o grupo G04 conduziu o trabalho, respondeu às críticas e mitigou riscos ao longo da esteira.

# 2. Avaliação das Sprints

Esta seção registra, sprint a sprint, a nota recebida, o que foi entregue e as lições que mudaram a forma de trabalhar nas sprints seguintes. As entregas das Sprints 1 e 2 foram documentais (planejamento e desenho da esteira); a partir da Sprint 3 a esteira passa a rodar de fato (pipeline real, SITL e quality gates).

## 2.1 Sprint 1

**Nota:** 6,5/10.

**O que foi entregue.** Termo de Abertura de Projeto, primeiro recorte do problema (esteira CI/CD para o ecossistema de drones autônomos da Jacto, com o caso pedagógico Dronecode/PX4 como ambiente de validação) e a versão inicial da documentação de projeto.

**Principal crítica do feedback.** A documentação descrevia o estado desejado (TO-BE) sem antes caracterizar o estado atual (AS-IS), trazia afirmações sem referência rastreável e apresentava incoerências entre documentos (o mesmo conceito descrito de formas diferentes em arquivos distintos).

**Lições aprendidas (incorporadas a partir da Sprint 2):**

- **AS-IS antes de TO-BE.** Caracterizar o ambiente atual da Jacto e do caso Dronecode antes de propor a esteira-alvo, deixando explícito o que é diagnóstico e o que é proposta.
- **Referências rastreáveis.** Toda afirmação relevante deve apontar para a evidência que a sustenta (norma, fonte do parceiro, commit/MR ou arquivo do repositório) — princípio de "evidência no entorno imediato".
- **Coerência inter-documento.** Um conceito é definido uma vez e referenciado nos demais documentos, evitando divergência entre `projeto.md`, `gestao-configuracao.md` e o mapa de cobertura.

## 2.2 Sprint 2

**Nota:** 7,5/10.

**O que foi entregue.** Desenho da esteira de CI/CD em malha fechada, mapa de cobertura de integração (frentes, DoD por track) e o detalhamento das políticas de SCM e do fluxo de promoção. As lições da Sprint 1 (AS-IS antes de TO-BE, referências rastreáveis, coerência inter-doc) já aparecem refletidas aqui.

**Principal crítica do feedback.** O desenho era sólido no conceito, mas faltava fechar o **protocolo operacional**: como cada integração é contratada e medida na prática, e a separação entre o que já está medido e o que ainda é meta projetada.

**Lições aprendidas (incorporadas a partir da Sprint 3):**

- **Contrato por integração.** Para cada ponto de integração, explicitar entradas, saídas e o critério objetivo de aceitação (o gate), em vez de descrever a integração apenas em prosa.
- **Protocolo de medição.** Definir como cada indicador é coletado e de onde sai o número (artefato de CI, API do GitLab, log do SITL), para que a métrica seja reproduzível.
- **Medido × projetado.** Separar literalmente o que já foi medido do que é meta projetada, evitando tom aspiracional — base direta para a revisão de coerência conduzida na Sprint 3.

### Validação a posteriori do feedback (fechada na Sprint 3)

A Sprint 3 endereçou os **3 pontos** do feedback da Sprint 2, todos ✅ em `develop`. Cada item abaixo aponta para a evidência rastreável (arquivo, commit ou MR) que sustenta o fechamento:

| Ponto do feedback S2 | Como foi fechado | Evidência (âncora) |
|---|---|---|
| 1 — Serviços de Integração: faltava **contrato operacional por integração** (gatilho×entrada×saída×falha) | Mapa de cobertura do deploy com 8 integrações contratadas; §5.6/§5.7 do `projeto.md` revisados | [`docs/mapa-cobertura-deploy.md`](mapa-cobertura-deploy.md) §2 · commits `9561e90`/`4d53d97` · MR !23 (`feat/deploy-cd-pipeline`) |
| 2 — Indicadores QoS/QoP: faltava **protocolo de medição** (janela×método×aceite) | Protocolo declarado ao lado de cada indicador, versionado | [`docs/dora-protocolo.md`](dora-protocolo.md) · [`src/src/data/qos-protocol.ts`](../src/src/data/qos-protocol.ts) · MRs !26/!27 |
| 3 — Avaliação dos Resultados: metas previstas no lugar de **medidas** | `projeto.md` §8 refatorado em tabelas distintas medido × projetado, prosa aderente | [`projeto.md` §8](projeto.md) · MR !29 (`docs/avaliacao-resultados`) · `src/src/data/{dora,metrics}.json` |

A prova foi validada a posteriori pelo integrador (@Fernando), conferindo cada âncora no histórico git antes da Sprint Review 3.

## 2.3 Sprint 3

**Nota:** a definir (Sprint Review em 29/05/2026; avaliação oficial ainda não recebida).

**O que foi entregue (CD real — a esteira passa a rodar de fato).** Pipeline GitLab CI executável com **6 stages** (lint/build/test/sast/gate/deploy, montados via `include` glob); **PX4 SITL real** (build com cache + missão `square_50m` → `metrics.json`); **quality gates bloqueantes** (`scripts/quality_gates.py`, exit≠0 bloqueia o merge); dashboards QoS/QoP/gerencial com **dados reais** (DORA medido via API GitLab); SAST server-side (TruffleHog/Trivy/Gitleaks/Semgrep/commitlint, informativos nesta sprint); deploy simulado por ambiente + GitLab Release em tag, sem Container Registry ([ADR-0006](decisoes/0006-promocao-sem-registry.md)). A resposta ao feedback S2 foi fechada (ver §2.2).

**KPIs medidos** (âncora `src/src/data/{dora,metrics}.json` + pipeline): pipeline **~4-5 min**; cobertura `libs/` **98%**; missão **78,83 s**; aceleração máx **11,01 m/s²**; DORA lead time mediana **0,4 h**, CFR `main` **0%**.

**Lições aprendidas.** A consolidar após a avaliação oficial.

## 2.4 Sprint 4
_Sprint futura — esta seção será preenchida ao fim da Sprint 4 (Integração CI + CD)._

## 2.5 Sprint 5
_Sprint futura — esta seção será preenchida ao fim da Sprint 5 (Relatório Executivo + Apresentação Final)._

# 3. Análise de Riscos

## 3.1 Riscos identificados

Riscos reais do projeto na Sprint 3, todos rastreáveis a um artefato versionado:

| # | Risco | Impacto |
|---|---|---|
| R1 | Dependência do **runner compartilhado `id=100`** para o build/missão SITL (custo de fila e tempo de execução compartilhado com outros grupos) | Pipeline pode enfileirar; SITL é o stage mais caro |
| R2 | Validação por **SITL `square_50m` ≠ voo real** de produção (não há `.ulg` de hardware real) | Confiança limitada: gate aprova simulação, não voo físico |
| R3 | **Integração das plataformas de cliente** (mission-service, ops-web, telemetry-ingest) ainda em **placeholder** | Cobertura de integração de serviços não é executável ainda |
| R4 | Eixo de **integridade** (GPG/SBOM/SAST bloqueante) ainda **informativo** (`allow_failure`) | Segredos/CVEs não bloqueiam o merge nesta sprint |

## 3.2 Mitigação de Riscos

| # | Mitigação | Âncora |
|---|---|---|
| R1 | Cache de build (ccache) para reduzir o tempo do stage SITL; `ci.skip`/regras em mudanças só-docs; uso por cortesia da fila compartilhada | [`mapa-cobertura-deploy.md`](mapa-cobertura-deploy.md), [ADR-0006](decisoes/0006-promocao-sem-registry.md) (runner sem privilégio) |
| R2 | Gates baseados em **invariantes físicos** da missão (altitude/aceleração/duração não degeneradas), não em valores absolutos de produção; `.ulg` de voo real é **meta projetada** | [ADR-0003](decisoes/0003-criterios-aprovacao-log-sitl.md), [`quality_gates.yaml`](../quality_gates.yaml) |
| R3 | Repositórios das plataformas **previstos no plano**, a serem materializados nas próximas sprints (registrados como Nota em `projeto.md` §5.6) | [`projeto.md` §5.6](projeto.md) |
| R4 | Integridade tratada por ADRs dedicados, com ativação **bloqueante planejada para as Sprints 4-5** | [ADR-0004](decisoes/0004-gpg-signing-main.md), [ADR-0007](decisoes/0007-sast-semgrep.md) |

# 4. Análise Post Mortem

A análise post mortem completa do projeto é consolidada na **Sprint 5 (encerramento)**. Abaixo, o registro **parcial da Sprint 3**.

## 4.1 Sucessos do Projeto

A análise post mortem completa do projeto é consolidada na Sprint 5 (encerramento). Registro parcial da Sprint 3:

- **Esteira real verde:** pipeline executável de 6 stages rodando de fato, com SITL `square_50m` → `metrics.json` e quality gates bloqueantes ([`.gitlab-ci.yml`](../.gitlab-ci.yml), `scripts/quality_gates.py`).
- **Autoria por membro (P12):** cada stage tem dono identificado por integrante do G04 (build/missão @Calebe, SAST @Lucca, gate @Fernando, deploy @Vitor), evidenciando contribuição individual no histórico.
- **Feedback S2 fechado:** os 3 pontos da avaliação da Sprint 2 endereçados com âncora rastreável (ver §2.2).

## 4.2 Oportunidades de Melhoria

A análise post mortem completa do projeto é consolidada na Sprint 5 (encerramento). Registro parcial da Sprint 3:

- **Ativar a integridade:** tornar GPG/SBOM/SAST **bloqueantes** (hoje informativos), conforme [ADR-0004](decisoes/0004-gpg-signing-main.md)/[ADR-0007](decisoes/0007-sast-semgrep.md).
- **Integrar as plataformas de cliente:** materializar os repositórios em placeholder (mission-service, ops-web, telemetry-ingest) e cobri-los na malha ([`projeto.md` §5.6](projeto.md)).

## 4.3 Lições Aprendidas

A análise post mortem completa do projeto é consolidada na Sprint 5 (encerramento). Registro parcial da Sprint 3:

- **Contrato operacional** por integração (gatilho×entrada×saída×falha) torna a cobertura verificável, não apenas descritiva ([`mapa-cobertura-deploy.md`](mapa-cobertura-deploy.md) §2).
- **Protocolo de medição** ao lado de cada indicador (janela×método×aceite) garante reprodutibilidade do número ([`dora-protocolo.md`](dora-protocolo.md)).
- **Medição operacional** antes de projeção: separar literalmente medido × projetado evita tom aspiracional ([`projeto.md` §8](projeto.md)).