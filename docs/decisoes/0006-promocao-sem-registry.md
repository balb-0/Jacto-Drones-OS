# ADR-0006 — CD sem Container Registry: artefato de CI por SHA + deploy simulado

**Status:** Aceito
**Data:** 2026-05-28
**Autores:** G04 (Sprint 3)

> ADR derivado de um **achado de infraestrutura real** (spike de de-risking da
> Sprint 3), no espírito "rastro que ensina" do orientador Reginaldo: a restrição
> vira decisão documentada, não buraco silencioso.

## Contexto

O arco de CD do repositório de referência do avaliador (`inteli-px4-cicd-demo`,
GitHub Actions) usa: build de imagem PX4 SITL → **GitHub Container Registry (GHCR)**
taggeada por SHA → `pull` para rodar; promoção dev→staging→prod por **re-tag** da
imagem (`tools/promote_release.py`, ADR-004 do demo); alvo de deploy **simulado**
(OpenChoreo como manifesto, não cluster real — ADR-002 do demo).

Ao traduzir para o nosso GitLab (Inteli, CE 18.6.1), um spike mediu duas
restrições bloqueantes (pipelines `30001`/`30004`/`30040`/`30065`, branch
`spike/*`):

1. **Não há Container Registry na instância.** As variáveis `CI_REGISTRY` e
   `CI_REGISTRY_IMAGE` chegam **vazias** em runtime (o flag
   `container_registry_enabled` do projeto é inócuo sem registry na instância).
2. **O runner compartilhado `id=100` é docker-executor SEM privilégio nem
   socket** — não roda `docker build`/`docker run`/`docker compose` nem
   Docker-in-Docker (dind não inicializa). Porém **usa qualquer imagem pública
   como `image:` do job** e roda **Kaniko** (build sem daemon).

Logo, "build de imagem → registry → pull" não é executável como no demo.

## Decisão

1. **Build + execução do SITL acontecem _dentro_ do job**, usando a imagem
   pública `px4io/px4-dev-simulation-jammy` como runtime (clone PX4 → `make
   px4_sitl_default` → jmavsim headless → missão → `.ulg`). Cache de CI
   (`.ccache`) mantém o build rápido (~2–4 min, medido no spike). É o mesmo
   padrão do `release.yml` do demo, que builda PX4 do zero num job comum.
2. **O artefato imutável é o artefato de CI por `$CI_COMMIT_SHA`** (binário
   SITL + `metrics.json`), não uma imagem de container. Em tag `v*`, um
   **GitLab Release** com checksum/SBOM materializa o artefato versionado.
3. **Promoção dev→staging→prod = o MESMO artefato re-apontado por GitLab
   Environment, sem rebuild** (`scripts/promote_artifact.py`), com `prod`
   sob `when: manual` (Continuous Delivery — "quem aperta o botão", Aula 07).
   O **alvo de deploy é simulado** (registra a promoção); a operação real
   (k8s/OpenChoreo) é trabalho futuro — espelha o ADR-002 do demo.

## Alternativas consideradas (e rejeitadas para a Sprint 3)

- **Registry externo (Docker Hub/GHCR) + Kaniko build → pull.** Viável e mantém
  a história literal de "container registry"; rejeitada como padrão por
  introduzir dependência/credencial externa e, no caso do GHCR, reintroduzir o
  GitHub que o ADR-0001 eliminou (coerência com "GitLab como SSoT"). Fica
  registrada como plano B se o build in-job se mostrar custoso demais.
- **SITL fora do CI (máquina de build) + pipeline consome `.ulg`.** Mais robusto
  contra limites do runner, mas tira a execução do SITL de dentro da esteira
  (história de CD mais fraca). Não necessária — o build in-job foi validado.

## Consequências

**Positivas:** zero dependência externa; coerente com ADR-0001 (sem GitHub) e
"GitLab como SSoT"; produz `.ulg`/`metrics.json` reais (não mock); a restrição
de infra fica auditável (este ADR + evidência de pipeline).

**Negativas:** não exercita um Container Registry real nem deploy em infra real
(ambos simulados/documentados); o build roda a cada pipeline (mitigado por cache).

## Referências

- Spike de de-risking (issue #1, fechada): pipelines `30001`, `30004`, `30040`
  (build+boot+heartbeat), `30065` (missão completa).
- Demo do avaliador: `docs/adrs/ADR-002-openchoreo-simulado.md`,
  `ADR-004-promocao-por-retag.md`, `release.yml`.
- ADR-0001 (eliminação do mirror GitHub) — coerência da cadeia SCM.
- Aula 07 (CI vs Continuous Delivery vs Deployment; artefato imutável por SHA).
