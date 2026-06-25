"""Unit tests do health-check do canário (TG-C1) — núcleo PURO `evaluate_canary`.

Rápidos (<1s), isolados, sem rede — usam tmp_path para fabricar metrics.json /
anomalies.json sintéticos e o quality_gates.yaml REAL do repo (mesma régua do
gate). Asserções self-validating com diagnóstico (ver docs/testing-philosophy.md).

Cobertura: canário saudável → healthy/exit 0; anomalia CRITICAL → doente/exit 1;
KPI fora do limiar → doente/exit 1; borda exata do limiar (<=) → saudável;
fail-closed (arquivo ausente) → doente. O caso CRÍTICO (TG-C1) é o baseline real
`square_50m`: precisa passar VERDE — testado em test_baseline_real_*.
"""

import json
from pathlib import Path

import pytest

from scripts.canary_healthcheck import DEFAULT_CANARY, evaluate_canary

# quality_gates.yaml REAL: o canário tem de usar EXATAMENTE a régua do gate, não
# uma cópia divergente. Resolve a partir da raiz do repo (cwd do pytest).
GATES = Path("quality_gates.yaml")

# Limiares vigentes (espelham mission_metrics do quality_gates.yaml — se mudarem
# lá, estes comentários/casos de borda acompanham):
#   max_acceleration_m_s2: 15.0 | max_mission_duration_s: 180 | max_std_altitude_cruise_m: 1.0

# Valores do baseline REAL square_50m (src/src/data/metrics.json): todos dentro
# do gate → canário saudável. É o caso que o TG-C1 exige verde.
_BASELINE_METRICS = {
    "max_acceleration_m_s2": 11.01,
    "max_altitude_m": 10.01,
    "max_battery_drop_pct": 0.333,
    "mean_altitude_m": 7.12,
    "mission_duration_s": 78.83,
    "n_samples": 9855,
    "std_altitude_cruise_m": 0.688,
}


def _write_metrics(path: Path, **overrides) -> Path:
    base = dict(_BASELINE_METRICS)
    base.update(overrides)
    path.write_text(json.dumps(base))
    return path


def _write_anomalies(path: Path, anomalies: list) -> Path:
    """Grava o contrato {_meta, anomalies} que o gate/canário leem (.anomalies)."""
    contract = {
        "_meta": {
            "contrato": "TG2 — anomalias do run SITL",
            "estado": "real",
            "nota": "fixture de teste",
            "fonte_prevista": "reports/anomalies.json",
            "gerado_de": "flight-telemetry.json",
            "n_anomalias": len(anomalies),
        },
        "anomalies": anomalies,
    }
    path.write_text(json.dumps(contract))
    return path


# --------------------------------------------------------------------------- #
# CRÍTICO (TG-C1): baseline real square_50m → canário SAUDÁVEL (verde)
# --------------------------------------------------------------------------- #


def test_baseline_real_square50m_canario_saudavel(tmp_path):
    # accel 11.01<15, dur 78.83<180, std 0.688<1.0, 0 anomalias → DEVE ficar verde.
    # Se este teste falhar, o fail-closed dispararia no baseline bom (regressão
    # que travaria toda promoção) — exatamente o que o TG-C1 proíbe.
    metrics = _write_metrics(tmp_path / "metrics.json")
    anomalies = _write_anomalies(tmp_path / "anomalies.json", [])
    health = evaluate_canary(GATES, metrics, anomalies)
    assert health.healthy, (
        "baseline real square_50m deveria deixar o canário SAUDÁVEL (verde): "
        + "; ".join(r.message for r in health.results if not r.passed)
    )
    assert health.canary == DEFAULT_CANARY, f"canário default deveria ser {DEFAULT_CANARY}"


