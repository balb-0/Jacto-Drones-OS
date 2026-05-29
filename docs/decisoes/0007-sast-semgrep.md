# ADR-0007 — SAST (Semgrep) como gate de integridade, no runner dedicado sonar-00

**Status:** Aceito
**Data:** 2026-05-29
**Autores:** G04 (Sprint 3) — TG5 (integridade do pipeline)

> Espelha o **ADR-006 do demo do avaliador** (SonarQube self-hosted como gate de
> análise estática), traduzido para a nossa instância GitLab e para o eixo
> "integridade" do orientador Reginaldo. A numeração diverge: no demo é ADR-006,
> mas aqui **0006 já é "promoção sem registry"** — daí este ser o **0007**.

## Contexto

O arco de integridade do `inteli-px4-cicd-demo` (GitHub Actions) usa **SonarQube
self-hosted** (ADR-006 do demo, VM Azure `srv-sonar-01`) como gate de análise
estática: o job `sonar-scan` bloqueia o merge se o Quality Gate do Sonar reportar
`ERROR`, e os thresholds vivem em `quality_gates.yaml` (`sonar.*`).

Ao traduzir para o nosso ambiente, três fatos mudam o desenho:

1. **A integridade de hoje é client-side e pulável.** Os hooks Husky
   (TruffleHog no pre-commit, Trivy no pre-push, commitlint no commit-msg) rodam
   na máquina do dev e somem com `git --no-verify`. A Sprint 3 os portou para
   jobs de CI **server-side** (`ci/sast.yml`), inevitáveis.
2. **Não há SonarQube na nossa instância** (Inteli, CE 18.6.1), e introduzir um
   servidor Sonar externo reintroduziria a dependência/SPOF que o ADR-006 do
   demo assume como custo do instrutor — não temos esse custo provisionado.
3. **Há um runner DEDICADO para a carga de integridade:** `sonar-00` (id=133),
   separado do runner compartilhado id=100 (que faz build/missão, ADR-0006).

## Decisão

**Adotar Semgrep (OSS, CLI) como o motor de SAST do nosso eixo de integridade,
rodando no runner dedicado `sonar-00`, hoje informativo e bloqueante nas
Sprints 4-5.** Junto dele, a camada de secrets/deps em defesa em profundidade.

1. **Semgrep no lugar funcional do Sonar.** Job `semgrep` em `ci/sast.yml`
   (imagem pública `semgrep/semgrep`, `SEMGREP_RULES=auto`), `tags: [sonar-00]`.
   Entrega o que o `sonar-scan` do demo entregava — achados de SAST por regra —
   sem servidor externo. Como **alternativa** fica registrado o **template SAST
   nativo do GitLab** (`Security/SAST.gitlab-ci.yml`, que usa o analisador
   Semgrep do GitLab e emite `gl-sast-report.json` para a aba Security): não
   adotado agora porque exigiria `include: template:` no **`.gitlab-ci.yml`
   root** — e a regra de ouro da esteira é não editar o root (cada concern só
   adiciona seu `ci/*.yml` via glob) — e porque o widget de Security no MR
   depende de licença Ultimate.
2. **Defesa em profundidade, não um único scanner.** `ci/sast.yml` reúne:
   TruffleHog (secrets verificados, filesystem), Gitleaks (secrets por
   regra/regex — no `sonar-00`), Trivy (`fs` + `config`: CVE de dependências e
   misconfig de IaC/Dockerfile) e Semgrep (SAST de código — no `sonar-00`).
   Camadas complementares: o que uma heurística não pega, outra pega.
3. **Informativo agora → bloqueante nas Sprints 4-5 (ratchet de integridade).**
   Todos os jobs de `ci/sast.yml` têm `allow_failure: true` nesta sprint:
   publicam achados sem travar o merge, enquanto o time calibra ruído/baseline
   (mesmo espírito do baseline frouxo de `quality_gates.yaml`). O contrato
   versionado já existe — `quality_gates.yaml → sast.{require_passed: false,
   max_new_critical: 0, max_new_blocker: 0}`. Virar bloqueante = `require_passed:
   true` + remover `allow_failure` dos jobs SAST, quando o gate (TG6) amarrar a
   esteira ao runner `sonar-00`.

## Alternativas consideradas (e rejeitadas para a Sprint 3)

- **SonarQube self-hosted (literal do ADR-006 do demo).** Mantém a história 1:1,
  mas exige provisionar e manter um servidor (SPOF de disponibilidade, custo de
  VM). Rejeitada: Semgrep CLI no runner dedicado entrega o gate de SAST sem
  servidor externo. Fica como plano B se for preciso o ecossistema Sonar.
- **Template SAST nativo do GitLab.** Tecnicamente o caminho "idiomático", mas
  colide com a regra de ouro (editar o root) e com a licença Ultimate para o
  widget de MR. Registrado como evolução, não como adoção desta sprint.
- **Tornar os scanners bloqueantes já na Sprint 3.** Rejeitada: sem baseline de
  ruído, gates barulhentos viram "piada interna que ninguém respeita"
  (ADR-005 do demo). Primeiro medir, depois apertar — com dados, não ansiedade.

## Consequências

**Positivas:** SAST + secrets + deps **server-side e inevitáveis** (a integridade
sai da máquina do dev); zero servidor externo/SPOF; carga isolada no runner
`sonar-00` (não disputa o id=100 do build/missão); contrato de severidade já
versionado em `quality_gates.yaml`; caminho de endurecimento (ratchet) explícito.

**Negativas:** enquanto `allow_failure: true`, um achado real **não** bloqueia o
merge (mitigado pelo plano de virar bloqueante nas Sprints 4-5 e pelos
`--fail`/`--exit-code`/`--error` que deixam o job amarelo, nunca verde
silencioso); `auto` do Semgrep pode gerar falsos positivos a calibrar; o runner
`sonar-00` vira dependência da carga de integridade.

## Referências

- `ci/sast.yml` (TG5) — jobs trufflehog, trivy-fs, commitlint, gitleaks, semgrep.
- `quality_gates.yaml` → seção `sast` (contrato de severidade versionado).
- ADR-0004 (GPG signing em `main`) — par desta ADR no eixo integridade
  (procedência da autoria; aqui, integridade do código/segredos/deps).
- ADR-0006 (CD sem registry) — define o runner compartilhado id=100 e o porquê
  de um runner dedicado para SAST.
- Demo do avaliador: `docs/adrs/ADR-006-sonar-self-hosted.md` (gate de análise
  estática) e `ADR-005-thresholds-quality-gates.md` (ratchet/baseline de gates).
- GitLab Docs — *SAST* (`Security/SAST.gitlab-ci.yml`, analisador Semgrep);
  Semgrep OSS (`semgrep ci`, ruleset `auto`).
- Feedback do orientador Reginaldo Arakaki — eixo "rastro que ensina".
