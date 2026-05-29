# ADR-0008 — Gate humano: aprovação manual antes do veredito automático

**Status:** Aceito
**Data:** 2026-05-29
**Autores:** G04 (Sprint 3)

> Espelha o ADR-008 do demo do avaliador (`inteli-px4-cicd-demo`,
> "Aprovação manual entre mission-test e quality-gates"), adaptado ao GitLab
> (environment + `when: manual`). No espírito "rastro que ensina": a pausa
> humana é decisão documentada, não um botão solto na esteira.

## Contexto

A TG6 estabelece o `quality-gates` como **veredito automático**: o job do stage
`gate` (`ci/quality-gates.yml`) falha sozinho se algum threshold versionado
(`quality_gates.yaml`, ADR-0005) for violado. Funciona bem como enforcement,
mas no contexto pedagógico tem dois problemas:

1. **Pedagógico:** o comentário de gates no MR (TG6.4) passa direto e a turma
   não tem um ponto explícito para parar, olhar os números (actual × threshold)
   e discutir. O gate automático "engole" a discussão.
2. **Auditoria:** gates objetivos são bons, mas queremos registrar que um humano
   olhou o resumo antes do enforcement — um sanity check antes de o robô bater
   o martelo.

## Decisão

Adicionar o job `quality-gates-human-approval` ao `ci/quality-gates.yml`, no
stage `gate`, como **`when: manual` no environment protegido `quality-review`**
(`allow_failure: false` ⇒ pausa real: o pipeline não avança para o stage
`deploy` enquanto alguém não aprovar). Roda **apenas em MR**
(`rules: - if: $CI_PIPELINE_SOURCE == "merge_request_event"`); em push direto
para `develop`/`main` o job é **skipped** e o veredito automático (`quality-gates`)
segue sozinho — main é post-merge, ponto sem discussão. Mesma forma do
manual-approval do demo, traduzida de "required reviewers do environment" (GitHub)
para "environment protegido + job manual" (GitLab).

O job NÃO usa `needs:` (anti DAG-bypass, coerente com o job bloqueante e com
ADR-0006): convive como sibling do `quality-gates` no mesmo stage; o stage só
fecha — e o `deploy` só começa — quando ambos resolvem.

## Motivações

- **Pausa pedagógica explícita:** na aula a turma vê o pipeline travar, lê o
  comentário de gates (TG6.4) e o instrutor aprova ao vivo explicando o critério.
  Vira momento de aula, não detalhe perdido.
- **Sem custo fora de aula:** em push para `main`/`develop` o job é skipped; só
  o MR exige o clique. Não trava integração contínua do dia a dia.
- **Feature nativa do GitLab:** environment protegido + job manual, sem
  dependência externa. Demonstra um mecanismo de pipelines reais (manual
  approvals) que aparece em deploys de produção.

## Riscos conhecidos

- **Aprovação esquecida:** MR fica pendurado até alguém aprovar. Mitigação:
  é só em MR (não bloqueia push); o gate automático continua sendo a régua dura.
- **Environment sem proteção configurada:** se `quality-review` não tiver
  approvers/allowed, qualquer um aprova. Mitigação: proteger o environment no
  fechamento (allowed to deploy = maintainers), análogo à proteção de `main`
  (`docs/operacao/branch-protection-main.md`).
- **Aluno aprova o próprio MR:** aceitável no escopo didático — a intenção é
  demonstrar o mecanismo, não enforçar 4-eyes review.

## Consequências

**Positivas:** a esteira ganha um beat narrativo claro ("robôs olharam, agora
humano olha, depois o veredito automático final"); pipeline auditável (quem
aprovou + timestamp no log do job); convive com o gate bloqueante sem
contornar nenhum stage.

**Negativas:** latência adicional no merge via MR (precisa do clique); mais um
job no stage `gate`.

## ADRs relacionadas

- **ADR-0005** — thresholds dos quality gates (define o que será aprovado).
- **ADR-0006** — CD sem registry: promoção é **re-tag/re-apontar o mesmo
  artefato por SHA** sem rebuild. A re-tag está coberta ali; este ADR
  **não** abre um ADR separado de re-tag, apenas referencia ADR-0006.
- `docs/operacao/branch-protection-main.md` — proteção de `main` ("pipelines
  must succeed"), o complemento de plataforma do gate.
