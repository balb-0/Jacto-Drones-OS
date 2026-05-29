# ADR-0005 — Thresholds dos quality gates e processo de revisão (ratchet)

**Status:** Aceito
**Data:** 2026-05-29
**Autores:** G04 (Sprint 3)

> Espelha o ADR-005 do demo do avaliador (`inteli-px4-cicd-demo`), adaptado às
> NOSSAS chaves (`quality_gates.yaml`) e ao caso pedagógico (missão `square_50m`
> em PX4 SITL). No espírito "rastro que ensina": o threshold não é número mágico,
> é decisão versionada com justificativa e regra de revisão.

## Contexto

A TG6 transforma as métricas que antes só apareciam no MR como informação em
**gates obrigatórios**: o job do stage `gate` (`ci/quality-gates.yml`) falha o
pipeline — e bloqueia o merge — se qualquer threshold versionado em
`quality_gates.yaml` for violado. Os valores precisam:

1. Detectar regressões reais (um drone que passa a oscilar, uma missão que
   estoura o tempo, um PR que remove testes).
2. Não ser tão apertados que toda mudança legítima trave (gate "barulhento"
   vira piada interna que ninguém respeita e o time quer desligar).
3. Ter processo claro de revisão — quem decide mudar, e sob qual regra.

## Decisão

Valores iniciais versionados em `quality_gates.yaml`:

| Gate | Threshold | Origem / justificativa |
|---|---|---|
| `coverage.min_line_coverage` | `0.90` | `libs/` (geometria + loader de missão) mede ~98%. Ratchet em 0.90 protege contra regressão. CLIs (run_mission, promote_artifact) são exercitados via SITL, não unit. |
| `mission_metrics.max_acceleration_m_s2` | `15.0` | INVARIANTE físico do x500 (inclui g ~9.8). Alinhado a `tests/sitl/test_physical_invariants.py`. Origem: ADR-0003. |
| `mission_metrics.max_mission_duration_s` | `180` | Baseline `square_50m` ~79 s medido + folga. Origem: ADR-0003. |
| `mission_metrics.max_std_altitude_cruise_m` | `1.0` | Std de altitude em cruzeiro; baseline ~0.69 m medido, folga ~45%. Origem: ADR-0003. |
| `sast.require_passed` | `false` | Informativo na Sprint 3; liga para `true` na TG5 quando o runner `sonar-00` (id=133) estiver amarrado. |

A origem dos thresholds de **missão** é o **ADR-0003** (critérios de aprovação
de log SITL), que separa baseline (mudável) de invariante físico (imutável). O
mapeamento chave→campo do `metrics.json` (`max_mission_duration_s` →
`mission_duration_s`, `max_std_altitude_cruise_m` → `std_altitude_cruise_m`)
está documentado no próprio `quality_gates.yaml` e no `scripts/quality_gates.py`.

## Processo de revisão (ratchet)

Os valores são **código versionado**. Alteração só via PR/MR:

- **Apertar threshold** (mais rígido — ex.: subir coverage, baixar std máximo):
  PR comum; o reviewer garante que o pipeline atual ainda passa.
- **Afrouxar threshold** (mais permissivo): PR com **justificativa explícita no
  commit**. Regra do ratchet: **coverage não baixa sem justificativa** — reduzir
  `min_line_coverage` é sinal claro de PR que removeu testes sem substituir, e
  exige defesa no histórico (`git log quality_gates.yaml` audita).
- **Mudança fundamental** (trocar `max` por `p99`, adicionar/remover gate,
  mudar a semântica de comparação): requer **nova ADR**.

Ao final de cada sprint, revisar `quality_gates.yaml` com base em: histórico de
gates quebrados (falso-positivo × regressão real), mudanças de hardware/missão e
evolução do baseline (média histórica das métricas no `develop`/`main`).

## Alternativas consideradas

- **Thresholds em variável de CI/CD (não versionados).** Rejeitada: tira o
  rastro auditável e a revisão por PR — vira "config oral".
- **Cravar performance ideal já na Sprint 3.** Rejeitada: gate barulhento.
  Baseline frouxo + ratchet aperta com dados, não com ansiedade.

## Consequências

**Positivas:** critério objetivo de "pronto pra merge"; mudanças de critério
passam por revisão (são código); coverage protegido contra erosão silenciosa.

**Negativas:** ajuste fino de threshold tem overhead de PR; valor cravado errado
pode dar falso-positivo até a revisão de sprint corrigir com dados reais.

## ADRs relacionadas

- **ADR-0003** — critérios de aprovação de log SITL (origem dos thresholds de
  missão; hierarquia baseline × invariante).
- **ADR-0006** — CD sem registry (define o artefato `metrics.json` por SHA que
  alimenta os gates de missão).
- `docs/testing-philosophy.md` — pirâmide/troféu e a separação baseline ×
  invariante físico.
