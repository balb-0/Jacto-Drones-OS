"""Thresholds BASELINE (mutáveis) da missão square_50m.

Sanity checks: detectam regressão grosseira (missão travou, ficou lenta,
controlador oscilando). Ajustáveis por PR comum conforme missão/hardware evolui
— ao contrário dos invariantes físicos (ver docs/testing-philosophy.md).
Valores de referência medidos no spike: duração ~79 s, std cruzeiro ~0.69 m.
"""

MAX_DURATION_S = 180
MAX_STD_ALT_CRUISE_M = 1.0


def test_mission_duration_within_baseline(mission_metrics):
    v = mission_metrics["mission_duration_s"]
    assert v <= MAX_DURATION_S, (
        f"baseline: duração {v:.1f}s excede {MAX_DURATION_S}s para square_50m "
        f"(missão pode ter travado ou ficado lenta)"
    )


def test_altitude_stability_within_baseline(mission_metrics):
    v = mission_metrics["std_altitude_cruise_m"]
    assert v <= MAX_STD_ALT_CRUISE_M, (
        f"baseline: instabilidade de altitude em cruzeiro {v:.3f}m > "
        f"{MAX_STD_ALT_CRUISE_M}m (controlador oscilando além do esperado)"
    )