def test_baseline_real_so_warning_segue_saudavel(tmp_path):
    # WARNING (PWM/atitude/aceleração) é informativo: NÃO derruba o canário —
    # mesmo critério do gate (só CRITICAL bloqueia). Baseline com 1 WARNING segue verde.
    metrics = _write_metrics(tmp_path / "metrics.json")
    anomalies = _write_anomalies(
        tmp_path / "anomalies.json",
        [{"type": "PWM DIVERGENCE", "severity": "WARNING", "timestamp_ms": 12}],
    )
    health = evaluate_canary(GATES, metrics, anomalies)
    assert health.healthy, f"só WARNING não deveria derrubar o canário: {health.summary}"


# --------------------------------------------------------------------------- #
# Canário DOENTE: anomalia CRITICAL derruba o rollout (fail-closed)
# --------------------------------------------------------------------------- #


def test_anomalia_critical_derruba_canario(tmp_path):
    metrics = _write_metrics(tmp_path / "metrics.json")  # KPIs OK
    anomalies = _write_anomalies(
        tmp_path / "anomalies.json",
        [{"type": "VIBRATION SPIKE", "severity": "CRITICAL", "timestamp_ms": 10400}],
    )
    health = evaluate_canary(GATES, metrics, anomalies)
    assert not health.healthy, (
        "anomalia CRITICAL deveria deixar o canário DOENTE (fail-closed → "
        "deploy não roda = auto-rollback)"
    )


# --------------------------------------------------------------------------- #
# Canário DOENTE: KPI de missão fora do limiar do gate
# --------------------------------------------------------------------------- #


def test_aceleracao_fora_do_limiar_derruba_canario(tmp_path):
    # accel 20.0 > 15.0 (invariante físico) → canário doente.
    metrics = _write_metrics(tmp_path / "metrics.json", max_acceleration_m_s2=20.0)
    anomalies = _write_anomalies(tmp_path / "anomalies.json", [])
    health = evaluate_canary(GATES, metrics, anomalies)
    assert not health.healthy, "aceleração 20.0 > 15.0 deveria derrubar o canário"
    nomes_falhos = {r.name for r in health.results if not r.passed}
    assert "mission_metrics.max_acceleration_m_s2" in nomes_falhos, (
        f"esperava o gate de aceleração entre os falhos, veio {nomes_falhos}"
    )


def test_duracao_fora_do_limiar_derruba_canario(tmp_path):
    # dur 300 > 180 (baseline) → canário doente (missão travada/lenta no canário).
    metrics = _write_metrics(tmp_path / "metrics.json", mission_duration_s=300.0)
    anomalies = _write_anomalies(tmp_path / "anomalies.json", [])
    health = evaluate_canary(GATES, metrics, anomalies)
    assert not health.healthy, "duração 300s > 180s deveria derrubar o canário"


def test_std_altitude_fora_do_limiar_derruba_canario(tmp_path):
    # std 2.5 > 1.0 (controlador oscilando) → canário doente.
    metrics = _write_metrics(tmp_path / "metrics.json", std_altitude_cruise_m=2.5)
    anomalies = _write_anomalies(tmp_path / "anomalies.json", [])
    health = evaluate_canary(GATES, metrics, anomalies)
    assert not health.healthy, "std altitude 2.5 > 1.0 deveria derrubar o canário"


# --------------------------------------------------------------------------- #
# Borda do limiar: exatamente no threshold (<=) → ainda SAUDÁVEL
# --------------------------------------------------------------------------- #


def test_borda_limiar_exato_segue_saudavel(tmp_path):
    # check_mission_metrics usa actual <= threshold: bater EXATAMENTE no limiar
    # (accel=15.0, dur=180, std=1.0) ainda é saudável (não é fronteira estrita).
    metrics = _write_metrics(
        tmp_path / "metrics.json",
        max_acceleration_m_s2=15.0,
        mission_duration_s=180,
        std_altitude_cruise_m=1.0,
    )
    anomalies = _write_anomalies(tmp_path / "anomalies.json", [])
    health = evaluate_canary(GATES, metrics, anomalies)
    assert health.healthy, (
        "valores EXATAMENTE no limiar (<=) deveriam manter o canário saudável: "
        + "; ".join(r.message for r in health.results if not r.passed)
    )


