# Mapa de Cobertura da Integração

Este documento detalha o Mapa de Cobertura da Integração do projeto **Jacto Drones OS v0.1**, servindo como referência para a arquitetura da esteira de Continuous Delivery, a infraestrutura de deploy/testes e o fluxo de trabalho da equipe. O recorte é o que **de fato roda na Sprint 3** (pipeline real, PX4 SITL, quality gates) — o que ainda é meta segue marcado como proposto.

## 1. Arquitetura da Esteira e Infraestrutura (GitLab CI/CD)

A arquitetura de integração contínua foi desenhada sob o conceito de **Sistema de Controle em Malha Fechada**: diferente de um pipeline puramente linear, a esteira usa os resultados dos testes e dos quality gates como sensores que realimentam a gestão do projeto, impedindo que o código avance se não atender aos critérios de qualidade de um software autônomo. Essa malha já está fechada na Sprint 3 — o veredito dos gates bloqueia o merge e é publicado automaticamente como comentário no Merge Request.

A infraestrutura é baseada no ecossistema **GitLab**:
- **GitLab Repository:** fonte única da verdade para o código.
- **GitLab Runners:** nós de execução isolados (containers Docker) que processam build, testes e segurança. O runner compartilhado da instância é *docker-executor* sem socket/privilégio, portanto os jobs rodam a imagem pública como runtime e os scanners operam em modo *filesystem* (sem `docker build`/`docker run`), conforme [ADR-0006](decisoes/0006-promocao-sem-registry.md).
- **Promoção de artefato por SHA:** não há GitLab Container Registry. O artefato promovido entre ambientes é o conjunto de saídas de CI identificado pelo `$CI_COMMIT_SHA` (ex.: `metrics.json`); o deploy é **simulado por Environment** (staging automático, prod e rollback manuais) e a release em tag `v*` gera um GitLab Release real — ver [ADR-0006](decisoes/0006-promocao-sem-registry.md) e [`ci/deploy.yml`](../ci/deploy.yml).

### Diagrama de Fluxo (Malha Fechada)

<br>
<div align="center">
  <sup>Figura 1: Diagrama de Fluxo da Esteira em Malha Fechada</sup><br>
  <img src="../img/diagrama_integracao.png" alt="Diagrama de Integração em Malha Fechada"><br>
  <sub>Produzido pelos autores - 2026</sub>
</div>
<br>

## 2. Definition of Done (DoD) por track

O DoD é definido por track de engenharia, refletindo a **stack real** do projeto: firmware **C/C++ do PX4** (validado via SITL), web/painéis em **Next.js/TypeScript** e dados/automação em **Python**. Uma tarefa só é "Concluída" e mesclada (`develop`/`main`) se atender a 100% dos critérios da sua coluna.

