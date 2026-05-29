"""Unit tests do avaliador de quality gates — 1 teste por gate.

Rápidos (<1s), isolados, sem rede (o SAST aqui é skip; a consulta real entra
na TG5). Usam tmp_path para fabricar coverage.xml/metrics.json sintéticos.
Asserções self-validating com diagnóstico (ver docs/testing-philosophy.md).
"""

import json
from pathlib import Path

from scripts.quality_gates import (
    check_coverage,
    check_mission_metrics,
    check_sast,
    evaluate,
)

# Thresholds de missão alinhados ao quality_gates.yaml (max_* → campo metrics.json).
GATES = {
    "max_acceleration_m_s2": 15.0,
    "max_mission_duration_s": 180,
    "max_std_altitude_cruise_m": 1.0,
}


def _write_coverage(path: Path, line_rate: float) -> Path:
    path.write_text(
        f'<?xml version="1.0" ?>\n'
        f'<coverage line-rate="{line_rate}" branch-rate="0.9" version="6.0" timestamp="0">'
        f"<packages/></coverage>\n"
    )
    return path


def _write_metrics(path: Path, **overrides) -> Path:
    base = {
        "max_acceleration_m_s2": 11.01,
        "max_altitude_m": 10.01,
        "max_battery_drop_pct": 0.333,
        "mean_altitude_m": 7.12,
        "mission_duration_s": 78.83,
        "n_samples": 9855,
        "std_altitude_cruise_m": 0.688,
    }
    base.update(overrides)
    path.write_text(json.dumps(base))
    return path


# --------------------------------------------------------------------------- #
# Coverage gate
# --------------------------------------------------------------------------- #


def test_coverage_passa_acima_do_threshold(tmp_path):
    cov = _write_coverage(tmp_path / "coverage.xml", 0.98)
    r = check_coverage(cov, threshold=0.90)
    assert r.passed, f"coverage 0.98 deveria passar threshold 0.90, veio {r.message}"
    assert r.actual == 0.98, f"actual {r.actual} != 0.98"


def test_coverage_falha_abaixo_do_threshold(tmp_path):
    cov = _write_coverage(tmp_path / "coverage.xml", 0.42)
    r = check_coverage(cov, threshold=0.90)
    assert not r.passed, f"coverage 0.42 deveria FALHAR threshold 0.90, veio {r.message}"


# --------------------------------------------------------------------------- #
# Mission metrics gates — 1 asserção por métrica (actual <= threshold)
# --------------------------------------------------------------------------- #


def test_mission_metrics_todas_dentro_do_threshold(tmp_path):
    metrics = _write_metrics(tmp_path / "metrics.json")
    results = check_mission_metrics(metrics, GATES)
    assert len(results) == 3, f"esperava 3 gates de missão, veio {len(results)}"
    assert all(r.passed for r in results), (
        "valores do contrato deveriam passar: "
        + "; ".join(r.message for r in results if not r.passed)
    )


def test_mission_metric_aceleracao_acima_falha(tmp_path):
    metrics = _write_metrics(tmp_path / "metrics.json", max_acceleration_m_s2=20.0)
    results = {r.name: r for r in check_mission_metrics(metrics, GATES)}
    r = results["mission_metrics.max_acceleration_m_s2"]
    assert not r.passed, f"aceleração 20.0 > 15.0 deveria falhar, veio {r.message}"


def test_mission_metric_duracao_acima_falha(tmp_path):
    metrics = _write_metrics(tmp_path / "metrics.json", mission_duration_s=300.0)
    results = {r.name: r for r in check_mission_metrics(metrics, GATES)}
    r = results["mission_metrics.max_mission_duration_s"]
    assert not r.passed, f"duração 300s > 180s deveria falhar, veio {r.message}"


def test_mission_metric_std_altitude_acima_falha(tmp_path):
    metrics = _write_metrics(tmp_path / "metrics.json", std_altitude_cruise_m=2.5)
    results = {r.name: r for r in check_mission_metrics(metrics, GATES)}
    r = results["mission_metrics.max_std_altitude_cruise_m"]
    assert not r.passed, f"std altitude 2.5 > 1.0 deveria falhar, veio {r.message}"


# --------------------------------------------------------------------------- #
# SAST gate — require_passed=false ⇒ skip (passa)
# --------------------------------------------------------------------------- #


def test_sast_skip_quando_require_passed_false():
    r = check_sast(require_passed=False, sast_report=None)
    assert r.passed, "SAST com require_passed=false deveria passar (skip)"
    assert r.actual == "skipped", f"actual deveria ser 'skipped', veio {r.actual}"


def test_sast_exige_relatorio_quando_require_passed_true(tmp_path):
    # require_passed=true sem relatório ⇒ falha (prepara o TG5/Sprint 4).
    r = check_sast(require_passed=True, sast_report=tmp_path / "ausente.json")
    assert not r.passed, "SAST require_passed=true sem relatório deveria falhar"


# --------------------------------------------------------------------------- #
# Falha graciosa: arquivo de entrada ausente
# --------------------------------------------------------------------------- #


def test_coverage_arquivo_ausente_falha_sem_excecao(tmp_path):
    r = check_coverage(tmp_path / "nao-existe.xml", threshold=0.90)
    assert not r.passed, "coverage.xml ausente deveria falhar graciosamente"
    assert r.actual is None, "actual deveria ser None quando arquivo ausente"


def test_metrics_arquivo_ausente_falha_sem_excecao(tmp_path):
    results = check_mission_metrics(tmp_path / "nao-existe.json", GATES)
    assert len(results) == 1 and not results[0].passed, (
        "metrics.json ausente deveria render 1 gate falho (graciosa)"
    )


# --------------------------------------------------------------------------- #
# Orquestração ponta-a-ponta — exit code refletido em all_passed
# --------------------------------------------------------------------------- #


def test_evaluate_tudo_verde_com_contrato_real(tmp_path):
    gates = Path("quality_gates.yaml")
    cov = _write_coverage(tmp_path / "coverage.xml", 0.98)
    metrics = _write_metrics(tmp_path / "metrics.json")
    report = evaluate(gates, metrics, cov)
    assert report.all_passed, f"contrato real deveria passar todos os gates: {report.summary}"
    assert report.summary.startswith("5/5"), f"esperava 5/5, veio {report.summary}"


def test_evaluate_falha_quando_coverage_baixa(tmp_path):
    gates = Path("quality_gates.yaml")
    cov = _write_coverage(tmp_path / "coverage.xml", 0.10)
    metrics = _write_metrics(tmp_path / "metrics.json")
    report = evaluate(gates, metrics, cov)
    assert not report.all_passed, "coverage 10% deveria reprovar o conjunto"
