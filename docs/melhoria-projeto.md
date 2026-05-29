# Melhoria do Projeto

> Plano de ação para evolução do Jacto Drones OS v0.1 (v0.2+). Ancorado no diagnóstico em [`projeto.md` §8](projeto.md) e nos *Entregáveis Desejáveis* do TAPI.

## 1. Base do diagnóstico

O diagnóstico de partida está em [`projeto.md` §8](projeto.md) (Avaliação dos Resultados): medido × projetado em §8.1, qualitativo (centralização de governança + fechamento de malha) em §8.2, fontes auditáveis em §8.3. Esta seção parte daquele diagnóstico — não o repete.

## 2. Concluído na Sprint 3

Itens que estavam no roadmap de curto e médio prazo e foram **entregues** na Sprint 3 (Camada 1, mergeada em `develop` @ `c967ad6`). Cada linha aponta o MR/commit/artefato verificável — o resultado medido correspondente está em [`projeto.md` §8.1.1](projeto.md).

### Curto prazo entregue — "rastro que ensina"

| Item entregue | Evidência verificável |
|---|---|
| PX4 SITL **real** substituiu o `functional_tests_job` demonstrativo: missão `square_50m` voa, gera `.ulg` e extrai métricas | MR `!25`–`!28` (commit `7055b80`); [`ci/sitl-metrics.yml`](../ci/sitl-metrics.yml); [`scripts/run_mission.py`](../scripts/run_mission.py) + [`scripts/extract_metrics.py`](../scripts/extract_metrics.py); artefato `reports/metrics.json`; testes em [`tests/sitl/`](../tests/sitl). |
| Gates automáticos de aprovação de log via `quality-gates` **bloqueante** (cobertura, aceleração, duração, σ altitude) — 5/5 medido | Commit `b441a72`; [`scripts/quality_gates.py`](../scripts/quality_gates.py); thresholds em [`quality_gates.yaml`](../quality_gates.yaml). |
| ADR-0003 formalizando critérios automáticos de aprovação de log SITL | [`decisoes/0003-criterios-aprovacao-log-sitl.md`](decisoes/0003-criterios-aprovacao-log-sitl.md); thresholds consolidados em [ADR-0005](decisoes/0005-thresholds-quality-gates.md). |
| Mocks dos dashboards QoS/QoP/Gerencial substituídos por **dados reais** do pipeline (`metrics.json` + DORA) | Commits `2a523b6` (QoP/Gerencial) e `69d8949` (QoS); [`dashboard-implementation-report.md`](dashboard-implementation-report.md); coleta DORA em [`scripts/collect_gitlab_metrics.py`](../scripts/collect_gitlab_metrics.py). |

### Médio prazo já entregue — eixo "integridade do pipeline"

| Item entregue | Evidência verificável |
|---|---|
| ADR-0004 formaliza GPG signing obrigatório em `main` (push rule *Reject unsigned commits*) | [`decisoes/0004-gpg-signing-main.md`](decisoes/0004-gpg-signing-main.md). *Decisão registrada; enforcement server-side é próximo passo (§3.2).* |
| Gitleaks + Semgrep ativos como jobs de SAST no runner dedicado `sonar-00` | Commit `c967ad6` (`feat/sast-integridade`); [`ci/sast.yml`](../ci/sast.yml); [`.gitleaks.toml`](../.gitleaks.toml); [ADR-0007](decisoes/0007-sast-semgrep.md). *Roda em modo informativo (`allow_failure`); torná-lo bloqueante é próximo passo (§3.2).* |
| Branch protection de `main` documentada (MR + review + pipeline verde + commits assinados) | [ADR-0004](decisoes/0004-gpg-signing-main.md) (push rules); [`dev-rules.md`](dev-rules.md) §4; gate humano de promoção em [ADR-0008](decisoes/0008-gate-humano-aprovacao-manual.md). |

## 3. Roadmap

### Longo prazo (pós-M10) — *Entregáveis Desejáveis* do TAPI

| Item | Evidência |
|---|---|
| Análise de log via IA generativa | TAPI seção *Entregáveis Desejáveis* + Anexo B.5: *"1 serviço rodando que sobe o log, já gera 1 análise pra gente com a LLM"*. |
| Integração com Matlab/Simulink (Raia 1 do workflow Jacto) | TAPI Anexo A.4 — Raia 1 (Model-Based Design) com loop MIL/SIL/HIL. |
| Expansão para HIL/PIL com Pixhawk físico | TAPI Anexo A.4 — Raia 2 (Test Rigs versionados). |

## 4. Métricas de sucesso

Metas já **medidas** na Sprint 3 estão marcadas (valor medido em [`projeto.md` §8.1.1](projeto.md)); as demais seguem como meta a confirmar.

| Métrica | Meta | Status na Sprint 3 | Fonte |
|---|---|---|---|
| Lead Time for Changes (DORA) | < 24h (mudanças simples) | **Medido:** mediana 0,4 h | DORA Core ([6] em [`projeto.md` §7](projeto.md)) |
| Deployment Frequency (DORA) | ≥ 1 release/sprint | **Medido:** 10 deploys staging | idem |
| Change Failure Rate (DORA) | < 15% | **Medido:** `main` 0% | idem |
| Cobertura de testes (`libs/`) | ≥ 90% (ratchet) | **Medido:** 98% | [`quality_gates.yaml`](../quality_gates.yaml) |
| Tempo de análise de voo `.ulg` (produção) | < 10 min (AS-IS: 2–3 dias) | Projetado (ver §8.1.2) | TAPI Anexo B.5 |
| Cobertura de gates por commit em `main` | 100% | Projetado (enforcement em §3.2) | [`projeto.md` §5.1](projeto.md) |
