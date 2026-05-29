# ADR-0004 — Assinatura GPG obrigatória de commits na branch protegida `main`

**Status:** Aceito
**Data:** 2026-05-29
**Autores:** G04 (Sprint 3) — TG5 (integridade do pipeline)

> ADR do eixo **integridade** cobrado pelo orientador Reginaldo Arakaki
> ("rastro que ensina"): a esteira só tem valor se a *procedência* do que ela
> promove for verificável. Assinar commits em `main` fecha a pergunta "quem de
> fato produziu este código que está indo para produção?".

## Contexto

A Sprint 3 portou os hooks Husky **client-side** (puláveis com `git commit
--no-verify`) para jobs de CI **server-side** não puláveis (`ci/sast.yml`:
TruffleHog, Trivy, commitlint, Gitleaks, Semgrep). Isso protege a integridade
do *conteúdo* (sem segredos, sem CVE crítico, mensagem padronizada) — mas não a
integridade da *autoria*.

Dois fatos do nosso fluxo abrem essa lacuna:

1. **Commits de autoria atribuída por flag.** O fluxo de trabalho do G04 usa
   `git -c user.name=... -c user.email=...` para registrar o membro responsável
   por cada commit (forma A/B do P12). Nome e e-mail de autor são **metadados
   livres** no git: qualquer um pode commitar "como" outro. Sem assinatura, a
   atribuição é uma convenção de confiança, não uma garantia.
2. **`main` é a branch protegida que materializa release.** `develop` → `main`
   é o caminho até o `release:` real (tag `v*`, ADR-0006). Um commit não
   verificado entrando em `main` significa promover artefato de procedência não
   comprovada.

O repositório de referência do avaliador (`inteli-px4-cicd-demo`) cobre
integridade de *análise* (SonarQube, ADR-006 do demo) mas não trata assinatura
de commits; esta é uma decisão **nossa**, no eixo de integridade do Reginaldo.

## Decisão

**Exigir commits assinados (GPG/SSH) na branch protegida `main`.**

1. **Branch protegida + "Reject unsigned commits".** Em *Settings → Repository →
   Protected branches*, `main` fica protegida e com a opção **"Reject unsigned
   commits"** (push rule do GitLab) habilitada. Push com qualquer commit não
   assinado é **recusado pelo servidor** — não há `--no-verify` que contorne, é
   server-side.
2. **Verificação visível.** O GitLab marca cada commit assinado como
   **`Verified`** quando a chave pública (GPG ou SSH) está cadastrada no perfil
   do autor e o e-mail da chave bate com o e-mail do commit. O selo `Verified`
   na UI é a evidência auditável de procedência.
3. **Escopo `main`, não `develop`/feature.** Trabalho do dia (branches de
   feature, `develop`) **não** exige assinatura: assinar todo commit de WIP
   atritaria o fluxo de subagentes/membros. A assinatura é cobrada no **portão
   de promoção** (merge para `main`), onde o custo se justifica. Coerente com a
   filosofia baseline × invariante de [`testing-philosophy.md`](../testing-philosophy.md):
   endurecer onde o risco é alto, não em todo lugar.
4. **Chaves por membro, geridas pelo dono do repo.** Cada integrante cadastra
   sua chave pública no GitLab; a chave privada nunca é versionada (o job
   TruffleHog/Gitleaks pegaria). Sem chave central compartilhada (seria um SPOF
   e anularia a atribuição por autor).

## Alternativas consideradas (e rejeitadas)

- **Não exigir assinatura (status quo).** Mantém o fluxo leve, mas deixa a
  autoria como metadado forjável justo na branch que vira release. Rejeitada
  para `main`: contradiz o eixo de integridade.
- **Assinatura obrigatória em todas as branches.** Máxima garantia, atrito
  máximo: cada commit de subagente/feature precisaria de chave configurada no
  ambiente isolado. Rejeitada por custo desproporcional ao risco em WIP.
- **DCO (`Signed-off-by`) em vez de GPG.** `Signed-off-by` é só uma linha de
  texto (atestado de origem, não prova criptográfica) e é trivial de forjar —
  além de o fluxo do G04 **proibir trailers multi-autor** (P12). Rejeitada: não
  entrega verificação real.

## Consequências

**Positivas:** procedência criptograficamente verificável do que entra em `main`
(e portanto do que vira release por SHA, ADR-0006); selo `Verified` como rastro
auditável; o controle é **server-side** (push rule), inevitável — coerente com a
tese desta sprint de tirar a integridade da máquina do dev.

**Negativas:** custo de setup de chave por membro (uma vez); merges para `main`
ficam condicionados a quem tem chave cadastrada; em ambientes efêmeros
(subagentes/CI) a assinatura automática exige cuidado extra com a chave — por
isso o escopo é `main`, não o dia a dia.

## Referências

- `ci/sast.yml` (TG5) — porta Husky→CI server-side; este ADR fecha a lacuna de
  *autoria* que aquela camada (integridade de *conteúdo*) não cobre.
- ADR-0006 (CD sem registry) — `main` + tag `v*` materializam o release por SHA;
  daí a exigência de procedência verificável nesse portão.
- ADR-0007 (SAST/Semgrep como gate) — par desta ADR no eixo integridade.
- GitLab Docs — *Protected branches* / *Push rules* ("Reject unsigned commits")
  e *Signed commits* (GPG/SSH verification, selo `Verified`).
- Feedback do orientador Reginaldo Arakaki — eixo "rastro que ensina"
  (procedência verificável do que a esteira promove).
