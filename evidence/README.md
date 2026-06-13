# Pacote de Evidências — Esteira CI/CD (reauditável sem credencial)

> Responde ao feedback da Sprint 3 (avaliador): *"não consegui reexecutar essa
> validação pela API sem credencial; a auditoria externa do número fica limitada
> ao snapshot comitado"* + *"incluir no próprio repositório um pacote de
> evidências reprodutível"*. Aqui qualquer terceiro **reaudita os indicadores
> DORA a partir do que está versionado**, sem token e sem rede.

## Reauditoria em um comando (sem token)

```bash
python3 scripts/collect_gitlab_metrics.py --from-evidence evidence/raw \
  --output /tmp/process.json --dora-output /tmp/dora.json
diff <(jq -S . /tmp/dora.json) <(jq -S . evidence/dora.json)   # idênticos (só _meta.coletado_em muda)
```

Recomputa os indicadores a partir de `evidence/raw/*.json` (snapshot bruto da API
GitLab) usando **exatamente as mesmas funções de cálculo** do modo online
(`_build_process_payload` + `derive_dora`). Sem `--from-evidence` e sem token, o
coletor falha (`exit 2`) em vez de inventar números.

## Conteúdo

| Arquivo | O que é | Origem (endpoint API v4) |
|---|---|---|
| `raw/pipelines.json` | 100 pipelines (id, status, ref, sha, created_at, web_url) | `GET /projects/:id/pipelines` |
| `raw/deployments.json` | 23 deployments (status, environment, created_at) | `GET /projects/:id/deployments` |
| `raw/merge_requests.json` | 33 MRs merged (created_at, merged_at) | `GET /projects/:id/merge_requests?state=merged` |
| `process-metrics.json` | indicadores de processo recomputados | `collect_from_evidence(raw/)` |
| `dora.json` | 4 indicadores DORA derivados | `derive_dora(process)` |

## Mapa de rastreabilidade (número → fonte)

| Indicador (`docs/projeto.md` §8) | Valor | Como recomputar a partir de `evidence/raw/` |
|---|---|---|
| Deployment Frequency | 20 deploys `staging` success | `deployment_frequency(deployments, env="staging")` |
| Lead Time for Changes (mediana) | 0,2 h | `lead_time_for_changes(merge_requests)` |
| Change Failure Rate — produção (`main`) | 0 % | `change_failure_rate(pipelines, ref="main")` |
| Change Failure Rate — desenvolvimento (`develop`) | 21 % | `change_failure_rate(pipelines, ref="develop")` |
| MTTR | não-medido | sem incidente em `main` (nota honesta abaixo) |

## Notas honestas (limite da evidência — alinhado ao feedback S3)

- O recorte é **ambiente pedagógico/controlado**, não produção real da Jacto
  (limite reconhecido pelo próprio avaliador na Sprint 3).
- CFR de `develop` (21%) reflete **de-risking** (iterações de spike SITL), não
  falha de produção — DORA mede produção (`main`, 0%); ambos reportados por
  transparência.
- MTTR não medido: `main` teve 0 falhas (nada a recuperar). Protocolo de medição
  futura em `docs/dora-protocolo.md`.
- A janela é o snapshot bruto coletado em `_meta.coletado_em`. Para atualizar:
  rode o coletor no modo online (CI, com token protegido) e re-exporte
  `evidence/raw/`.
