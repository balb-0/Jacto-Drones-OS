"""Unit tests da notificação de resultado do pipeline — funções puras (TG3/TG-C2).

Rápidos (<1s), isolados, sem I/O — base da pirâmide/troféu de testes
(ver docs/testing-philosophy.md). Exercitam `build_notification` (FALHA — montagem
a partir das vars do CI, com degradação), a renderização em texto/JSON, e o
DIGEST de SUCESSO (`build_result_digest` + summarizers + `load_result_digest`):
veredito da missão, contagem de anomalias, deploy/canário — COM e SEM artefatos.
"""

import json

from scripts.notify import (
    build_notification,
    build_result_digest,
    format_digest_json,
    format_digest_text,
    format_json,
    format_text,
    load_artifact,
    load_result_digest,
    summarize_anomalies,
    summarize_canary,
    summarize_deploys,
    summarize_metrics,
)

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


# ───────────────────────────────────────────────────────────────────────────
# DIGEST de SUCESSO (TG-C2) — push do resultado também no verde.
# ───────────────────────────────────────────────────────────────────────────

# Artefatos típicos de um run verde (shapes reais: extract_metrics.MissionMetrics,
# detect_anomalies {_meta,anomalies}, promote_artifact build_record).
_METRICS = {
    "mission_duration_s": 152.0,
    "max_altitude_m": 48.3,
    "mean_altitude_m": 41.2,
    "std_altitude_cruise_m": 0.512,
    "max_acceleration_m_s2": 11.4,
    "max_battery_drop_pct": 0.8,
    "n_samples": 1500,
}
_ANOMALIES_CLEAN = {
    "_meta": {"n_anomalias": 0, "estado": "real"},
    "anomalies": [],
}
_ANOMALIES_DIRTY = {
    "_meta": {"n_anomalias": 3},
    "anomalies": [
        {"type": "VIBRATION SPIKE", "severity": "CRITICAL", "timestamp_ms": 1000},
        {"type": "PWM DIVERGENCE", "severity": "WARNING", "timestamp_ms": 2000},
        {"type": "ACCELERATION SPIKE", "severity": "WARNING", "timestamp_ms": 3000},
    ],
}
_DEPLOY_STAGING = {
    "environment": "staging",
    "artifact_sha": "0123456789abcdef",
    "artifact_ref": "ci-artifact@0123456789ab",
    "rollback": False,
}


def test_digest_metrics_line_has_key_kpis():
    s = summarize_metrics(_METRICS)
    assert s["available"] is True
    # Veredito legível com os KPIs-chave e suas unidades.
    assert "152 s" in s["line"], f"duração faltando na linha de KPIs: {s['line']!r}"
    assert "48.3 m" in s["line"], f"altitude máx faltando: {s['line']!r}"
    assert "11.4 m/s²" in s["line"], f"aceleração faltando: {s['line']!r}"


def test_digest_metrics_absent_degrades():
    s = summarize_metrics(None)
    assert s["available"] is False
    assert "indisponíveis" in s["line"], "métricas ausentes deveriam virar aviso legível"


def test_digest_anomalies_count_clean_and_dirty():
    clean = summarize_anomalies(_ANOMALIES_CLEAN)
    assert clean["total"] == 0 and "limpo" in clean["line"], (
        f"voo limpo deveria reportar 0 anomalias, veio {clean!r}"
    )
    dirty = summarize_anomalies(_ANOMALIES_DIRTY)
    assert dirty["total"] == 3, f"deveria contar 3 anomalias, veio {dirty['total']!r}"
    assert dirty["critical"] == 1, f"deveria contar 1 CRITICAL, veio {dirty['critical']!r}"
    assert dirty["warning"] == 2, f"deveria contar 2 WARNING, veio {dirty['warning']!r}"


def test_digest_anomalies_absent_degrades():
    s = summarize_anomalies(None)
    assert s["available"] is False and s["total"] is None, (
        "anomalies.json ausente não deveria inventar contagem"
    )


def test_digest_anomalies_count_falls_back_to_meta():
    # Sem a lista `.anomalies`, confia no contador do _meta (gracioso).
    s = summarize_anomalies({"_meta": {"n_anomalias": 5}})
    assert s["total"] == 5, f"sem lista, deveria usar _meta.n_anomalias, veio {s['total']!r}"


def test_digest_deploys_lists_present_environments():
    s = summarize_deploys({"staging": _DEPLOY_STAGING, "prod": None})
    assert s["available"] is True
    assert s["environments"] == ["staging"], f"só staging foi promovido, veio {s['environments']!r}"
    assert "staging" in s["line"]


def test_digest_deploys_none_present_degrades():
    # Branch de feature: sem deploy automático — normal, não é erro.
    s = summarize_deploys({"staging": None, "prod": None})
    assert s["available"] is False and "nenhum" in s["line"]


def test_digest_canary_reads_string_status():
    s = summarize_canary({"status": "healthy"})
    assert s["status"] == "healthy" and "healthy" in s["line"]


def test_digest_canary_reads_boolean_verdict():
    # Contrato externo (TG-C1) pode trazer veredito booleano — traduz p/ rótulo.
    assert summarize_canary({"healthy": True})["status"] == "healthy"
    assert summarize_canary({"healthy": False})["status"] == "unhealthy"


