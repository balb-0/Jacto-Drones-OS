# Validação a posteriori do feedback da Sprint 2

> **Propósito.** Este documento é a **prova de fechamento** dos 3 pontos
> levantados por José Romualdo na avaliação da Sprint 2 (**nota 7,5/10**),
> destinada à Sprint Review 3. Para cada ponto, declaramos a **evidência
> verificável no entorno imediato** (commit, branch/MR, seção e arquivo) que
> sustenta a afirmação de que a Sprint 3 o endereçou. **Não há números
> inventados:** os KPIs citados são os **medidos** em
> [`src/src/data/dora.json`](../src/src/data/dora.json) e
> [`src/src/data/metrics.json`](../src/src/data/metrics.json); o que ainda é
> meta aparece **rotulado como projetado**.

## 1. Os 3 pontos do feedback S2 (AS-IS)

Diagnóstico recebido na avaliação da Sprint 2 (estado **AS-IS**, antes da Sprint 3):

| # | Critério (nota S2) | O que faltava (feedback literal) |
|---|---|---|
| 1 | **Serviços de Integração** (3,3/4) | Mapa de cobertura **sem contrato operacional por integração** — faltava, por interface, `gatilho × dado de entrada × saída esperada × critério de falha`. |
| 2 | **Indicadores QoS/QoP** (2,9/4) | Indicador **sem protocolo de medição** no quadro principal — faltava `janela × método × regra de aceite` declarado ao lado do número. |
| 3 | **Avaliação dos Resultados** (1,3/2) | Avaliação com **metas previstas no lugar de medidas** e prosa não-aderente — faltava separar literalmente **medido × projetado**. |

## 2. Checklist de fechamento (TO-BE) — evidência por ponto

Legenda de status: ✅ entregue e mergeado em `develop`; 🟡 entregue em branch dedicada (a integrar via MR na Sprint 3).

### ✅ Ponto 1 — Contrato operacional por integração

A Sprint 3 fecha o item em **duas camadas**:

- **Camada 0 (CD/contratos):** criação do mapa de cobertura do deploy com a tabela
  **§2 "Contratos operacionais por integração"** — 8 integrações, cada uma com
  `gatilho × dado de entrada × saída esperada × critério de falha por interface`.
- **Camada 2 (docs do projeto avaliado):** os mapas existentes de
  `projeto.md` **§5.6** (cobertura funcional) e **§5.7** (cobertura não-funcional)
  permanecem como AS-IS e passam a ser **estendidos ao lado de deploy** pelo novo
  mapa, que se referencia explicitamente a eles.

| Item × evidência | Onde verificar |
|---|---|
| Tabela de contratos por integração (gatilho/entrada/saída/falha) | [`docs/mapa-cobertura-deploy.md`](mapa-cobertura-deploy.md) **§2** |
| Commit que cria a cobertura funcional do deploy | `9561e90` — *docs(deploy): mapa de cobertura funcional do deploy* |
| Commit que cria os contratos por integração | `4d53d97` — *docs(deploy): contratos por integracao (gatilho/entrada/saida/falha)* |
| MR / branch que integra a Camada 0 em `develop` | branch `feat/deploy-cd-pipeline` → merge `b847a13` em `develop` |
| Vínculo com os mapas avaliados | [`projeto.md` §5.6](projeto.md) e [§5.7](projeto.md) (o novo mapa estende-os; cabeçalho de `mapa-cobertura-deploy.md` cita "§5.6/§5.7") |
| Critério de falha embasado em gate | `quality_gates.yaml` + [ADR-0003](decisoes/0003-criterios-aprovacao-log-sitl.md) (linhas `métricas → quality gate`, `gate verde → deploy`) |

> **Honestidade.** Os contratos cobrem a malha **CD** (push→build→missão→métricas→gate→staging→prod→release→rollback). Os contratos de **integração de serviços de plataforma** (mission-service, ops-web, telemetry-ingest) seguem como repositórios placeholder de `projeto.md` §5.6 (Nota), a materializar quando os repositórios forem criados.

### 🟡 Ponto 2 — Protocolo de medição (janela × método × aceite)

