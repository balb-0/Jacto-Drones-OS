# ADR-0010 — Notificação automática do resultado do pipeline

**Status:** Aceito
**Data:** 2026-06-14
**Autores:** G04 (Sprint 4) — TG3 (feedback do resultado)

> Fecha o eixo de **feedback** do `inteli-px4-cicd-demo`: a esteira não basta
> rodar — quando ela **quebra**, alguém precisa ser avisado com o contexto do
> que falhou. No espírito "rastro que ensina", a notificação é um beat
> explícito da narrativa (build → test → SAST → gate → deploy → **avisar**),
> não um detalhe escondido nos logs.

## Contexto

A esteira já produz um veredito objetivo: o job `quality-gates` (stage `gate`,
ADR-0005) reprova o pipeline quando um threshold versionado é violado, e a
missão/anomalia SITL (stage `test`) e o SAST (stage `sast`) podem falhar antes
dele. Hoje, descobrir essa falha exige **abrir a UI do GitLab e olhar o
pipeline** — feedback puxado (pull), não empurrado (push). Falta o passo de
*notificar o resultado* que o demo tem.

Três fatos do nosso ambiente moldam o desenho:

1. **SEM SMTP próprio.** A instância é pedagógica (Inteli, CE 18.6.1) e o grupo
   não provisiona um servidor de e-mail/relay. Qualquer solução que dependa de
   `smtp_*` configurado pelo projeto está fora de alcance.
2. **Regra de ouro da esteira:** não editar o `.gitlab-ci.yml` root a não ser
   pela lista de `stages`; cada concern entra pelo glob `ci/*.yml` (ver o
   cabeçalho do root e ADR-0006). A notificação tem que caber nesse contrato.
3. **Notificar não pode virar gate.** O pipeline que falhou já está vermelho
   pelo motivo certo (o job bloqueante). O aviso é cortesia de DX: se o canal
   de notificação cair, isso **não** pode mudar o status do pipeline — mesma
   postura `allow_failure: true` dos comentários de MR (TG6.4, mr-kpis).

## Decisão

**Adotar o canal nativo "Pipeline emails" do GitLab como mecanismo padrão de
notificação, e adicionar um job `notify` (`ci/notify.yml`, stage `notify`) que
dispara no `on_failure` e, opcionalmente, faz POST para um webhook configurável
— com degradação graciosa quando nenhum webhook existe.**

1. **Canal padrão: Pipeline emails (nativo, sem SMTP do projeto).** A integração
   *Pipeline emails* (Settings → Integrations → Pipeline emails) entrega o
   resultado do pipeline por e-mail aos endereços inscritos usando o servidor de
   e-mail **da própria instância** — não exige `smtp_*` do projeto nem servidor
   externo. É a recomendação padrão registrada aqui; configura-se na plataforma,
   não em arquivo versionado.
2. **Job `notify` (`ci/notify.yml`), no `on_failure`.** Um job no stage `notify`
   (o último, após `deploy`) que `rules: when: on_failure` ⇒ só roda quando
   algum job de stage anterior **falhou** (gate, anomalia/missão, SAST, build).
   Em pipeline verde é skipped. Monta a mensagem — projeto, pipeline #, branch,
   commit, o que falhou e link — a partir das variáveis predefinidas do CI
   (`CI_PROJECT_*`, `CI_PIPELINE_*`, `CI_COMMIT_*`) via `scripts/notify.py`.
3. **Webhook opcional e configurável (degradação graciosa).** Se a variável
   CI/CD `NOTIFY_WEBHOOK_URL` existir (webhook de Slack/Mattermost/Discord ou
   genérico — coerente com a estratégia de webhooks do
   `docs/referencias/mapeamento-ambiente-jacto.md`), o job faz `POST` (curl) com
   o payload JSON. **Sem** a variável, o job apenas **loga** a mensagem
   formatada e referencia o Pipeline emails nativo — sem erro, sem segredo no
   browser. O webhook é o caminho de evolução; o e-mail nativo é o piso.
4. **Nunca bloqueante.** `allow_failure: true` no job; o `on_failure` garante que
   ele só aparece quando já há falha. Sem `needs:`/`dependencies:` (ordem de
   stage) — não antecipa nem contorna o gate (anti DAG-bypass, ADR-0006).

