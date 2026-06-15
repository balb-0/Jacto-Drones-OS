# ADR-0009 — Detecção de anomalias como gate (anomalia CRITICAL bloqueia o merge)

**Status:** Aceito
**Data:** 2026-06-14
**Autores:** G04 (Sprint 4) — TG2 (anomalia no pipeline server-side)

> Estende o eixo de quality gates (ADR-0005) para além de coverage/métricas de
> missão: leva as **regras de anomalia que só viviam no dashboard** (Next.js,
> `src/src/lib/anomaly-detection.ts`) para dentro da esteira, server-side e
> inevitáveis. No espírito "rastro que ensina": a anomalia deixa de ser um aviso
> visual e passa a ser critério versionado de "pronto pra merge".

## Contexto

O dashboard já detecta anomalias na telemetria de voo SITL
(`src/src/lib/anomaly-detection.ts` — `detectAnomalies`), classificando cada
ponto contra regras físicas (vibração, divergência de PWM, instabilidade de
atitude). Mas essa lógica rodava **só no front**: dependia de alguém abrir o
dashboard e olhar. Um `.ulg` que reprovaria por vibração excessiva passava no
pipeline silenciosamente — a esteira não enxergava a anomalia.

A TG2 fecha essa lacuna: a mesma regra precisa rodar **no CI**, como gate, para
que um voo anômalo **bloqueie o merge** sem depender de inspeção humana do
dashboard. Três fatos moldam o desenho:

1. **A fonte de verdade da regra é o front.** Reescrever a heurística do zero
   arriscaria divergência front × CI. A decisão é **portar** as regras de
   `anomaly-detection.ts` para Python preservando shape e limiares (par
   contratual), não reinventá-las.
2. **A telemetria de voo já é artefato de pipeline.** O job `sitl-mission-metrics`
   (stage `test`) produz a série de pontos (`flight-telemetry.json`, `.points`),
   que o detector consome — sem novo build/missão.
3. **O gate de qualidade já existe e é o portão.** `scripts/quality_gates.py`
   (ADR-0005) é onde mora o veredito automático; o critério de anomalia entra ali.

## Decisão

**Portar as regras de anomalia para o CI e tratar anomalia `CRITICAL` como gate
bloqueante.** Concretamente:

1. **Detector puro + CLI (`scripts/detect_anomalies.py`).** `detect_anomalies(points)`
   é função pura (sem I/O, unit-testável) que aplica as 4 regras portadas de
   `anomaly-detection.ts` e devolve a lista de anomalias no **mesmo shape do
   front** (`{type, severity, timestamp_ms, variables:[{label,value}]}`). O CLI
   lê `flight-telemetry.json` (`.points`) e grava `anomalies.json`.

   | Regra | Limiar | Severidade no gate |
   |---|---|---|
   | `VIBRATION SPIKE` | `vibration_x/y/z_g > 1.5 g` (qualquer eixo) | **CRITICAL** |
   | `PWM DIVERGENCE` | `max(pwm1-4) − min(pwm1-4) > 200 µs` | WARNING |
   | `ATTITUDE INSTABILITY` | `abs(roll_deg) > 15°` OU `abs(pitch_deg) > 15°` | WARNING |
   | `ACCELERATION SPIKE` | `acceleration_m_s2 > 10 m/s²` | WARNING |

2. **Job no stage `gate` (`ci/anomaly.yml`).** `detect-anomalies` consome o
   `flight-telemetry.json` do `sitl-mission-metrics` via `dependencies:` (baixa
   só esse artefato; a ordem de stage `test → gate` já garante que ele existe —
   sem DAG-bypass, ADR-0006) e publica `anomalies.json` como artefato.

3. **Critério no gate (`scripts/quality_gates.py`).** Novo check
   `anomalies.no_critical`: lê `anomalies.json` e **reprova (exit ≠ 0) se houver
   ao menos uma anomalia `CRITICAL`**. `WARNING` é informativo (conta no
   relatório, não trava). Fail-closed: `anomalies.json` ausente/inválido reprova
   (é entrada obrigatória do gate, não some em silêncio). O job `quality-gates`
   passa `--anomalies anomalies.json` e declara `needs:` explícito nos três
   produtores (`unit-tests`, `sitl-mission-metrics`, `detect-anomalies`) — porque
   `detect-anomalies` é **irmão de stage** (ambos em `gate`) e, com `needs`
   presente, o download por ordem de stage de coverage/metrics precisa ser
   re-declarado. Não é DAG-bypass: os três já antecedem o gate.

4. **Severidade do gate ≠ severidade da UI (escolha conservadora).** No front,
   `ATTITUDE INSTABILITY` é `CRITICAL` (alarme visual). No **gate**, ela entra
   como `WARNING`: nesta sprint, **só `VIBRATION SPIKE` bloqueia o merge** — é o
   sinal físico mais inequívoco de hardware comprometido. PWM e atitude começam
   informativos e podem ser **apertados para CRITICAL no ratchet** (ADR-0005),
   com baseline, evitando gate barulhento. A divergência é deliberada e está
   documentada aqui — os **limiares numéricos** seguem idênticos ao front.

## Alternativas consideradas

- **Manter a detecção só no dashboard.** Rejeitada: não é gate — depende de
  inspeção humana e não bloqueia merge (exatamente a lacuna que a TG2 fecha).
- **Reescrever as regras do zero no CI.** Rejeitada: duplica a heurística e
  arrisca divergência front × CI. Portar preservando shape/limiares mantém um
  par contratual auditável (mudou lá, muda aqui).
- **Bloquear em qualquer anomalia (incl. WARNING) já nesta sprint.** Rejeitada:
  sem baseline de ruído, PWM/atitude poderiam dar falso-vermelho (mesmo
  argumento do ratchet de SAST — ADR-0007). Primeiro medir, depois apertar.
- **Detectar a anomalia dentro do próprio `sitl-mission-metrics`.** Rejeitada:
  mistura concerns (missão × avaliação) e o enunciado da esteira mantém cada
  concern no seu `ci/*.yml`. O detector é job próprio no stage `gate`.

## Consequências

**Positivas:** anomalia vira critério objetivo de merge, server-side e inevitável
(sai da inspeção do dashboard); regra única portada do front (par contratual);
`anomalies.json` fica como artefato auditável; caminho de endurecimento (ratchet
de PWM/atitude para CRITICAL) explícito.

**Negativas:** o par front/CI exige disciplina — mudar `anomaly-detection.ts` sem
mexer em `detect_anomalies.py` (ou vice-versa) reintroduz divergência (mitigado
por testes e por esta ADR); a severidade do gate diverge da UI por ora (decisão
consciente, documentada); o `needs:` explícito no `quality-gates` acopla o gate a
três jobs nomeados (custo de manutenção se a topologia mudar).

## ADRs relacionadas

- **ADR-0005** — thresholds dos quality gates e processo de ratchet (onde o
  critério de anomalia se encaixa; apertar PWM/atitude para CRITICAL passa por lá).
- **ADR-0006** — CD sem registry (ordem de stage como anti-DAG-bypass; artefato
  imutável por SHA).
- **ADR-0007** — SAST (Semgrep) como gate (mesmo padrão "informativo →
  bloqueante com ratchet" aplicado em TG2).
- **ADR-0003** — critérios de aprovação de log SITL (origem física dos limiares
  de invariante).
- `src/src/lib/anomaly-detection.ts` — regra-fonte (front) que este ADR porta.
- `scripts/detect_anomalies.py`, `ci/anomaly.yml`, `scripts/quality_gates.py`
  (`check_anomalies`), `ci/quality-gates.yml` — a implementação.
