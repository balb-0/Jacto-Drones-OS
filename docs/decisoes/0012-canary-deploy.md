# ADR-0012 — Canary deploy com health-check fail-closed (auto-rollback do rollout)

**Status:** Aceito
**Data:** 2026-06-25
**Autores:** G04 (Sprint 4) — TG-C1 (canary deploy + health-check no pipeline)

> Estende o eixo de Deploy (ADR-0006: CD imutável sem registry) com um estágio de
> **canário** ANTES de staging/prod: a promoção deixa de ser um salto direto
> (dev→staging→prod) e passa por um subconjunto da frota cujo **health-check é
> fail-closed**. Se o canário adoece, o rollout não avança — sem inspeção humana.
> No espírito "rastro que ensina": o deploy deixa de ser só *descrito* e passa a
> ser *comprovado* por um portão automático e auditável.

## Contexto

Dois sinais convergem para esta decisão:

1. **Desconto do avaliador (Serviços de Deploy 3,0/4,0):** *"deploy simples,
   lacuna entre deploy descrito e comprovado"*. O modelo de CD da ADR-0006
   (`scripts/promote_artifact.py` re-aponta o artefato imutável por SHA entre
   `staging`/`prod`/`release`) registra a promoção, mas **nada verifica que o
   artefato promovido está são** no destino — staging/prod recebem o artefato
   por ordem de stage assim que o gate passa, sem um passo de validação de
   rollout. O deploy está descrito, não comprovado.
2. **Pedido do parceiro:** *"canary deploy, faz sentido na frota Jacto"*. Na
   narrativa da Jacto, o mesmo firmware atende vários clientes (ADR-0011); soltar
   uma versão para a frota inteira de uma vez é arriscado. Liberar primeiro a um
   **subconjunto** (canário) e só prosseguir se ele estiver saudável é o padrão
   de rollout que o parceiro espera.

Três fatos da esteira moldam o desenho (reaproveitamento, não invenção):

- **A régua de "está são?" já existe.** `scripts/quality_gates.py` + `quality_gates.yaml`
  (ADR-0005) já definem os limiares que reprovam o merge (coverage, métricas de
  missão, anomalia CRITICAL — ADR-0009). O canário deve ser medido pela **mesma
  régua**, não por uma cópia que possa divergir.
- **Os artefatos de saúde já são de pipeline.** `reports/metrics.json` (job
  `sitl-mission-metrics`, stage `test`) e `reports/anomalies.json` (job
  `detect-anomalies`, stage `gate`, contrato `{_meta, anomalies}`) já existem
  quando o deploy roda — o health-check os consome sem novo build/missão.
- **A ordem de stage já é o anti-DAG-bypass.** ADR-0006 estabeleceu que jobs de
  promoção rodam por ordem de stage (sem `needs:` que antecipe), para que ninguém
  contorne o gate. O canário herda essa doutrina.

## Decisão

**Inserir um stage `canary` ENTRE `gate` e `deploy`, com um health-check
fail-closed que funciona como rollback automático do rollout.** Concretamente:

1. **Stage `canary` no pipeline** (`.gitlab-ci.yml`): `... gate → canary →
   deploy → notify`. Os jobs do canário herdam `metrics.json`/`anomalies.json`
   por **ordem de stage** (gate → canary), sem `needs:` que antecipe — preserva a
   doutrina anti-DAG-bypass da ADR-0006 (canary roda DEPOIS do gate, nunca o
   antecipa).

2. **`deploy_canary`** (`ci/deploy.yml`, stage `canary`, automático em
   `develop`/`main`): promove o artefato imutável por SHA ao **canário** via
   `scripts/promote_artifact.py --env canary` (novo ambiente, mesmo manifesto de
   deploy simulado da ADR-0006, agora com `rollout_subset`). Grava
   `reports/deploy-canary.json`.

3. **`canary` = subconjunto `jacto_ref`.** O canário é o **cliente de referência**
   (ADR-0011), que roda a missão canônica `square_50m` e de quem saem os
   `metrics.json`/`anomalies.json` canônicos. É o subconjunto natural: já é o voo
   contra o qual os gates/tests-sitl são calibrados.

4. **`canary_healthcheck`** (`ci/deploy.yml`, stage `canary`, automático em
   `develop`/`main`, APÓS `deploy_canary`): roda `scripts/canary_healthcheck.py`.
   Canário **SAUDÁVEL** ⟺ **0 anomalia CRITICAL** (`anomalies.json`) **E** os
   **invariantes-chave da missão dentro do gate** (`metrics.json`:
   `max_acceleration_m_s2`/`mission_duration_s`/`std_altitude_cruise_m` ≤
   threshold). O script **reusa os checks de `quality_gates.py`**
   (`check_anomalies`, `check_mission_metrics`) lendo o mesmo `quality_gates.yaml`
   — par contratual com ADR-0005/ADR-0009 (mudar o limiar lá move gate E canário
   juntos). É **PURO + CLI** (`evaluate_canary` sem I/O de rede), espelhando
   `quality_gates.py`/`detect_anomalies.py`.