def test_borda_limiar_estourado_por_epsilon_derruba(tmp_path):
    # um epsilon ACIMA do limiar (15.01 > 15.0) já derruba — confirma que a borda
    # é o threshold do gate, não um valor frouxo.
    metrics = _write_metrics(tmp_path / "metrics.json", max_acceleration_m_s2=15.01)
    anomalies = _write_anomalies(tmp_path / "anomalies.json", [])
    health = evaluate_canary(GATES, metrics, anomalies)
    assert not health.healthy, "15.01 > 15.0 deveria derrubar o canário (borda estrita do gate)"


# --------------------------------------------------------------------------- #
# Fail-closed: entrada obrigatória ausente/inválida → canário DOENTE
# --------------------------------------------------------------------------- #


def test_anomalies_ausente_fail_closed_doente(tmp_path):
    metrics = _write_metrics(tmp_path / "metrics.json")
    health = evaluate_canary(GATES, metrics, tmp_path / "nao-existe.json")
    assert not health.healthy, (
        "anomalies.json ausente deveria deixar o canário DOENTE (fail-closed), "
        "não verde por omissão"
    )


def test_metrics_ausente_fail_closed_doente(tmp_path):
    anomalies = _write_anomalies(tmp_path / "anomalies.json", [])
    health = evaluate_canary(GATES, tmp_path / "nao-existe.json", anomalies)
    assert not health.healthy, (
        "metrics.json ausente deveria deixar o canário DOENTE (fail-closed)"
    )


def test_anomalies_contrato_invalido_fail_closed_doente(tmp_path):
    # lista nua (contrato antigo, sem {_meta, anomalies}) → fail-closed.
    metrics = _write_metrics(tmp_path / "metrics.json")
    bad = tmp_path / "anomalies.json"
    bad.write_text(json.dumps([{"type": "X", "severity": "WARNING", "timestamp_ms": 1}]))
    health = evaluate_canary(GATES, metrics, bad)
    assert not health.healthy, (
        "anomalies.json fora do contrato {_meta, anomalies} deveria derrubar (fail-closed)"
    )


# --------------------------------------------------------------------------- #
# CLI ponta-a-ponta: exit code reflete healthy (0 saudável, 1 doente)
# --------------------------------------------------------------------------- #


def _run_cli(monkeypatch, args: list[str]) -> int:
    """Roda o main() do CLI capturando o SystemExit (exit code)."""
    import scripts.canary_healthcheck as mod

    monkeypatch.setattr("sys.argv", ["canary_healthcheck.py", *args])
    with pytest.raises(SystemExit) as exc:
        mod.main()
    code = exc.value.code
    return code if isinstance(code, int) else 0


def test_cli_baseline_saudavel_exit_zero(tmp_path, monkeypatch):
    metrics = _write_metrics(tmp_path / "metrics.json")
    anomalies = _write_anomalies(tmp_path / "anomalies.json", [])
    out = tmp_path / "canary-health.json"
    code = _run_cli(
        monkeypatch,
        ["--gates", str(GATES), "--metrics", str(metrics),
         "--anomalies", str(anomalies), "--output", str(out)],
    )
    assert code == 0, f"baseline saudável deveria sair com exit 0, veio {code}"
    # rastro auditável gravado e coerente com o veredito.
    rec = json.loads(out.read_text())
    assert rec["healthy"] is True, f"output deveria registrar healthy=True, veio {rec['healthy']}"
    assert rec["canary"] == DEFAULT_CANARY


def test_cli_canario_doente_exit_um(tmp_path, monkeypatch):
    metrics = _write_metrics(tmp_path / "metrics.json")
    anomalies = _write_anomalies(
        tmp_path / "anomalies.json",
        [{"type": "VIBRATION SPIKE", "severity": "CRITICAL", "timestamp_ms": 10400}],
    )
    code = _run_cli(
        monkeypatch,
        ["--gates", str(GATES), "--metrics", str(metrics), "--anomalies", str(anomalies)],
    )
    assert code == 1, (
        f"canário doente (CRITICAL) deveria sair com exit 1 (fail-closed), veio {code}"
    )
