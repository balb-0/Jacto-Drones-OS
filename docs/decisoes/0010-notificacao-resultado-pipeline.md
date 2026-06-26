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

### Complemento (TG-C2): DIGEST do resultado também no pipeline VERDE

> **Por que voltar nisto.** A primeira versão notificava só a **falha** (e
> registramos abaixo que estender para o sucesso seria trivial). A devolutiva
> cobrou exatamente isso: o avaliador descontou em **Avaliação dos Resultados
> (1,7/2,0)** — *"a cadeia do dado até a decisão ainda não fecha"* — e o parceiro
> foi literal: *"a Jacto não quer ficar olhando dashboard nem pipeline pra ver o
> resultado da simulação"*. Notificar só no vermelho deixa o **silêncio do
> verde** ser, ainda, feedback puxado: para saber *como foi* a missão (KPIs,
> anomalias, para onde promoveu), continuava-se abrindo a UI. A cadeia
> dado→decisão só **fecha** quando o veredito é **empurrado nos dois sentidos**.

5. **Job `notify_result` (`ci/notify.yml`), no `on_success`.** Irmão do `notify`,
   no mesmo stage `notify`, com `rules: when: on_success` (⇒ só quando TODOS os
   stages anteriores passaram) e `if: $CI_COMMIT_TAG → never` (release em tag tem
   fluxo próprio no stage `deploy`). Mantém o `notify` (`on_failure`) intacto — os
   dois caminhos coexistem; nenhum substitui o outro.
6. **O conteúdo é um DIGEST do resultado, montado dos ARTEFATOS do run** (não das
   vars do CI): veredito da missão com os **KPIs-chave** de `reports/metrics.json`
   (duração, alt. máx., acel. máx., queda de bateria), o **nº de anomalias** de
   `reports/anomalies.json` (lê `.anomalies` — contrato `{_meta, anomalies}` do
   ADR-0009 — com contagem CRITICAL/WARNING), o **status de deploy/canário** de
   `reports/deploy-*.json` (manifesto do `promote_artifact.py`, ADR-0006) e
   `reports/canary-health.json` **se existirem**, e o **link** do pipeline.
7. **Graça em artefato ausente = não vira gate no verde.** Cada artefato é
   opcional: deploy só existe em `develop`/`main`; o canário pode ainda não estar
   publicado; um branch de feature roda sem promoção. A leitura
   (`load_artifact`) trata ausência/erro/JSON-não-objeto como *indisponível* e os
   summarizers degradam para uma linha legível — `allow_failure: true` SEMPRE.
   **Um pipeline verde sem algum artefato opcional continua verde** (TG-C1/TG-C2:
   o digest jamais reprova um run saudável).
8. **Mesmo canal do ADR-0010, sem duplicar política.** `notify_result` reusa o
   POST no `NOTIFY_WEBHOOK_URL` (com `--fail-with-body`) e, sem a variável, loga +
   aponta o **Pipeline emails** nativo — idêntico ao `notify`. Webhook é evolução;
   e-mail nativo é o piso. (Nada de "voo real": é a missão SITL sintética.)

A lógica de mensagem mora em `scripts/notify.py`: `build_notification` (falha) e
`build_result_digest` (sucesso) são funções **puras** (mapa de env/artefatos →
dict, sem I/O), com teste unitário em `tests/unit/test_notify.py` — a régua de "o
que a mensagem diz" (veredito, contagem de anomalias, com e sem artefatos) fica
testável sem subir pipeline, separada da entrega (YAML/curl) e da I/O fina
(`load_artifact`/`load_result_digest`), igual ao par
`quality_gates.py`/`gate_comment.py`.

## Alternativas consideradas (e rejeitadas para a Sprint 4)

- **SMTP próprio + `emails on push`/notificações por e-mail customizadas.**
  Rejeitada: exige relay SMTP que o ambiente pedagógico não provê (fato 1).
  O Pipeline emails nativo entrega o mesmo valor usando o e-mail da instância.
- **Job webhook como ÚNICO canal (sem fallback).** Rejeitada: deixaria a
  notificação dependente de um segredo (`NOTIFY_WEBHOOK_URL`) que talvez nunca
  seja provisionado nesta instância — e então não notificaria nada. O e-mail
  nativo garante um piso; o webhook é a camada opcional por cima.
