# Protocolo de medição DORA — Jacto Drones OS

> Fecha o feedback S2 (item 2): cada indicador declara **janela × método ×
> critério de aceite**, com a base de dados explícita. Fonte: API GitLab
> `git.inteli.edu.br` projeto `10705`, snapshot coletado em **2026-05-29** por
> `scripts/collect_gitlab_metrics.py`. Dados em `src/src/data/dora.json` e
> `src/src/data/process-metrics.json`.

## Princípio de honestidade

A amostra é **pequena** (61 pipelines, 21 MRs mergeados, 10 deploys de staging) e
boa parte das falhas são **iterações de de-risking** (spike SITL), não incidentes
de produção. Por isso reportamos cada indicador **com a sua janela e uma nota**, e
separamos `develop` (desenvolvimento) de `main` (proxy de produção). Onde não há
dado suficiente (MTTR), declaramos **não medido** em vez de inventar um número.

## Coleta (como os números nascem)

Em **produção** o coletor roda no CI (job dedicado) com token protegido
(`GITLAB_TOKEN`/`CI_JOB_TOKEN`), consulta os endpoints REST v4
(`/pipelines`, `/deployments`, `/merge_requests`) e gera os JSONs. O **token
nunca vai para o browser nem para o JSON comitado** — o front-end importa apenas
o JSON estático (números agregados). Sem token o coletor **falha** (não inventa
dados); o snapshot comitado é a fonte de verdade até o CI rodar.

## Indicadores

### 1. Deployment Frequency (frequência de implantação)

| Dimensão   | Definição                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Janela** | Toda a vida do projeto até o snapshot (janela curta, esteira pedagógica).                                                                          |
| **Método** | Contagem de `deployments` com `status=success` no ambiente `staging` (job `deploy_staging` de `ci/deploy.yml`).                                    |
| **Aceite** | Reportar a contagem absoluta + janela. Classificação **conservadora** (`medium`): deploys sob demanda no de-risking, não cadência contínua diária. |
| **Valor**  | 10 deploys (staging) na janela.                                                                                                                    |

### 2. Lead Time for Changes (tempo de mudança)

| Dimensão   | Definição                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------- |
| **Janela** | 21 MRs mergeados (estado `merged`).                                                           |
| **Método** | Por MR: `merged_at − created_at`, em horas. Reporta **mediana e média**.                      |
| **Aceite** | Mediana < 24h → `elite`. Reportar média junto, pois caudas longas distorcem a média.          |
| **Valor**  | Mediana **0.4h** (`elite`), média **27.4h** (puxada por poucos MRs de vida longa, máx ~182h). |

### 3. Change Failure Rate (taxa de falha de mudança)

| Dimensão   | Definição                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Janela** | Pipelines por ref na amostra (`main`: 4; `develop`: 11).                                                                         |
| **Método** | `pipelines failed / total` restrito ao ref. DORA mede **produção** → usar `main`.                                                |
| **Aceite** | CFR de `main` ≤ 15% → `elite`. `develop` é reportado **à parte** (transparência), não conta como produção.                       |
| **Valor**  | Produção (`main`): **0%** (`elite`). Desenvolvimento (`develop`): **45%** — iterações de de-risking, não incidentes de produção. |

### 4. MTTR — Mean Time To Recovery (tempo médio de recuperação)

| Dimensão   | Definição                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Janela** | Snapshot atual.                                                                                                                                                    |
| **Método** | Tempo entre falha em produção e recuperação (próximo deploy/pipeline `success` no mesmo ambiente).                                                                 |
| **Aceite** | **Não medido** nesta janela: `main` teve **0 falhas** (nada a recuperar) e as falhas de `develop` são de-risking, não incidentes de produção.                      |
| **Valor**  | `null` (`nao-medido`). Quando houver incidente real em produção, o coletor passa a pareá-lo com o deploy de recuperação seguinte e calcula a mediana das durações. |

## Recalibração da detecção de anomalia (subtask 2.5.4)

Os thresholds da detecção de anomalia do Painel Gerencial (`services/manager.ts`,
constante `ANOMALY_CALIBRATION`) foram **recalibrados sobre esta série real** — não
mais sobre mocks. Base de calibração (snapshot 2026-05-29):

| Parâmetro                  | Antes (mock) | Depois (série real)                | Por quê                                                                                           |
| -------------------------- | ------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| Threshold de falha (DEV)   | 10% fixo     | 60.9% (baseline 45.9% + margem 15) | 10% fixo disparava **sempre** no de-risking (45.9% de falha na amostra) — falso-positivo crônico. |
| Threshold de falha (PROD)  | —            | 1% (qualquer falha em `main`)      | Produção é intolerante: `main` tem CFR 0%; qualquer falha é anomalia real.                        |
| Item envelhecido           | 10 dias      | 8 dias                             | Calibrado à escala real de lead time (cauda ~7.6 dias / 182.4h).                                  |
| Amostra mínima estatística | (sem guarda) | 8 pontos                           | σ é instável com poucos pontos; a série agregada real é curta → não emitir ruído.                 |

**Efeito verificado sobre o snapshot real** (`fetchAllManagerMetrics`):

- Falha de pipeline 45.9% → **não dispara** (abaixo do baseline calibrado): some o
  falso-positivo crônico do de-risking.
- Lead time de cauda (7.6d vs média 1.14d) → **dispara** alerta de cycle time:
  sinal genuíno de MR de vida longa.
- CFR `develop` 45% vs normal 15% → **dispara** congestionamento de estágio: sinal real.
- Detector estatístico com 3 pontos < 8 → **vazio** (honesto sobre a amostra curta).

A base completa fica versionada no próprio serviço (doc-comment de
`ANOMALY_CALIBRATION`) para auditoria.