def test_digest_canary_absent_degrades():
    s = summarize_canary(None)
    assert s["available"] is False and "sem healthcheck" in s["line"]


def test_build_result_digest_full():
    dg = build_result_digest(
        _ENV_OK,
        metrics=_METRICS,
        anomalies=_ANOMALIES_CLEAN,
        deploys={"staging": _DEPLOY_STAGING},
        canary={"status": "healthy"},
    )
    assert dg["status"] == "success", "digest de sucesso deveria ter status 'success'"
    assert dg["pipeline_id"] == "4242"
    assert "aprovada" in dg["verdict"], f"veredito deveria afirmar aprovação, veio {dg['verdict']!r}"
    assert dg["anomalies"]["total"] == 0


def test_build_result_digest_verdict_mentions_anomalies_when_present():
    dg = build_result_digest(_ENV_OK, metrics=_METRICS, anomalies=_ANOMALIES_DIRTY)
    assert "3 anomalia" in dg["verdict"], (
        f"com anomalias, o veredito deveria citá-las, veio {dg['verdict']!r}"
    )


def test_build_result_digest_no_artifacts_does_not_raise():
    # Pipeline verde sem NENHUM artefato (cenário extremo): não pode levantar.
    dg = build_result_digest(_ENV_OK)
    assert dg["status"] == "success"
    assert dg["metrics"]["available"] is False
    assert dg["anomalies"]["available"] is False
    assert dg["deploy"]["available"] is False
    assert dg["canary"]["available"] is False


def test_digest_missing_env_degrades_without_keyerror():
    dg = build_result_digest({}, metrics=_METRICS)
    assert dg["project"] == "?" and dg["pipeline_id"] == "?"
    assert dg["pipeline_url"] == "-"


def test_format_digest_text_has_verdict_kpis_and_link():
    dg = build_result_digest(
        _ENV_OK, metrics=_METRICS, anomalies=_ANOMALIES_CLEAN,
        deploys={"staging": _DEPLOY_STAGING}, canary={"status": "healthy"},
    )
    text = format_digest_text(dg)
    assert "pipeline VERDE" in text, "texto do digest deveria marcar o pipeline verde"
    assert "pipeline #4242" in text
    assert "152 s" in text, "texto deveria conter os KPIs-chave"
    assert "0 anomalias" in text, "texto deveria conter a contagem de anomalias"
    assert "staging" in text, "texto deveria conter o status de deploy"
    assert "healthy" in text, "texto deveria conter o status do canário"
    assert "https://gitlab.com/g04/-/pipelines/4242" in text, "texto deveria conter o link"


def test_format_digest_json_is_valid_and_has_text_key():
    dg = build_result_digest(_ENV_OK, metrics=_METRICS, anomalies=_ANOMALIES_CLEAN)
    payload = json.loads(format_digest_json(dg))
    assert payload["status"] == "success"
    assert payload["branch"] == "develop", "JSON do digest deveria preservar a branch"
    assert "text" in payload and "pipeline #4242" in payload["text"], (
        "payload do digest deveria expor a chave 'text' pronta para Slack/Mattermost"
    )


# --- I/O fina: load_artifact / load_result_digest (com tmp_path) ---

def test_load_artifact_missing_returns_none(tmp_path):
    assert load_artifact(tmp_path / "nao-existe.json") is None


def test_load_artifact_invalid_json_returns_none(tmp_path):
    bad = tmp_path / "bad.json"
    bad.write_text("{ isto não é json", encoding="utf-8")
    assert load_artifact(bad) is None, "JSON inválido deveria degradar para None, não raise"


def test_load_artifact_non_object_returns_none(tmp_path):
    arr = tmp_path / "arr.json"
    arr.write_text("[1, 2, 3]", encoding="utf-8")
    assert load_artifact(arr) is None, "JSON que não é objeto deveria virar None"


def test_load_artifact_reads_object(tmp_path):
    ok = tmp_path / "ok.json"
    ok.write_text(json.dumps(_METRICS), encoding="utf-8")
    loaded = load_artifact(ok)
    assert loaded is not None and loaded["max_altitude_m"] == 48.3


def test_load_result_digest_reads_reports_dir(tmp_path):
    (tmp_path / "metrics.json").write_text(json.dumps(_METRICS), encoding="utf-8")
    (tmp_path / "anomalies.json").write_text(json.dumps(_ANOMALIES_DIRTY), encoding="utf-8")
    (tmp_path / "deploy-staging.json").write_text(json.dumps(_DEPLOY_STAGING), encoding="utf-8")
    dg = load_result_digest(_ENV_OK, reports_dir=tmp_path)
    assert dg["metrics"]["available"] is True
    assert dg["anomalies"]["total"] == 3
    assert dg["deploy"]["environments"] == ["staging"]
    # canary-health.json ausente: degrada sem erro.
    assert dg["canary"]["available"] is False


def test_load_result_digest_empty_dir_still_builds(tmp_path):
    # Diretório vazio (nenhum artefato): digest verde mínimo, sem crash.
    dg = load_result_digest(_ENV_OK, reports_dir=tmp_path)
    assert dg["status"] == "success"
    assert dg["metrics"]["available"] is False
