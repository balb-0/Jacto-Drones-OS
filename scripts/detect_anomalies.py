"""CLI: detecta anomalias na telemetria de voo (server-side) → anomalies.json.

Porta para Python as MESMAS regras de `src/src/lib/anomaly-detection.ts` (front),
para que a esteira CI/CD enxergue as anomalias sem depender do dashboard. Regras:

- VIBRATION SPIKE (CRITICAL): vibration_x/y/z_g > 1.5 g em qualquer eixo.
- PWM DIVERGENCE (WARNING): max(pwm1-4) - min(pwm1-4) > 200 µs.
- ATTITUDE INSTABILITY (WARNING): abs(roll_deg) > 15° OU abs(pitch_deg) > 15°.
- ACCELERATION SPIKE (WARNING): acceleration_m_s2 > 10 m/s².

`detect_anomalies(points)` é PURA (sem I/O, testável em unit): recebe a lista de
pontos (`FlightTelemetryPoint`, dicts com as chaves do front) e devolve a lista
de anomalias no MESMO shape do front (`{type, severity, timestamp_ms, variables}`,
`variables = [{label, value}]`). O CLI lê `flight-telemetry.json` (a chave
`.points` produzida por scripts/extract_metrics.py — parse_telemetry) e grava
`anomalies.json` (lista, artefato consumido pelo gate — ci/anomaly.yml).

Uso:
    python scripts/detect_anomalies.py \\
        --input flight-telemetry.json \\
        --output anomalies.json
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any

LOG = logging.getLogger("detect_anomalies")

# Limiares espelhados do front (anomaly-detection.ts). Mudá-los aqui exige mudar
# lá também (par contratual front/CI) — ver ADR-0009.
VIBRATION_SPIKE_G = 1.5
PWM_DIVERGENCE_US = 200
ATTITUDE_INSTABILITY_DEG = 15
ACCELERATION_SPIKE_M_S2 = 10


def _vibration_spike(point: dict[str, Any]) -> dict[str, Any] | None:
    """Regra 1 — pico de vibração: qualquer eixo > 1.5 g (CRITICAL)."""
    vx = point["vibration_x_g"]
    vy = point["vibration_y_g"]
    vz = point["vibration_z_g"]
    if vx > VIBRATION_SPIKE_G or vy > VIBRATION_SPIKE_G or vz > VIBRATION_SPIKE_G:
        return {
            "type": "VIBRATION SPIKE",
            "severity": "CRITICAL",
            "variables": [
                {"label": "VIB X", "value": f"{vx:.2f}g"},
                {"label": "VIB Y", "value": f"{vy:.2f}g"},
                {"label": "VIB Z", "value": f"{vz:.2f}g"},
            ],
        }
    return None


def _pwm_divergence(point: dict[str, Any]) -> dict[str, Any] | None:
    """Regra 2 — divergência de PWM: max-min dos 4 motores > 200 µs (WARNING)."""
    pwms = [point["pwm1_us"], point["pwm2_us"], point["pwm3_us"], point["pwm4_us"]]
    pwm_diff = max(pwms) - min(pwms)
    if pwm_diff > PWM_DIVERGENCE_US:
        return {
            "type": "PWM DIVERGENCE",
            "severity": "WARNING",
            "variables": [
                {"label": "PWM1", "value": f"{pwms[0]:.0f}μs"},
                {"label": "PWM2", "value": f"{pwms[1]:.0f}μs"},
                {"label": "PWM3", "value": f"{pwms[2]:.0f}μs"},
                {"label": "PWM4", "value": f"{pwms[3]:.0f}μs"},
                {"label": "Δ", "value": f"{pwm_diff:.0f}μs"},
            ],
        }
    return None


def _attitude_instability(point: dict[str, Any]) -> dict[str, Any] | None:
    """Regra 3 — atitude instável: abs(roll) > 15° OU abs(pitch) > 15° (WARNING)."""
    roll = point["roll_deg"]
    pitch = point["pitch_deg"]
    if abs(roll) > ATTITUDE_INSTABILITY_DEG or abs(pitch) > ATTITUDE_INSTABILITY_DEG:
        return {
            "type": "ATTITUDE INSTABILITY",
            "severity": "WARNING",
            "variables": [
                {"label": "ROLL", "value": f"{roll:.1f}°"},
                {"label": "PITCH", "value": f"{pitch:.1f}°"},
            ],
        }
    return None


def _acceleration_spike(point: dict[str, Any]) -> dict[str, Any] | None:
    """Regra 4 — pico de aceleração: acceleration_m_s2 > 10 m/s² (WARNING)."""
    accel = point["acceleration_m_s2"]
    if accel > ACCELERATION_SPIKE_M_S2:
        return {
            "type": "ACCELERATION SPIKE",
            "severity": "WARNING",
            "variables": [
                {"label": "ACCEL", "value": f"{accel:.2f} m/s²"},
            ],
        }
    return None


# Ordem das regras alinhada ao front (anomaly-detection.ts).
_RULES = (_vibration_spike, _pwm_divergence, _attitude_instability, _acceleration_spike)


def detect_anomalies(points: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Aplica as 3 regras a cada ponto e devolve a lista de anomalias (pura).

    Cada anomalia carrega o `timestamp_ms` do ponto que a originou — mesmo shape
    do log do front (`LoggedAnomaly` sem o `id`, que é só de UI).
    """
    anomalies: list[dict[str, Any]] = []
    for point in points:
        for rule in _RULES:
            found = rule(point)
            if found is not None:
                anomalies.append({**found, "timestamp_ms": point["timestamp_ms"]})
    return anomalies


def _load_points(input_path: Path) -> list[dict[str, Any]]:
    """Lê flight-telemetry.json e devolve a lista `.points`."""
    data = json.loads(input_path.read_text())
    points = data.get("points")
    if not isinstance(points, list):
        raise ValueError(
            f"flight-telemetry.json sem lista '.points': {input_path}"
        )
    return points


def main() -> None:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s %(message)s"
    )
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--input", required=True, type=Path, help="flight-telemetry.json (.points)")
    p.add_argument("--output", required=True, type=Path, help="anomalies.json de saída")
    args = p.parse_args()

    LOG.info("lendo %s", args.input)
    points = _load_points(args.input)
    anomalies = detect_anomalies(points)

    n_critical = sum(1 for a in anomalies if a["severity"] == "CRITICAL")
    LOG.info(
        "%d pontos → %d anomalias (%d CRITICAL, %d WARNING)",
        len(points),
        len(anomalies),
        n_critical,
        len(anomalies) - n_critical,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(anomalies, indent=2, ensure_ascii=False) + "\n")
    LOG.info("gravou %s", args.output)
    sys.exit(0)


if __name__ == "__main__":
    main()
