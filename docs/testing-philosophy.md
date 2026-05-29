# Filosofia de testes — Jacto Drones OS v0.1

> Acompanha o TG2.2 (Sprint 3, "bons testes de integração", Aula 09). Define como
> o G04 escreve e organiza testes da esteira. Traduzido/adaptado do demo do
> avaliador (`inteli-px4-cicd-demo`, `docs/testing-philosophy.md`).

## FIRST (Robert Martin)

| Sigla | Princípio | Como aplicamos |
|---|---|---|
| **F**ast | Roda a cada save | `tests/unit` (funções puras) <1s. SITL isolado em job próprio. |
| **I**ndependent | Ordem não importa | SITL lê `metrics.json` da missão única; sem estado global mutável. |
| **R**epeatable | Mesmo input → mesmo resultado | Sem `sleep()` arbitrário: `run_mission.py` espera **estado observável** (heartbeat, health armable, `mission_progress`) com timeout duro. |
| **S**elf-validating | Pass/fail binário | Asserções com **mensagem de diagnóstico** que explica a regra violada. |
| **T**imely | Escritos com o código | `compute_metrics_from_data` nasce com `tests/unit/test_extract_metrics.py`. |

## Pirâmide vs Troféu

Para firmware, o **troféu** (Kent Dodds) se aproxima mais da realidade: pouca
lógica pura (geometria, redução estatística), muito valor na **composição**
(PX4 + simulador + controle). Por isso:

- `tests/unit/` — funções puras (`libs/`, `scripts/extract_metrics.py`). Rápidos, baratos.
- `tests/sitl/` — integração real: missão no SITL → `.ulg` → `metrics.json` → asserções.
- Análise estática (ruff/SAST) na base; gates obrigatórios no TG6.

## Baseline × Invariante (separação deliberada)

| | Baseline threshold (mutável) | Invariante físico (imutável) |
|---|---|---|
| Exemplo | "missão dura ≤ 180 s" | "aceleração nunca passa de 15 m/s²" |
| Arquivo | `tests/sitl/test_baseline_thresholds.py` | `tests/sitl/test_physical_invariants.py` |
| Muda via | PR comum + justificativa | **ADR + revisão de engenharia mecânica** |

Misturar os dois faz baseline virar "intocável" (ninguém ajusta com medo) ou
invariante virar negociável (perde o papel de gate de segurança). Por isso ficam
em **arquivos distintos**, com políticas de mudança diferentes.

## Antipatterns evitados

1. **`time.sleep()` arbitrário** → espera por estado observável (`_wait_armable`,
   `mission_progress`) com timeout como rede de segurança.
2. **Estado global mutável entre testes** → cada teste lê o `metrics.json` da
   sessão; sem `global`.
3. **Asserção sem diagnóstico** → toda asserção explica *qual regra quebrou e por quê*.
4. **Baseline misturado com invariante** → arquivos separados.

## Critérios para "este teste tem valor?"

1. Que regressão real ele pega? (ex.: drone oscilando, missão travada, sinal NED invertido)
2. Vai dar falso positivo em mudança não-relacionada?
3. Quando falhar, a mensagem ensina o que mudar?
4. Custo de manter < custo de rodar?

## Referências

- Kent Dodds, *Testing Trophy*; Martin Fowler, *Test Pyramid*; R. Martin, *Clean Code* cap. 9.
- ADR-0003 (critérios de aprovação de log SITL) — origem dos invariantes/baseline.