- **Notificar em TODO pipeline (sucesso + falha).** Na Sprint 4 começou-se só
  pela **falha** (o que evita o silêncio perigoso). **Revisado em TG-C2**: o
  sucesso passou a ser notificado também — mas **não** colapsando tudo num único
  job `when: always` (isso sim seria ruído e perderia o contexto distinto de cada
  resultado). Em vez disso, **dois jobs irmãos** com mensagens próprias: `notify`
  (`on_failure`, "o que quebrou") e `notify_result` (`on_success`, "o DIGEST do
  que deu certo"). O sinal segue alto porque falha e sucesso são eventos
  semânticos diferentes, cada um com seu payload. (Fecha a cadeia dado→decisão —
  ver *Complemento (TG-C2)* acima.)
- **Reaproveitar o `build_notification` (vars do CI) para o digest verde.**
  Rejeitada: o digest de sucesso precisa do *conteúdo do resultado* (KPIs,
  anomalias, deploy/canário), que vive nos **artefatos** do run, não nas
  variáveis predefinidas. Por isso `build_result_digest` é uma função própria que
  consome artefatos já carregados, mantendo o caminho de falha intocado.
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
- **(TG-C2) Artefato do digest ausente no verde.** `notify_result` lê
  `metrics/anomalies/deploy/canary` — qualquer um pode faltar (deploy só em
  `develop`/`main`; canário opcional). Mitigação: `load_artifact` degrada para
  *indisponível* e `allow_failure: true` garante que **o digest nunca reprova um
  pipeline verde** (régua TG-C1/TG-C2). O risco residual é informativo (uma linha
  "indisponível"), não de status.

## Consequências

**Positivas:** feedback **empurrado nos dois sentidos** — a falha (o que quebrou)
e, com TG-C2, o **sucesso** (digest do resultado: KPIs, anomalias, deploy/canário,
link), fechando a cadeia dado→decisão sem abrir dashboard nem pipeline; contexto
acionável; zero SMTP do projeto (usa o nativo) e zero servidor externo
obrigatório; cabe no contrato da esteira (só `ci/notify.yml`, sem novo stage —
`notify_result` mora no `notify` já existente); mensagens testáveis em unit
(`scripts/notify.py` puro, falha **e** digest); caminho de evolução claro (webhook
→ Slack/Mattermost/Notion) sem reescrever o desenho.

**Negativas:** mais um job no pipeline (`notify_result`), que roda em **todo run
verde** (custo baixo: stdlib pura + POST opcional); a entrega por webhook depende
de um segredo provisionado fora do versionamento; o e-mail nativo depende de
configuração na plataforma (não versionável em arquivo); o digest acopla-se
(de forma tolerante) aos nomes dos artefatos (`reports/metrics.json`,
`reports/anomalies.json`, `reports/deploy-*.json`, `reports/canary-health.json`).

## Referências

- `ci/notify.yml` (TG3) — job `notify` (on_failure, allow_failure, webhook
  opcional + fallback de log); **(TG-C2)** job `notify_result` (on_success,
  allow_failure, digest do resultado a partir dos artefatos).
- `scripts/notify.py` + `tests/unit/test_notify.py` — montagem da mensagem de
  falha (`build_notification`) e do **digest de sucesso** (`build_result_digest`
  + summarizers + `load_result_digest`), funções puras com teste unitário.
- `.gitlab-ci.yml` — stage `notify` adicionado ao array (única mudança no root);
  o `notify_result` reaproveita esse mesmo stage (não acrescenta stage novo).
- ADR-0005 (thresholds dos quality gates) — define o veredito cuja falha
  dispara a notificação.
- ADR-0006 (CD sem registry) — regra de ouro do root e padrão anti DAG-bypass;
  `promote_artifact.py` produz os `reports/deploy-*.json` lidos pelo digest.
- ADR-0008 (gate humano / token de serviço) — par de cuidado com segredos de CI
  (`GITLAB_MR_TOKEN` ↔ `NOTIFY_WEBHOOK_URL`).
- ADR-0009 (anomalias front↔CI) — contrato `{_meta, anomalies}` de
  `reports/anomalies.json` cuja contagem entra no digest de sucesso.
- `ci/mr-kpis.yml`, `ci/quality-gates.yml` — padrão canônico de job que usa a
  API/variável de CI e degrada gracioso (`allow_failure: true`).
- `docs/referencias/mapeamento-ambiente-jacto.md` — estratégia de webhooks do
  GitLab para integrações (Notion/visibilidade).
- GitLab Docs — *Pipeline emails* integration; *Webhooks*; *Predefined CI/CD
  variables* (`CI_PROJECT_*`, `CI_PIPELINE_*`, `CI_COMMIT_*`); `rules` com
  `when: on_failure` / `when: on_success`.
