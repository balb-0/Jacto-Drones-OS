# Trilha auditável do ciclo de CD — RC → staging → aprovação → rollback → release

> Como a esteira leva um artefato imutável (por SHA) de candidato a release até um
> GitLab Release, com uma **pausa humana** no meio e **rollback** auditável. Cada
> passo abaixo mapeia para um job real de [`ci/deploy.yml`](../../ci/deploy.yml) e
> deixa um manifesto JSON versionável (`reports/deploy-*.json` /
> `reports/release-*.json`), gerado por
> [`scripts/promote_artifact.py`](../../scripts/promote_artifact.py).

## Modelo (ADR-0006): promoção sem rebuild

O artefato imutável **não** é uma imagem de container (a instância não tem
Container Registry) — é o **artefato de CI por `$CI_COMMIT_SHA`** (`reports/metrics.json`
real, do `.ulg` da missão SITL). Promover de um ambiente para o outro é
**re-apontar o MESMO artefato por SHA**, nunca recompilar. Cada promoção registra
um manifesto `deploy-<env>.json` com `deploy_kind: "simulado"` — o alvo real
(k8s/OpenChoreo) é trabalho futuro, honestamente sinalizado.

## A trilha, passo a passo (cada passo = 1 job de `ci/deploy.yml`)

| # | Etapa | Job (`ci/deploy.yml`) | Gatilho | Manifesto produzido |
|---|---|---|---|---|
| 1 | **RC** (release candidate) | `sitl-mission-metrics` (`ci/sitl-metrics.yml`) → `quality-gates` (`ci/quality-gates.yml`) | push em `develop`/`main` | `reports/metrics.json` (o artefato imutável por SHA) |
| 2 | **Aprovação humana** | `quality-gates-human-approval` (`ci/quality-gates.yml`) | `when: manual`, environment protegido `quality-review` | rastro no log do job (quem aprovou + timestamp) |
| 3 | **deploy_staging** | `deploy_staging` | automático em `develop`/`main` | `reports/deploy-staging.json` |
| 4 | **deploy_prod** | `deploy_prod` (`needs: deploy_staging`) | `when: manual`, apenas `main` | `reports/deploy-prod.json` |
| 5 | **rollback_prod** | `rollback_prod` | `when: manual`, apenas `main`, exige `ROLLBACK_SHA` | `reports/deploy-prod.json` (re-aponta a SHA anterior) |
| 6 | **release** | `release` (release-cli) | tag `v*` | GitLab Release real + `reports/release-<tag>.json` |

### 1. RC — candidato a release (artefato imutável por SHA)

O candidato nasce de um pipeline verde: a missão SITL real gera `reports/metrics.json`
(extraído do `.ulg`) e os `quality-gates` (stage `gate`, **bloqueante**) atestam
os thresholds versionados (`quality_gates.yaml`, ADR-0005). Esse `metrics.json` por
`$CI_COMMIT_SHA` **é** o artefato imutável que será promovido sem rebuild.

> Nota multi-cliente (ADR-0011): com a `parallel:matrix`, o cliente de referência
> (`cliente_a`) publica o `reports/metrics.json` canônico que alimenta esta trilha;
> os demais clientes geram `reports/metrics-<cliente>.json` distintos.

### 2. Aprovação humana — "quem aperta o botão" (ADR-0008)

Antes de o veredito automático fechar, um humano olha o resumo. O gate humano
**forte** é a aprovação obrigatória do MR somada ao **environment protegido**
`quality-review`; o job `quality-gates-human-approval` é o registro pedagógico
(`when: manual`) que deixa rastro de "aprovação concedida" no log. Em push direto
para `main`/`develop` o job é opcional e não trava o pipeline verde.

### 3. `deploy_staging` — automático

```bash
python scripts/promote_artifact.py --env staging --sha "$CI_COMMIT_SHA"
```

Roda automaticamente em `develop`/`main`, **sem `needs:`** (respeita a ordem de
stages — o `gate` roda antes, então não contorna os quality gates). Produz:

