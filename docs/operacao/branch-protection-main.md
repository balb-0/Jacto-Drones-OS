# Branch protection de `main` — "Pipelines must succeed"

**Escopo:** TG6.3.2. Registro operacional da configuração a aplicar no projeto
GitLab para que o gate de quality (`ci/quality-gates.yml`, stage `gate`,
bloqueante) só seja efetivo se também **proibir o merge com pipeline vermelho**.

> Não há chamada de API aqui (worktree isolado, sem token). Este doc é o
> **rastro que ensina**: a configuração fica versionada e auditável, e é
> aplicada via API no fechamento da branch (main loop). Ratchet — uma vez
> ligada, não se desliga sem justificativa.

## Configuração-alvo

No nível do **projeto** (Settings → Merge requests):

| Opção | Valor-alvo | Efeito |
|---|---|---|
| `only_allow_merge_if_pipeline_succeeds` | `true` | MR não pode ser mergeado enquanto o pipeline não estiver verde. É isto que torna o job `quality-gates` (bloqueante) um **gate de merge** de fato. |
| `only_allow_merge_if_all_discussions_are_resolved` | `true` | Reforça revisão humana (alinha com o gate humano da TG6.5 — ADR-0008). |
| `allow_merge_on_skipped_pipeline` | `false` | Pipeline "skipped" NÃO conta como sucesso — fecha a brecha de mergear sem o gate ter rodado. |

Proteção da branch `main` (Settings → Repository → Protected branches):

| Campo | Valor-alvo |
|---|---|
| Branch | `main` |
| Allowed to merge | Maintainers |
| Allowed to push/force-push | No one (force-push desligado) |

## Como aplicar via API (fechamento)

`only_allow_merge_if_pipeline_succeeds` é atributo do **projeto**, não da
proteção de branch — define-se via `PUT /projects/:id`:

```bash
curl --request PUT \
  --header "PRIVATE-TOKEN: $GITLAB_ADMIN_TOKEN" \
  --url "$CI_API_V4_URL/projects/$CI_PROJECT_ID" \
  --data "only_allow_merge_if_pipeline_succeeds=true" \
  --data "only_allow_merge_if_all_discussions_are_resolved=true" \
  --data "allow_merge_on_skipped_pipeline=false"
```

Proteção de `main` (idempotente: remova antes de recriar, ou ajuste a existente):

```bash
# garante a branch protegida com merge restrito a maintainers e sem force-push
curl --request POST \
  --header "PRIVATE-TOKEN: $GITLAB_ADMIN_TOKEN" \
  --url "$CI_API_V4_URL/projects/$CI_PROJECT_ID/protected_branches" \
  --data "name=main" \
  --data "push_access_level=0" \
  --data "merge_access_level=40" \
  --data "allow_force_push=false"
```

(`merge_access_level=40` = Maintainer; `push_access_level=0` = No one.)

## Verificação pós-aplicação

```bash
curl --silent --header "PRIVATE-TOKEN: $GITLAB_ADMIN_TOKEN" \
  --url "$CI_API_V4_URL/projects/$CI_PROJECT_ID" \
  | grep -o '"only_allow_merge_if_pipeline_succeeds":[^,]*'
# esperado: "only_allow_merge_if_pipeline_succeeds":true
```

Critério de pronto: um MR para `main` com o job `quality-gates` vermelho fica
com o botão de merge **bloqueado** pela plataforma (não só pelo exit code do
job). É a diferença entre "o gate falhou" e "o merge é impossível".

## Notas

- A aplicação fica para o **main loop** (precisa de token de Maintainer/Owner;
  `CI_JOB_TOKEN` não altera settings de projeto).
- Coerente com o gate humano (ADR-0008) e com os thresholds versionados
  (ADR-0005): plataforma + gate + revisão humana compõem o "pronto pra merge".
