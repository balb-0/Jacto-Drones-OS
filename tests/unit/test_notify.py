"""Unit tests da notificação de resultado do pipeline — funções puras (TG3).

Rápidos (<1s), isolados, sem I/O — base da pirâmide/troféu de testes
(ver docs/testing-philosophy.md). Exercitam `build_notification` (montagem a
partir das vars do CI, com degradação) e a renderização em texto/JSON.
"""

import json

from scripts.notify import build_notification, format_json, format_text

_ENV_OK = {
    "CI_PROJECT_PATH": "graduacao/2026-1b/t13/g04",
    "CI_PIPELINE_ID": "4242",
    "CI_PIPELINE_URL": "https://gitlab.com/g04/-/pipelines/4242",
    "CI_COMMIT_BRANCH": "develop",
    "CI_COMMIT_SHORT_SHA": "abc12345",
    "CI_COMMIT_TITLE": "feat: nova missao",
    "CI_COMMIT_AUTHOR": "Kauan <kauan@example.com>",
    "CI_JOB_NAME": "quality-gates",
}


def test_build_uses_ci_vars():
    n = build_notification(_ENV_OK)
    assert n["status"] == "failed", "status default da notificacao deveria ser 'failed'"
    assert n["project"] == "graduacao/2026-1b/t13/g04", f"project errado: {n['project']}"
    assert n["pipeline_id"] == "4242", f"pipeline_id errado: {n['pipeline_id']}"
    assert n["branch"] == "develop", f"branch errado: {n['branch']}"
    assert n["commit"] == "abc12345", f"commit curto errado: {n['commit']}"


def test_explicit_reason_overrides_job_name():
    n = build_notification(_ENV_OK, reason="gate reprovado: cobertura < 90%")
    assert n["reason"] == "gate reprovado: cobertura < 90%", (
        f"motivo explicito deveria ter prioridade, veio {n['reason']!r}"
    )


def test_reason_falls_back_to_failed_job():
    n = build_notification(_ENV_OK)
    assert "quality-gates" in n["reason"], (
        f"sem motivo explicito, deveria citar o job que falhou, veio {n['reason']!r}"
    )


def test_missing_vars_degrade_without_keyerror():
    # Cenario de falha precoce: quase nada definido. Não pode levantar KeyError.
    n = build_notification({})
    assert n["project"] == "?", f"projeto ausente deveria virar '?', veio {n['project']!r}"
    assert n["pipeline_id"] == "?", "pipeline ausente deveria virar '?'"
    assert n["pipeline_url"] == "-", "link ausente deveria virar '-'"


def test_short_sha_derived_from_full_sha():
    env = {"CI_COMMIT_SHA": "0123456789abcdef0123456789abcdef01234567"}
    n = build_notification(env)
    assert n["commit"] == "01234567", (
        f"sem CI_COMMIT_SHORT_SHA, deveria truncar o SHA em 8, veio {n['commit']!r}"
    )


def test_format_text_has_pipeline_and_link():
    text = format_text(build_notification(_ENV_OK))
    assert "pipeline #4242" in text, "texto deveria conter o numero do pipeline"
    assert "https://gitlab.com/g04/-/pipelines/4242" in text, "texto deveria conter o link"
    assert "develop" in text, "texto deveria conter a branch"


def test_format_json_is_valid_and_has_text_key():
    payload = json.loads(format_json(build_notification(_ENV_OK)))
    assert payload["branch"] == "develop", "JSON deveria preservar a branch"
    assert "text" in payload and "pipeline #4242" in payload["text"], (
        "payload do webhook deveria expor a chave 'text' pronta para Slack/Mattermost"
    )