Cada indicador exibido nos dashboards passa a declarar, **versionado e ao lado do
número**, como é medido. Princípio "evidência no entorno imediato": a UI renderiza
o protocolo junto do valor, sem o leitor precisar sair do painel.

| Item × evidência | Onde verificar |
|---|---|
| **Protocolo QoP/DORA** (janela × método × aceite, com base de dados explícita e princípio de honestidade) | [`docs/dora-protocolo.md`](dora-protocolo.md) — cabeçalho declara "Fecha o feedback S2 (item 2)" |
| **Protocolo QoS** (mapa indicador→protocolo tipado, 1:1 com `QoSIndicatorId`) | [`src/src/data/qos-protocol.ts`](../src/src/data/qos-protocol.ts) — comentário declara "fecha feedback S2 item 2" |
| Origem dos aceites (threshold + fonte) | `quality_gates.yaml` (`mission_metrics`) + [ADR-0003](decisoes/0003-criterios-aprovacao-log-sitl.md), citados em cada linha de `qos-protocol.ts` |
| MR / branch QoP (manager) | branch `feat/dashboard-qop-manager` → merge `2a523b6` em `develop` |
| MR / branch QoS | branch `feat/dashboard-qos` → merge `69d8949` em `develop` |

**Amostra de protocolo declarado (extraído das evidências, não inventado):**

| Indicador | Janela | Método (resumo) | Aceite |
|---|---|---|---|
| Lead Time (DORA) | 21 MRs mergeados | `merged_at − created_at`, mediana e média | mediana < 24h → `elite` |
| Change Failure Rate | pipelines por ref (`main`:4, `develop`:11) | `failed/total` restrito ao ref; produção = `main` | CFR `main` ≤ 15% → `elite` |
| `std_altitude_cruise_m` (QoS) | último run em `develop`, janela de cruzeiro `square_50m` | `sitl-mission-metrics` → `.ulg` → `extract_metrics.py` | ≤ 1.0 m (`quality_gates.yaml`) |

### 🟡 Ponto 3 — Avaliação medida × projetada (separação literal)

A `projeto.md` **§8 (Avaliação dos Resultados)** é refatorada para separar
**literalmente** o que foi **medido** do que é **meta projetada**, com prosa
aderente ao que os logs sustentam.

| Item × evidência | Onde verificar |
|---|---|
| Refatoração de `projeto.md` §8 (tabelas distintas medido × projetado + prosa aderente) | branch `docs/avaliacao-resultados` (**TG3.1**) — a integrar via MR na Sprint 3 |
| KPIs **medidos** que alimentam a coluna "medido" | [`src/src/data/dora.json`](../src/src/data/dora.json) e [`src/src/data/metrics.json`](../src/src/data/metrics.json) (snapshot 2026-05-29, API GitLab projeto 10705) |
| Protocolo que dá auditabilidade ao "medido" | [`docs/dora-protocolo.md`](dora-protocolo.md) ("medido antes de projetado", MTTR declarado **não medido**) |