A lógica de mensagem mora em `scripts/notify.py`: `build_notification` é uma
função **pura** (mapa de env → dict, sem I/O), com teste unitário em
`tests/unit/test_notify.py` — a régua de "o que a mensagem diz" fica testável
sem subir pipeline, separada da entrega (YAML/curl), igual ao par
`quality_gates.py`/`gate_comment.py`.

## Alternativas consideradas (e rejeitadas para a Sprint 4)

- **SMTP próprio + `emails on push`/notificações por e-mail customizadas.**
  Rejeitada: exige relay SMTP que o ambiente pedagógico não provê (fato 1).
  O Pipeline emails nativo entrega o mesmo valor usando o e-mail da instância.
- **Job webhook como ÚNICO canal (sem fallback).** Rejeitada: deixaria a
  notificação dependente de um segredo (`NOTIFY_WEBHOOK_URL`) que talvez nunca
  seja provisionado nesta instância — e então não notificaria nada. O e-mail
  nativo garante um piso; o webhook é a camada opcional por cima.
- **Notificar em TODO pipeline (sucesso + falha).** Rejeitada agora: ruído. O
  pedido é o *resultado* que importa para agir — a **falha**. `on_failure`
  mantém o sinal alto. Estender para sucesso/sempre é trivial depois (trocar a
  rule), mas começa-se pelo que evita o silêncio perigoso.
- **GitLab → Notion via webhook como notificação primária.** É um destino de
  *visibilidade* citado no mapeamento de ambiente, não um alerta de falha; cabe
  como mais um consumidor de `NOTIFY_WEBHOOK_URL`/webhook do projeto, não como o
  mecanismo desta ADR.

## Riscos conhecidos

- **Webhook não configurado ⇒ só e-mail nativo + log.** Mitigação: é exatamente
  a degradação graciosa desenhada; o Pipeline emails cobre o caso padrão. Sem o
  e-mail nativo *e* sem webhook, o feedback volta a ser pull (abrir a UI).
- **`NOTIFY_WEBHOOK_URL` é um segredo.** Deve ser variável CI/CD **protegida e
  mascarada** — nunca commitada nem exposta no browser (mesmo cuidado do
  `GITLAB_MR_TOKEN`, ADR-0008). O job não imprime a URL.
- **Endpoint do webhook fora do ar.** `--fail-with-body` deixa o job amarelo
  (allow_failure), sem mascarar o erro nem quebrar o pipeline já vermelho.

## Consequências

**Positivas:** feedback **empurrado** no que importa (falha), com contexto
acionável (projeto/pipeline/branch/commit/motivo/link); zero SMTP do projeto
(usa o nativo) e zero servidor externo obrigatório; cabe no contrato da esteira
(só `ci/notify.yml` + uma linha em `stages`); mensagem testável em unit
(`scripts/notify.py` puro); caminho de evolução claro (webhook → Slack/Mattermost/
Notion) sem reescrever o desenho.

**Negativas:** mais um stage (`notify`) e um job no pipeline; a entrega por
webhook depende de um segredo provisionado fora do versionamento; o e-mail
nativo depende de configuração na plataforma (não versionável em arquivo).

## Referências

- `ci/notify.yml` (TG3) — job `notify` (on_failure, allow_failure, webhook
  opcional + fallback de log).
- `scripts/notify.py` + `tests/unit/test_notify.py` — montagem da mensagem
  (função pura) e teste unitário.
- `.gitlab-ci.yml` — stage `notify` adicionado ao array (única mudança no root).
- ADR-0005 (thresholds dos quality gates) — define o veredito cuja falha
  dispara a notificação.
- ADR-0006 (CD sem registry) — regra de ouro do root e padrão anti DAG-bypass.
- ADR-0008 (gate humano / token de serviço) — par de cuidado com segredos de CI
  (`GITLAB_MR_TOKEN` ↔ `NOTIFY_WEBHOOK_URL`).
- `ci/mr-kpis.yml`, `ci/quality-gates.yml` — padrão canônico de job que usa a
  API/variável de CI e degrada gracioso (`allow_failure: true`).
- `docs/referencias/mapeamento-ambiente-jacto.md` — estratégia de webhooks do
  GitLab para integrações (Notion/visibilidade).
- GitLab Docs — *Pipeline emails* integration; *Webhooks*; *Predefined CI/CD
  variables* (`CI_PROJECT_*`, `CI_PIPELINE_*`, `CI_COMMIT_*`); `rules` com
  `when: on_failure`.
