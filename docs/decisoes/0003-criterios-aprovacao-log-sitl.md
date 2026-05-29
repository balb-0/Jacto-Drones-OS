# ADR-0003 — Critérios Automáticos de Aprovação de Log do PX4 SITL

**Status:** **Aceito** (Sprint 3, 2026-05-28) — promovido de *Proposto* após o spike validar o arco SITL real (build + missão + extração de `.ulg`) e produzir as primeiras medições para calibrar os thresholds.
**Data da proposta:** 16/05/2026 · **Data da aceitação:** 2026-05-28
**Autores:** G04

> Este ADR é **prospectivo**: documenta a decisão **antes** do código que a implementa, conforme o princípio operacional permanente do G04 (ver [`guia-v1.md`](../../guia/guia-v1.md) — Regras de Ouro) e o eixo *"rastro que ensina"* cobrado pelo orientador Reginaldo Arakaki na Sprint Review 1 (30/04/2026): *"cada novo critério do pipeline deve nascer de um incidente real (ADR antes do código)"*.

## Contexto

A Sprint 2 entregou um pipeline GitLab CI com um `functional_tests_job` demonstrativo (cenários simulados em Python — ver [`testes-funcionais.md`](../testes-funcionais.md)). A Sprint 3 prevê substituí-lo por execução real de PX4 SITL + Gazebo + extração de `.ulg`, conforme item de curto prazo de [`melhoria-projeto.md`](../melhoria-projeto.md).

Para que essa execução tenha valor como **gate de qualidade** (e não apenas como roteiro automatizado), é preciso definir antes do código:

1. Quais métricas extraídas do `.ulg` decidem aprovação ou reprovação.
2. Quais thresholds tornam um voo "reprovado".
3. Como o gate sinaliza falha de volta para o desenvolvedor (loop de malha fechada — ver [`projeto.md` §4.3](../projeto.md)).

A motivação concreta vem do incidente real relatado pelo time da Jacto (TAPI Anexo B.5): uma rotina de ajuste de parâmetros internos causou **defasagem silenciosa entre comando e atuação**, que cresceu até o drone perder o controle e cair. Citação literal do Held: *"Se a gente detecta essa defasagem já nos primeiros segundos, a gente já interrompe"*.

## Decisão proposta

Adotar três famílias de métricas extraídas do `.ulg` como **gates obrigatórios** do job `validate-log`:

| Família | Métrica | Threshold inicial proposto | Origem do threshold |
|---|---|---|---|
| **Defasagem comando×atuação** | RMS do erro entre setpoint de atitude e atitude medida, em janela móvel de 1 s | RMS ≤ 5° durante voo nominal | Caso da queda (TAPI Anexo B.5) — valor a calibrar na Sprint 3 com base nos `.ulg` de voos PX4 padrão. |
| **Vibração** | Aceleração RMS no eixo Z (frequência 20–80 Hz) durante voo estacionário | ≤ 0.3 g | PX4 Log Analysis Guide — faixa típica de drones bem mantidos. |
| **Energia** | Drift de tensão por unidade de tempo durante hover | ≤ 0.05 V/s | Heurística de saúde de bateria + análise de log do PX4. |

Cada execução do job produz `functional-test-report.json` (formato já estabelecido em [`scripts/run_functional_tests.py`](../../scripts/run_functional_tests.py)) acrescido dos três campos. Falha em qualquer um marca o MR como reprovado.

> **Nota de implementação (Sprint 3):** esta proposta original (Sprint 2) falava de um job `validate-log` e de `functional-test-report.json`. A implementação real da Sprint 3 produz `reports/metrics.json` (via job `sitl-mission-metrics` + `scripts/extract_metrics.py`) e aplica os gates em `quality_gates.yaml` + `tests/sitl/`. Ver a seção "Aceitação na Sprint 3" abaixo para os gates efetivamente implementados.

## Alternativas consideradas (e rejeitadas)

- **Aprovação só por execução sem crash:** insuficiente — não detectaria o caso real da queda, que progrediu silenciosamente até o desastre.
- **Gate puramente subjetivo (revisão humana do log):** mantém o gargalo manual de 2–3 dias por voo da Jacto (TAPI Anexo B.5); contradiz a tese do OS v0.1.
- **ML/anomaly detection desde o início:** complexidade prematura — exige base histórica de logs que ainda não temos. Pode entrar como v0.3+ (ver `melhoria-projeto.md` médio prazo).

## Trade-offs aceitos (se aprovado)

- **Thresholds iniciais são propostos com baixa evidência empírica.** Devem ser calibrados na primeira semana da Sprint 3 com base em `.ulg` de voos PX4 padrão (não-Jacto). Marcados como provisórios até calibração.
- **Falsos positivos esperados:** Drones em manobra agressiva podem violar os limites sem haver problema real. Mitigação: thresholds aplicáveis apenas em segmentos de voo identificados como nominais (hover ou waypoint navigation).
- **Cobertura parcial:** Os três gates não cobrem todos os modos de falha. Outros critérios (ex.: drift de GPS, falha de IMU, padrões de RC out) entram em ADRs subsequentes conforme incidentes aparecerem.

## Aceitação na Sprint 3 (2026-05-28)

O arco SITL real foi validado por spike (pipeline `30065`): a missão `square_50m`
gera `.ulg` e `scripts/extract_metrics.py` produz `metrics.json` com 6 KPIs
cinemáticos. Os **gates efetivamente implementados** nesta sprint partem desses
KPIs já medidos (`quality_gates.yaml` + `tests/sitl/`):

| Gate implementado | Threshold | Tipo | Onde |
|---|---|---|---|
| `max_acceleration_m_s2` | ≤ 15.0 | invariante físico | `test_physical_invariants.py` |
| `mission_duration_s` | ≤ 180 s | baseline | `test_baseline_thresholds.py` |
| `std_altitude_cruise_m` | ≤ 1.0 m | baseline | `test_baseline_thresholds.py` |

**Reconciliação com as três famílias propostas.** As famílias originais
(defasagem RMS comando×atuação, vibração 20–80 Hz, drift de tensão) exigem
extração mais sofisticada (atitude setpoint×medida, FFT, série de tensão) que
fica como **incremento provisório calibrável** (Sprint 4), coerente com a
ressalva já registrada acima ("thresholds iniciais propostos com baixa evidência
empírica"). O **gate de defasagem** (a métrica-headline do incidente da queda) é
o próximo a entrar, via `vehicle_attitude` × `vehicle_attitude_setpoint`. Os
gates cinemáticos acima já dão à esteira poder real de reprovar um voo ruim —
materializando o "gate é regra" da Aula 10.

**Confirmação com a Jacto** (Vinícius/Held) sobre cobertura do caso da queda fica
agendada para a Sprint Review 3; não bloqueia a aceitação dos gates cinemáticos.

## Referências

- TAPI Anexo B.5 — caso da queda do drone protótipo.
- [`projeto.md` §4.3](../projeto.md) — princípio de Controle em Malha Fechada.
- [`melhoria-projeto.md`](../melhoria-projeto.md) — curto prazo, item `validate-log`.
- [`testes-funcionais.md`](../testes-funcionais.md) — escopo atual do gate funcional.
- Feedback do orientador Reginaldo Arakaki — Sprint Review 1 (30/04/2026), eixo "rastro que ensina".
- PX4 User Guide — Log Analysis (https://docs.px4.io/main/en/log/).
