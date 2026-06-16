"""CLI: detecta anomalias na telemetria de voo (server-side) → anomalies.json.

Porta para Python as MESMAS regras de `src/src/lib/anomaly-detection.ts` (front),
para que a esteira CI/CD enxergue as anomalias sem depender do dashboard. Regras:

- VIBRATION SPIKE (CRITICAL): vibration_x/y/z_g > 1.5 g em qualquer eixo.
- PWM DIVERGENCE (WARNING): max(pwm1-4) - min(pwm1-4) > 350 µs.
- ATTITUDE INSTABILITY (WARNING): abs(roll_deg) > 25° OU abs(pitch_deg) > 25°.
- ACCELERATION SPIKE (WARNING): acceleration_m_s2 > 18 m/s² (inclui gravidade).

Limiares recalibrados (2026-06-16) contra o voo real de referência square_50m: os
antigos (>200 µs / >15° / >10 m/s²) vinham da época dos mocks sintéticos e geravam
falso-positivo em voo normal (a aceleração real inclui a gravidade ~9.8 g; manobras
normais do square inclinam ~19° e divergem PWM ~280 µs). Voo bom → ~0 anomalias.

`detect_anomalies(points)` é PURA (sem I/O, testável em unit): recebe a lista de
pontos (`FlightTelemetryPoint`, dicts com as chaves do front) e devolve a lista
de anomalias no MESMO shape do front (`{type, severity, timestamp_ms, variables}`,
`variables = [{label, value}]`). O CLI lê `flight-telemetry.json` (a chave
`.points` produzida por scripts/extract_metrics.py — parse_telemetry) e grava
`anomalies.json` no CONTRATO que o front consome (src/src/data/anomalies.json):
OBJETO `{"_meta": {...}, "anomalies": [...]}` (não lista nua), consumido pelo
gate (ci/anomaly.yml → quality_gates.check_anomalies, que lê `.anomalies`).

Uso:
    python scripts/detect_anomalies.py \\
        --input flight-telemetry.json \\
        --output anomalies.json
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

LOG = logging.getLogger("detect_anomalies")

# Limiares espelhados do front (anomaly-detection.ts). Mudá-los aqui exige mudar
# lá também (par contratual front/CI) — ver ADR-0009.
VIBRATION_SPIKE_G = 1.5          # vibração anômala (baseline real square_50m ~0.05 g)
PWM_DIVERGENCE_US = 350          # divergência de motores (baseline square_50m: max ~280 µs)
ATTITUDE_INSTABILITY_DEG = 25    # inclinação anômala (manobras normais do square chegam a ~19°)
ACCELERATION_SPIKE_M_S2 = 18     # acceleration_m_s2 inclui gravidade ~9.8 g (baseline ~11)


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

    # Contrato alinhado ao que o front consome (src/src/data/anomalies.json,
    # type AnomaliesContract): OBJETO {_meta, anomalies}, não lista nua. O _meta
    # carrega a procedência (gerado_de, n_anomalias) E os campos que o
    # AnomalyEvidenceLog lê (estado, fonte_prevista) — ver ADR-0009 / TG5.
    contract = {
        "_meta": {
            "contrato": (
                "TG2 — lista de anomalias do ultimo run da missao SITL "
                "(formato {type, severity, timestamp_ms, variables})."
            ),
            "estado": "real",
            "nota": "Gerado por scripts/detect_anomalies.py a partir da telemetria de voo.",
            "fonte_prevista": "reports/anomalies.json — job detect-anomalies (ci/anomaly.yml)",
            "pipeline_ref": int(os.environ["CI_PIPELINE_ID"]) if os.environ.get("CI_PIPELINE_ID") else None,
            "gerado_de": str(args.input),
            "n_anomalias": len(anomalies),
        },
        "anomalies": anomalies,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(contract, indent=2, ensure_ascii=False) + "\n")
    LOG.info("gravou %s", args.output)
    sys.exit(0)


if __name__ == "__main__":
    main()