```json
{
  "artifact_ref": "ci-artifact@4f3c9a1b7d2e",
  "artifact_sha": "4f3c9a1b7d2e8c5a0b9f6e1d3a2c8b7e6f5d4c3b",
  "deploy_kind": "simulado",
  "environment": "staging",
  "note": "Deploy simulado (ADR-0006): instância sem Container Registry; artefato imutável = artefato de CI por SHA, promovido sem rebuild.",
  "pipeline_id": "31201",
  "project": "graduacao/2026-1b/t13/g04",
  "rollback": false,
  "tag": null
}
```

### 4. `deploy_prod` — gate humano (`when: manual`, só `main`)

```bash
python scripts/promote_artifact.py --env prod --sha "$CI_COMMIT_SHA"
```

`needs: ["deploy_staging"]` sequencia prod **após** staging (mesmo artefato por
SHA, sem rebuild). O `when: manual` vive **dentro** do `rule` — alguém precisa
apertar o botão. Produz `reports/deploy-prod.json` com `"rollback": false`.

### 5. `rollback_prod` — re-aponta prod a um SHA anterior

```bash
# acionar manualmente informando a variável ROLLBACK_SHA (SHA do artefato alvo)
python scripts/promote_artifact.py --env prod --sha "$ROLLBACK_SHA" --rollback
```

Se `ROLLBACK_SHA` não for informado, o job **falha** (`exit 1`) em vez de
re-apontar para nada. O manifesto registra o rollback (`"rollback": true`):

```json
{
  "artifact_ref": "ci-artifact@a1b2c3d4e5f6",
  "artifact_sha": "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
  "deploy_kind": "simulado",
  "environment": "prod",
  "note": "Deploy simulado (ADR-0006): instância sem Container Registry; artefato imutável = artefato de CI por SHA, promovido sem rebuild.",
  "pipeline_id": "31255",
  "project": "graduacao/2026-1b/t13/g04",
  "rollback": true,
  "tag": null
}
```

### 6. `release` — GitLab Release real em tag `v*`

```bash
python3 scripts/promote_artifact.py --env release --sha "$CI_COMMIT_SHA" --tag "$CI_COMMIT_TAG"
```

Em tag `v*`, a keyword `release:` (release-cli) cria um **GitLab Release real**
referenciando o artefato imutável por SHA (`dependencies: ["sitl-mission-metrics"]`
herda o `metrics.json` do mesmo SHA da tag). Produz `reports/release-<tag>.json`:

```json
{
  "artifact_ref": "ci-artifact@9012345678ab",
  "artifact_sha": "9012345678abcdef0123456789abcdef01234567",
  "deploy_kind": "simulado",
  "environment": "release",
  "note": "Deploy simulado (ADR-0006): instância sem Container Registry; artefato imutável = artefato de CI por SHA, promovido sem rebuild.",
  "pipeline_id": "31290",
  "project": "graduacao/2026-1b/t13/g04",
  "rollback": false,
  "tag": "v0.4.0"
}
```

## Como reproduzir os manifestos localmente (sem CI, sem token)

```bash
python3 scripts/promote_artifact.py --env staging --sha "$(git rev-parse HEAD)"
python3 scripts/promote_artifact.py --env prod    --sha "$(git rev-parse HEAD)"
python3 scripts/promote_artifact.py --env prod    --sha "<sha-anterior>" --rollback
python3 scripts/promote_artifact.py --env release --sha "$(git rev-parse HEAD)" --tag v0.4.0
ls reports/deploy-*.json reports/release-*.json
```

Os JSONs acima foram **gerados pelo próprio `scripts/promote_artifact.py`** (mesma
função `build_record`), variando apenas `pipeline_id`/SHA/tag. No arquivo em disco
os acentos saem escapados (`â…`, `ensure_ascii` default do `json.dumps`);
aqui estão em UTF-8 por legibilidade.

## Notas honestas (limite da evidência)

- **Deploy é simulado** (`deploy_kind: "simulado"`): os jobs registram a promoção
  por ambiente; não há cluster real por trás (ADR-0006, espelha o ADR-002 do demo).
  Os SHAs/`pipeline_id` dos exemplos são ilustrativos.
- **Ambiente pedagógico/controlado**, não produção real da Jacto.
- O `release` é o único passo que materializa um **artefato real de plataforma**
  (GitLab Release via release-cli); os demais deixam manifesto JSON auditável.