5. **Fail-closed = auto-rollback do rollout.** Se o canário está DOENTE,
   `canary_healthcheck` sai com **código ≠ 0** → pipeline **vermelho** → os jobs
   do stage `deploy` (staging/prod) **NÃO rodam**. A promoção a staging/prod nunca
   acontece: o rollout é interrompido no canário (rollback automático — o artefato
   ruim não avança). É o mesmo princípio fail-closed do gate de anomalias
   (ADR-0009), aplicado agora à **promoção**. `reports/canary-health.json` fica
   como rastro auditável.

6. **`deploy_staging` depende do canário verde** (`needs: [canary_healthcheck]`).
   Staging só promove se o health-check passou; como `canary` é stage
   intermediário entre `gate` e `deploy`, depender dele **não** antecipa nada
   (não é DAG-bypass). A cadeia `canary → staging → prod` fica explícita
   (`deploy_prod` segue com `needs: [deploy_staging]`).

7. **Baseline bom NUNCA dispara o fail-closed (invariante de projeto).** No
   baseline real `jacto_ref`/`square_50m` (accel 11.01 < 15, dur 78.83 < 180,
   std 0.688 < 1.0, **0 anomalias**) o canário é SAUDÁVEL → exit 0 (verde). O
   fail-closed só dispara num canário **genuinamente ruim** (anomalia CRITICAL ou
   KPI fora do envelope). Garantido por teste (`tests/unit/test_canary_healthcheck.py`,
   caso `test_baseline_real_square50m_canario_saudavel`): se o canário reprovasse
   o baseline bom, a esteira nunca promoveria nada — exatamente o que esta decisão
   proíbe.

## Alternativas consideradas

- **Manter dev→staging→prod sem canário (status quo).** Rejeitada: é a lacuna que
  o avaliador apontou — deploy descrito, não comprovado; nenhum passo valida o
  rollout antes de staging/prod.
- **Health-check só informativo (`allow_failure: true`).** Rejeitada: não seria
  fail-closed — um canário doente seguiria para staging/prod com o pipeline
  "verde". O valor do canário é justamente **interromper** o rollout; tem de ser
  bloqueante (mesmo argumento de "anomalia como gate", ADR-0009).
- **Reescrever os critérios de saúde no health-check.** Rejeitada: duplicaria os
  limiares e arriscaria divergência canário × gate. Reusar `quality_gates.py` +
  `quality_gates.yaml` mantém um par contratual auditável (mudou no gate, muda no
  canário).
- **Canário sobre TODOS os clientes da matrix (ADR-0011).** Rejeitada para esta
  sprint: multiplicaria o custo e os demonstrativos (`cliente_a`/`cliente_b`) não
  são canônicos (geometria/altitude próprias, não alimentam o gate). O canário é
  o cliente de referência `jacto_ref`; escalar é trocar o `--canary` quando
  houver subconjunto real.
- **Rollback "ativo" (re-apontar o canário ao SHA anterior) em vez de só barrar a
  promoção.** Rejeitada por ora: como o deploy é **simulado** (ADR-0006, sem alvo
  k8s/OpenChoreo real), o rollback efetivo do rollout é **não promover** a
  staging/prod (o artefato ruim não avança). O `rollback_prod` (manual, por SHA)
  segue existindo para prod. Rollback ativo do canário fica para quando o alvo
  real existir.

## Consequências

**Positivas:** deploy deixa de ser só descrito e passa a ser **comprovado** por um
portão automático (responde ao desconto do avaliador); canário fail-closed =
auto-rollback do rollout sem inspeção humana (responde ao parceiro); régua única
reusada do gate (par contratual ADR-0005/0009, sem janela de divergência);
`reports/canary-health.json` e `reports/deploy-canary.json` como rastro auditável;
mudança **aditiva** (staging/prod/rollback/release intactos; só staging ganha
`needs:` no canário).

**Negativas:** mais um stage no caminho crítico da promoção (custo pequeno: o
health-check é Python puro, segundos, não rebuilda nada); o canário herda a
limitação de "deploy simulado" da ADR-0006 (o rollback é "não promover", não um
rollback ativo no alvo real — explícito acima); o par canário/gate exige a mesma
disciplina do par front/CI (mitigado por reusar literalmente `quality_gates.py`,
não copiar limiar). O `needs:` de `canary_healthcheck` relista os produtores de
`metrics.json`/`anomalies.json` (custo de manutenção se a topologia mudar) —
mesmo trade-off já aceito em `ci/quality-gates.yml` (ADR-0009).

## ADRs relacionadas

- **ADR-0005** — thresholds dos quality gates e ratchet: o canário usa **a mesma
  régua** (`quality_gates.yaml`); apertar limiar lá aperta o canário também.
- **ADR-0006** — CD imutável sem registry: o canário promove o **mesmo artefato
  por SHA sem rebuild** e herda a doutrina de ordem de stage como anti-DAG-bypass.
- **ADR-0009** — anomalia CRITICAL como gate fail-closed: o canário **reusa**
  `check_anomalies` e aplica o mesmo princípio fail-closed à promoção.
- **ADR-0011** — matrix multi-cliente: o canário é o cliente de referência
  `jacto_ref` (subconjunto canônico do rollout).
- `scripts/canary_healthcheck.py`, `scripts/promote_artifact.py` (`--env canary`),
  `ci/deploy.yml` (`deploy_canary`/`canary_healthcheck`),
  `tests/unit/test_canary_healthcheck.py` — a implementação.