> **AS-IS atual de `develop`.** Na revisão deste documento, [`projeto.md` §8](projeto.md)
> ainda exibe a redação da Sprint 2 ("Meta provisória … em medição", "Redução
> **prevista** >99%"). A separação medido × projetado é o **TO-BE** entregue na
> branch `docs/avaliacao-resultados` (TG3.1); este item permanece **🟡** até o
> merge daquela branch em `develop`. Registrar como pendência rastreável é, por
> si, aderência ao princípio "medido antes de projetado".

**Números MEDIDOS disponíveis para a coluna "medido" (fonte: arquivos acima — não projetar):**

| KPI medido | Valor medido | Classificação | Fonte |
|---|---|---|---|
| Lead Time (mediana / média) | 0.4 h / 27.4 h | `elite` | `dora.json` |
| Change Failure Rate (produção `main`) | 0% | `elite` | `dora.json` |
| Deployment Frequency | 10 deploys (staging) na janela | `medium` (conservador) | `dora.json` |
| MTTR | — | **não medido** (declarado) | `dora.json` |
| `std_altitude_cruise_m` (missão SITL) | 0.688 m | dentro do gate (≤ 1.0 m) | `metrics.json` |
| `max_acceleration_m_s2` | 11.01 m/s² | dentro do gate (≤ 15.0) | `metrics.json` |
| `mission_duration_s` | 78.83 s | dentro do gate (≤ 180 s) | `metrics.json` |

> Tudo que **não** estiver nesta tabela (ex.: "análise de log < 10 min", "redução
> > 99%") permanece **meta projetada explícita** em §8 — nunca apresentado como medido.

## 3. Síntese de rastreabilidade

| Ponto S2 | Status | Evidência-âncora (1 clique) |
|---|---|---|
| 1 — Contrato por integração | ✅ em `develop` | `mapa-cobertura-deploy.md` §2 · commits `9561e90`/`4d53d97` · merge `b847a13` |
| 2 — Protocolo de medição | 🟡 em `develop` (dashboards mergeados) | `dora-protocolo.md` · `qos-protocol.ts` · merges `2a523b6`/`69d8949` |
| 3 — Medido × projetado | 🟡 branch `docs/avaliacao-resultados` | `projeto.md` §8 (TG3.1) + `dora.json`/`metrics.json` |

Cada linha acima aponta para um artefato versionado e um commit/branch
rastreável — não há afirmação sem âncora no entorno imediato.

## 4. Observações internas — Sprint 3

> Registro do que foi **validado a posteriori** pelo time (integrador
> @Fernando), conferindo que cada um dos 3 pontos do feedback S2 tem um
> artefato e um commit/MR **rastreável** antes da Sprint Review 3. Esta seção é
> o "fechamento" interno: confirma que o checklist da §2 não é declaração, e sim
> verificação no entorno imediato.

**Método da validação.** Para cada ponto, partimos do feedback literal (AS-IS),
localizamos o artefato que o endereça (TO-BE) e confirmamos a âncora no histórico
git (`git log`/`git show`) e no arquivo versionado. Nada foi aceito sem
evidência clicável.

| Ponto | Verificado a posteriori | Âncora rastreável | Veredito |
|---|---|---|---|
| 1 — Contrato por integração | `mapa-cobertura-deploy.md` §2 contém as 8 integrações com gatilho/entrada/saída/falha; cabeçalho referencia §5.6/§5.7 | commits `9561e90` e `4d53d97`; merge `b847a13` (`feat/deploy-cd-pipeline`) — **em `develop`** | **Fechado** |
| 2 — Protocolo de medição | `dora-protocolo.md` e `qos-protocol.ts` declaram janela × método × aceite por indicador, com origem dos thresholds | merges `2a523b6` (`feat/dashboard-qop-manager`) e `69d8949` (`feat/dashboard-qos`) — **em `develop`** | **Fechado** (dashboards mergeados) |
| 3 — Medido × projetado | §8 refatorada para tabelas distintas medido × projetado; KPIs medidos em `dora.json`/`metrics.json` | branch `docs/avaliacao-resultados` (**TG3.1**) — **a integrar via MR** | **Em integração** |

**Pendência honesta (não-fechado neste snapshot).** Na revisão, `projeto.md` §8 em
`develop` ainda exibe a redação S2 ("meta provisória … em medição"). O Ponto 3 só
se considera **integrado** após o merge de `docs/avaliacao-resultados`. Mantemos o
registro como pendência rastreável — coerente com "medido antes de projetado":
preferimos declarar o pendente a apresentar projeção como resultado.

**Princípios de doc aplicados nesta validação (autoavaliação interna):**

- **Evidência no entorno imediato** — cada linha tem commit/branch/arquivo/seção (§2, §3 e a tabela acima).
- **AS-IS antes de TO-BE** — §1 fixa o diagnóstico S2 antes de §2 mostrar a entrega.
- **Medido antes de projetado** — KPIs medidos isolados em tabela própria; metas rotuladas como projetadas.
- **Objetividade > completude** — tabelas item × evidência em vez de prosa; o que não tem âncora não é afirmado.

**Conclusão para a Sprint Review 3.** Os 3 pontos do feedback S2 estão endereçados
com rastreabilidade integral: **2 fechados em `develop`** (pontos 1 e 2) e **1 em
integração** (ponto 3, branch `docs/avaliacao-resultados`). Este documento é a
prova consolidada do fechamento.