| Categoria | Firmware (PX4, C/C++ — via SITL) | Web / Painéis (Next.js/TS) | Dados / Automação (Python) |
| :--- | :--- | :--- | :--- |
| **Código e estilo** | Build PX4 SITL conclui sem erro (cache ccache). | Sem erros de `tsc` e ESLint (`src/eslint.config.mjs`). | Código segue o padrão do repositório; funções puras testáveis. |
| **Testes** | Missão SITL (`square_50m`) voa e gera `.ulg`; `metrics.json` não degenerado; `pytest tests/sitl` passa. | App compila (`next build`); checagem de tipos (`tsc`) sem erro. | `pytest` em `tests/unit` com cobertura de linha ≥ 0,90 (ratchet, `quality_gates.yaml`). |
| **Quality gates** | Invariantes de missão dentro do threshold (`scripts/quality_gates.py`): aceleração ≤ 15 m/s², duração ≤ 180 s, σ-altitude cruzeiro ≤ 1,0 m. | Painel consome KPI real (DORA/missão), sem dado fabricado. | Gate de cobertura passa; gate **bloqueia o merge** quando reprova. |
| **Segurança (informativa na S3)** | Semgrep + Trivy `fs`/`config` + TruffleHog/Gitleaks publicam achados (`allow_failure`). | Idem — sem credenciais hardcoded. | Idem — `trivy fs` sobre dependências Python. |
| **Documentação** | Parâmetros de missão e critérios de log documentados; ADR quando há decisão ([`docs/decisoes/`](decisoes/)). | Comportamento do painel descrito; fonte do dado citada. | Origem da métrica documentada (artefato de CI / API GitLab). |
| **Rastreabilidade** | Commit Conventional + `Refs #N` (commitlint); MR vinculado à issue do GitLab (#2-#7, uma por TG). | Idem. | Idem. |
| **Revisão humana** | Aprovação de pelo menos 1 revisor que não seja o autor; CI verde. | Idem. | Idem. |

> **Estado na Sprint 3.** Os gates de **cobertura** e de **invariantes de missão** são **bloqueantes** (reprovam o merge). Os scanners de segurança (Semgrep, Trivy, TruffleHog/Gitleaks, commitlint) são **informativos** (`allow_failure`) nesta sprint e tornam-se bloqueantes nas Sprints 4-5, junto com assinatura GPG e SBOM — ver [ADR-0007](decisoes/0007-sast-semgrep.md) e [ADR-0004](decisoes/0004-gpg-signing-main.md). clang-tidy no firmware é roadmap (hoje o firmware é exercitado via SITL, não compilado isoladamente no CI).

## 3. Fluxo de Integração: do editor ao backlog

A integração entre o trabalho técnico e a gestão ágil é automatizada de ponta a ponta. A rastreabilidade é feita por **issues do GitLab + Conventional Commits + `Refs #N`** (validado por commitlint) — não há integração nativa Jira-GitLab nesta esteira; Jira/Notion permanecem como proposta futura.

### Fase 1: desenvolvimento local
O desenvolvedor sincroniza o repositório e implementa a feature. Ferramentas locais (ESLint/`tsc` para web, `pytest` para Python) operam preventivamente. Hooks Husky (commitlint, scanners) existem client-side, mas a integridade não depende deles: os mesmos controles rodam server-side no pipeline.

### Fase 2: versionamento rastreável (Conventional Commits)
O código é commitado no padrão Conventional Commits, com referência à issue do GitLab no corpo.
*Exemplo:* `feat(telemetry): adiciona coleta de cycle time` + `Refs #4`.

### Fase 3: abertura do Merge Request
O código é enviado via `git push` e abre-se um Merge Request para a branch de destino (`develop` ou `main`). A issue correspondente do GitLab é vinculada ao MR.

### Fase 4: integração contínua e quality gates (GitLab CI/CD)
O MR/branch aciona o pipeline com 6 stages — `lint → build → test → sast → gate → deploy` ([`.gitlab-ci.yml`](../.gitlab-ci.yml), fragmentos em `ci/*.yml`). O runner compila o PX4, roda a missão SITL, extrai `metrics.json` e avalia os quality gates.
- **Se um gate bloqueante reprova:** o job `quality-gates` falha (exit ≠ 0) e o **merge é bloqueado** — o sensor da malha fechada realimenta o time. Os scanners informativos publicam achados sem bloquear.
- **Se o pipeline passa:** o resultado dos gates e os KPIs da missão são publicados como **comentário automático no MR** (via token de serviço), aguardando a aprovação humana (Code Review).

### Fase 5: conclusão e promoção
Com o Code Review aprovado, o código é mesclado. O artefato de CI (identificado por SHA) é promovido por Environment: **staging** automático em `develop`/`main`; **prod** e **rollback** manuais; **release** real em tag `v*`. Não há push de imagem para Registry — a promoção é simulada e auditável por SHA ([`ci/deploy.yml`](../ci/deploy.yml), [`scripts/promote_artifact.py`](../scripts/promote_artifact.py), [ADR-0006](decisoes/0006-promocao-sem-registry.md)), fechando o ciclo da malha.
