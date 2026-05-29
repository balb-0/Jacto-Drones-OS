"""Unit tests da extração de métricas — função pura `compute_metrics_from_data`.

Rápidos (<1s), isolados, sem I/O — base da pirâmide/troféu de testes
(ver docs/testing-philosophy.md). Asserções self-validating com diagnóstico.
"""

from scripts.extract_metrics import compute_metrics_from_data


def test_duration_is_last_minus_first():
    m = compute_metrics_from_data([10.0, 11.0, 12.5], [], [], [])
    assert m.mission_duration_s == 2.5, f"duração deveria ser 2.5s, veio {m.mission_duration_s}"


def test_altitude_stats_and_cruise_window():
    # cruise (>=5 m) = [6, 8, 10]; média geral = 6.0; std amostral do cruise = 2.0
    m = compute_metrics_from_data([0, 1, 2, 3], [0.0, 6.0, 8.0, 10.0], [], [])
    assert m.max_altitude_m == 10.0, f"max_altitude {m.max_altitude_m} != 10.0"
    assert abs(m.mean_altitude_m - 6.0) < 1e-6, f"mean_altitude {m.mean_altitude_m} != 6.0"
    assert abs(m.std_altitude_cruise_m - 2.0) < 1e-3, (
        f"std de cruzeiro {m.std_altitude_cruise_m} != 2.0 (janela >=5m deveria ser [6,8,10])"
    )


def test_max_acceleration_is_module_max():
    m = compute_metrics_from_data([0, 1, 2], [], [9.8, 12.0, 10.0], [])
    assert m.max_acceleration_m_s2 == 12.0, f"max_accel {m.max_acceleration_m_s2} != 12.0"


def test_battery_drop_ignores_recovery():
    # diffs consecutivos: 0.5, -0.5 (recuperação, ignorada), 2.0 → max 2.0
    m = compute_metrics_from_data([0, 1, 2, 3], [], [], [100.0, 99.5, 100.0, 98.0])
    assert m.max_battery_drop_pct == 2.0, (
        f"queda máx de bateria {m.max_battery_drop_pct} != 2.0 (recuperação não conta)"
    )


def test_empty_series_is_safe():
    m = compute_metrics_from_data([], [], [], [])
    assert m.mission_duration_s == 0.0, "duração de série vazia deveria ser 0.0"
    assert m.n_samples == 0, "n_samples de série vazia deveria ser 0"
