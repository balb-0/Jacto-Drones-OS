"""CLI: lê arquivo ULog (.ulg) do PX4 e extrai KPIs + série temporal em JSON.

KPIs (metrics.json — consumido pelo quality gate, NÃO alterar formato):
- mission_duration_s: tempo total entre primeiro e último timestamp
- max_altitude_m / mean_altitude_m / std_altitude_cruise_m
- max_acceleration_m_s2: pico do módulo de aceleração
- max_battery_drop_pct: queda máxima de bateria entre amostras consecutivas

Série temporal (flight-telemetry.json — consumido pelo Flight Replay no front):
- lista de pontos no shape de `FlightTelemetryPoint` (ver
  src/src/types/flight-telemetry.ts), decimada para ~1500 pontos.

Funções puras (testáveis em unit, sem I/O):
- `compute_metrics_from_data`: séries → KPIs.
- `build_telemetry_series`: séries brutas JÁ alinhadas → list[FlightTelemetryPoint].
- `align_series`: reamostra tópicos numa grade temporal base (nearest/hold).
A ponte com o pyulog (`parse_ulog`, `parse_telemetry`) é validada no pipeline SITL.

Uso:
    python scripts/extract_metrics.py --ulog log.ulg --output reports/metrics.json
    python scripts/extract_metrics.py --ulog log.ulg --output reports/metrics.json \\
        --telemetry-output reports/flight-telemetry.json
"""

from __future__ import annotations

import argparse
import json
import logging
import math
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

LOG = logging.getLogger("extract_metrics")


@dataclass
class MissionMetrics:
    mission_duration_s: float
    max_altitude_m: float
    mean_altitude_m: float
    std_altitude_cruise_m: float
    max_acceleration_m_s2: float
    max_battery_drop_pct: float
    n_samples: int


def _std(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    var = sum((v - mean) ** 2 for v in values) / (len(values) - 1)
    return math.sqrt(var)


def _altitude_cruise_window(altitudes: list[float], cruise_min_m: float = 5.0) -> list[float]:
    """Retorna amostras de altitude em cruzeiro (>= cruise_min_m)."""
    return [a for a in altitudes if a >= cruise_min_m]


def compute_metrics_from_data(
    timestamps_s: list[float],
    altitudes_m: list[float],
    accelerations_m_s2: list[float],
    battery_pct: list[float],
) -> MissionMetrics:
    """Calcula KPIs a partir de séries temporais já extraídas (puro, testável)."""
    duration = (timestamps_s[-1] - timestamps_s[0]) if len(timestamps_s) >= 2 else 0.0

    if not altitudes_m:
        max_alt = mean_alt = std_alt_cruise = 0.0
    else:
        max_alt = max(altitudes_m)
        mean_alt = sum(altitudes_m) / len(altitudes_m)
        std_alt_cruise = _std(_altitude_cruise_window(altitudes_m))

    max_accel = max(accelerations_m_s2) if accelerations_m_s2 else 0.0

    if len(battery_pct) < 2:
        max_drop = 0.0
    else:
        diffs = [battery_pct[i - 1] - battery_pct[i] for i in range(1, len(battery_pct))]
        max_drop = max(diffs) if diffs else 0.0

    return MissionMetrics(
        mission_duration_s=round(duration, 2),
        max_altitude_m=round(max_alt, 2),
        mean_altitude_m=round(mean_alt, 2),
        std_altitude_cruise_m=round(std_alt_cruise, 3),
        max_acceleration_m_s2=round(max_accel, 2),
        max_battery_drop_pct=round(max_drop, 3),
        n_samples=max(len(timestamps_s), len(altitudes_m), len(accelerations_m_s2)),
    )


# ---------------------------------------------------------------------------
# Série temporal de telemetria (Flight Replay) — funções PURAS e testáveis.
#
# Espelha o shape de `FlightTelemetryPoint` (src/src/types/flight-telemetry.ts).
# Os campos sem fonte direta no .ulg são tratados graciosamente:
# `cooper_harper` (índice subjetivo, não medido) é zerado — NÃO é inferido de
# telemetria sintética para não rotular como avaliação humana o que não é.
# ---------------------------------------------------------------------------

# Conversão de PWM normalizado [-1, 1] (actuator_motors) ou [0, 1]
# (actuator_outputs) para largura de pulso aproximada em µs.
PWM_MIN_US = 1000.0
PWM_MAX_US = 2000.0

# Campos numéricos de FlightTelemetryPoint, na ordem do type (sem timestamp).
TELEMETRY_FIELDS = (
    "roll_deg",
    "pitch_deg",
    "yaw_deg",
    "angular_rate_roll_dps",
    "angular_rate_pitch_dps",
    "angular_rate_yaw_dps",
    "altitude_m",
    "acceleration_m_s2",
    "battery_pct",
    "pwm1_us",
    "pwm2_us",
    "pwm3_us",
    "pwm4_us",
    "vibration_x_g",
    "vibration_y_g",
    "vibration_z_g",
    "cooper_harper",
)


def quaternion_to_euler_deg(
    qw: float, qx: float, qy: float, qz: float
) -> tuple[float, float, float]:
    """Quaternion PX4 (q[0..3] = w,x,y,z) → (roll, pitch, yaw) em graus.

    Convenção aeroespacial ZYX (Tait–Bryan). Defende contra quaternion não
    normalizado (norma 0 → ângulos zerados em vez de divisão por zero).
    """
    norm = math.sqrt(qw * qw + qx * qx + qy * qy + qz * qz)
    if norm == 0.0:
        return 0.0, 0.0, 0.0
    qw, qx, qy, qz = qw / norm, qx / norm, qy / norm, qz / norm

    # roll (x-axis)
    sinr_cosp = 2.0 * (qw * qx + qy * qz)
    cosr_cosp = 1.0 - 2.0 * (qx * qx + qy * qy)
    roll = math.atan2(sinr_cosp, cosr_cosp)

    # pitch (y-axis) — clamp p/ evitar NaN no asin em gimbal lock
    sinp = 2.0 * (qw * qy - qz * qx)
    sinp = max(-1.0, min(1.0, sinp))
    pitch = math.asin(sinp)

    # yaw (z-axis)
    siny_cosp = 2.0 * (qw * qz + qx * qy)
    cosy_cosp = 1.0 - 2.0 * (qy * qy + qz * qz)
    yaw = math.atan2(siny_cosp, cosy_cosp)

    return math.degrees(roll), math.degrees(pitch), math.degrees(yaw)


def normalized_to_pwm_us(value: float) -> float:
    """Controle normalizado de motor → µs (~1000–2000).

    Aceita tanto [-1, 1] (actuator_motors) quanto [0, 1] (actuator_outputs):
    valores negativos são tratados como [-1, 1]. Faz clamp na faixa válida.
    """
    if math.isnan(value):
        return PWM_MIN_US
    v = (value + 1.0) / 2.0 if value < 0.0 else value
    v = max(0.0, min(1.0, v))
    return PWM_MIN_US + v * (PWM_MAX_US - PWM_MIN_US)


def _nearest_index(grid_t: list[float], series_t: list[float]) -> list[int]:
    """Para cada t da grade base, índice do timestamp mais próximo em series_t.

    Two-pointer (ambas listas ordenadas asc) — O(n+m). Retorna [] se series_t
    vazia (chamador deve tratar como tópico ausente).
    """
    if not series_t:
        return []
    idxs: list[int] = []
    j = 0
    last = len(series_t) - 1
    for t in grid_t:
        while j < last and series_t[j + 1] <= t:
            j += 1
        # compara vizinho à direita p/ escolher o mais próximo (não só o <=)
        if j < last and abs(series_t[j + 1] - t) < abs(series_t[j] - t):
            idxs.append(j + 1)
        else:
            idxs.append(j)
    return idxs


def align_series(
    base_t: list[float],
    topics: dict[str, dict[str, list[float]]],
) -> dict[str, list[float]]:
    """Reamostra colunas de vários tópicos na grade temporal `base_t`.

    `topics`: nome → {"t": [...], "col_a": [...], ...}. Para cada coluna de cada
    tópico, devolve "<topico>.<col>" alinhado por vizinho-mais-próximo (nearest;
    equivale a forward-fill/hold quando a grade base é mais densa). Tópicos/cols
    ausentes ou de comprimento incoerente são simplesmente omitidos (gracioso).
    """
    out: dict[str, list[float]] = {}
    for topic_name, cols in topics.items():
        t = cols.get("t", [])
        idxs = _nearest_index(base_t, t)
        if not idxs:
            continue
        for col_name, values in cols.items():
            if col_name == "t" or len(values) != len(t):
                continue
            out[f"{topic_name}.{col_name}"] = [values[i] for i in idxs]
    return out


def _col(aligned: dict[str, list[float]], key: str, n: int) -> list[float]:
    """Coluna alinhada `key` ou zeros (comprimento n) se ausente."""
    v = aligned.get(key)
    if v is None or len(v) != n:
        return [0.0] * n
    return v


def build_telemetry_series(
    base_t_s: list[float],
    aligned: dict[str, list[float]],
) -> list[dict[str, float]]:
    """Séries brutas JÁ alinhadas → list[FlightTelemetryPoint] (puro, testável).

    `base_t_s`: grade temporal base (segundos, ordenada). `aligned`: saída de
    `align_series` (chaves "<topico>.<col>"). Converte unidades para o shape do
    type (quaternion→euler graus, rad/s→deg/s, NED z→altitude positiva,
    remaining 0–1→pct, normalizado→µs, vibração g por eixo). Campos sem fonte
    ficam em 0. Robusto a tópicos ausentes (preenche com zero).
    """
    n = len(base_t_s)
    if n == 0:
        return []

    t0 = base_t_s[0]

    # Attitude (quaternion)
    qw = _col(aligned, "vehicle_attitude.q[0]", n)
    qx = _col(aligned, "vehicle_attitude.q[1]", n)
    qy = _col(aligned, "vehicle_attitude.q[2]", n)
    qz = _col(aligned, "vehicle_attitude.q[3]", n)

    # Angular velocity (rad/s → deg/s)
    wx = _col(aligned, "vehicle_angular_velocity.xyz[0]", n)
    wy = _col(aligned, "vehicle_angular_velocity.xyz[1]", n)
    wz = _col(aligned, "vehicle_angular_velocity.xyz[2]", n)

    # Local position z (NED, m) → altitude positiva
    z = _col(aligned, "vehicle_local_position.z", n)

    # Acceleration (m/s²) → módulo
    ax = _col(aligned, "vehicle_acceleration.xyz[0]", n)
    ay = _col(aligned, "vehicle_acceleration.xyz[1]", n)
    az = _col(aligned, "vehicle_acceleration.xyz[2]", n)

    # Battery remaining (0–1) → pct
    batt = _col(aligned, "battery_status.remaining", n)

    # Motors: actuator_motors.control[0..3] (normalizado) → µs
    m0 = _col(aligned, "actuator_motors.control[0]", n)
    m1 = _col(aligned, "actuator_motors.control[1]", n)
    m2 = _col(aligned, "actuator_motors.control[2]", n)
    m3 = _col(aligned, "actuator_motors.control[3]", n)

    # Vibração por eixo (vehicle_imu_status; ausente → zeros)
    vib_x = _col(aligned, "vehicle_imu_status.accel_vibration_metric", n)
    vib_y = _col(aligned, "vehicle_imu_status.gyro_vibration_metric", n)
    vib_z = _col(aligned, "vehicle_imu_status.accel_vibration_metric_z", n)

    points: list[dict[str, float]] = []
    for i in range(n):
        roll, pitch, yaw = quaternion_to_euler_deg(qw[i], qx[i], qy[i], qz[i])
        accel_mod = math.sqrt(ax[i] * ax[i] + ay[i] * ay[i] + az[i] * az[i])
        points.append(
            {
                "timestamp_ms": int(round((base_t_s[i] - t0) * 1000.0)),
                "sim_time_s": round(base_t_s[i] - t0, 2),
                "roll_deg": round(roll, 1),
                "pitch_deg": round(pitch, 1),
                "yaw_deg": round(yaw, 1),
                "angular_rate_roll_dps": round(math.degrees(wx[i]), 1),
                "angular_rate_pitch_dps": round(math.degrees(wy[i]), 1),
                "angular_rate_yaw_dps": round(math.degrees(wz[i]), 1),
                "altitude_m": round(-z[i], 1),
                "acceleration_m_s2": round(accel_mod, 1),
                "battery_pct": round(max(0.0, min(1.0, batt[i])) * 100.0, 1),
                "pwm1_us": int(round(normalized_to_pwm_us(m0[i]))),
                "pwm2_us": int(round(normalized_to_pwm_us(m1[i]))),
                "pwm3_us": int(round(normalized_to_pwm_us(m2[i]))),
                "pwm4_us": int(round(normalized_to_pwm_us(m3[i]))),
                "vibration_x_g": round(vib_x[i], 2),
                "vibration_y_g": round(vib_y[i], 2),
                "vibration_z_g": round(vib_z[i], 2),
                "cooper_harper": 0,
            }
        )
    return points


def decimate(items: list[Any], target: int = 1500) -> list[Any]:
    """Subamostra `items` para ~`target` pontos (passo = max(1, n // target))."""
    n = len(items)
    if n <= target or target <= 0:
        return list(items)
    step = max(1, n // target)
    return items[::step]


def parse_ulog(ulog_path: Path) -> MissionMetrics:
    """Lê .ulg via pyulog e extrai as séries temporais relevantes.

    Tópicos PX4:
    - vehicle_local_position: timestamp (us), z (m, NED — negativo = altitude)
    - vehicle_acceleration: timestamp, xyz (m/s²)
    - battery_status: timestamp, remaining (0-1)
    """
    from pyulog import ULog

    log = ULog(str(ulog_path))

    def get_topic(name: str) -> Any:
        for d in log.data_list:
            if d.name == name:
                return d
        return None

    pos = get_topic("vehicle_local_position")
    accel = get_topic("vehicle_acceleration")
    batt = get_topic("battery_status")

    timestamps_s: list[float] = []
    altitudes_m: list[float] = []
    if pos is not None:
        timestamps_s = [t / 1e6 for t in pos.data["timestamp"].tolist()]
        # No frame NED do PX4, z é negativo durante voo (positivo abaixo do home).
        altitudes_m = [-z for z in pos.data["z"].tolist()]

    accel_modules: list[float] = []
    if accel is not None:
        xs = accel.data["xyz[0]"].tolist()
        ys = accel.data["xyz[1]"].tolist()
        zs = accel.data["xyz[2]"].tolist()
        accel_modules = [
            math.sqrt(x * x + y * y + z * z) for x, y, z in zip(xs, ys, zs, strict=False)
        ]

    battery_pct: list[float] = []
    if batt is not None:
        battery_pct = [r * 100 for r in batt.data["remaining"].tolist()]

    return compute_metrics_from_data(timestamps_s, altitudes_m, accel_modules, battery_pct)


# Tópicos PX4 (v1.16) e as colunas lidas de cada um. A vibração vem de
# vehicle_imu_status; se o tópico/coluna faltar, `align_series`/`build_*` zeram.
_TELEMETRY_TOPICS: dict[str, tuple[str, ...]] = {
    "vehicle_attitude": ("q[0]", "q[1]", "q[2]", "q[3]"),
    "vehicle_angular_velocity": ("xyz[0]", "xyz[1]", "xyz[2]"),
    "vehicle_acceleration": ("xyz[0]", "xyz[1]", "xyz[2]"),
    "battery_status": ("remaining",),
    "actuator_motors": ("control[0]", "control[1]", "control[2]", "control[3]"),
    "vehicle_imu_status": (
        "accel_vibration_metric",
        "gyro_vibration_metric",
        "accel_vibration_metric_z",
    ),
}


def parse_telemetry(
    ulog_path: Path, mission_name: str = "", target_points: int = 1500
) -> dict[str, Any]:
    """Lê .ulg via pyulog → FlightTelemetryData (metadata + points decimados).

    Usa `vehicle_local_position` como GRADE TEMPORAL base; demais tópicos são
    alinhados por vizinho-mais-próximo. Tópicos/colunas ausentes são tratados
    graciosamente (preenchidos com zero), sem crash. A decimação ocorre na
    grade base ANTES do alinhamento, mantendo ~`target_points` pontos.
    """
    from pyulog import ULog

    log = ULog(str(ulog_path))

    def get_topic(name: str) -> Any:
        for d in log.data_list:
            if d.name == name:
                return d
        return None

    def column(topic: Any, key: str) -> list[float]:
        if topic is None or key not in topic.data:
            return []
        return [float(x) for x in topic.data[key].tolist()]

    pos = get_topic("vehicle_local_position")
    base_t_full = column(pos, "timestamp")  # µs
    base_t_full = [t / 1e6 for t in base_t_full]

    # Decima a grade base PRIMEIRO; alinha os demais já na grade reduzida.
    base_t = decimate(base_t_full, target_points)

    topics: dict[str, dict[str, list[float]]] = {}
    for name, cols in _TELEMETRY_TOPICS.items():
        topic = get_topic(name)
        if topic is None:
            continue
        t = [x / 1e6 for x in column(topic, "timestamp")]
        if not t:
            continue
        topics[name] = {"t": t, **{c: column(topic, c) for c in cols}}

    # vehicle_local_position.z entra como tópico próprio (grade base = seu t).
    if pos is not None and base_t:
        topics.setdefault(
            "vehicle_local_position",
            {"t": [x / 1e6 for x in column(pos, "timestamp")], "z": column(pos, "z")},
        )

    aligned = align_series(base_t, topics)
    points = build_telemetry_series(base_t, aligned)

    duration_s = round(base_t[-1] - base_t[0], 2) if len(base_t) >= 2 else 0.0
    sample_rate_hz = round(len(points) / duration_s, 3) if duration_s > 0 else 0.0

    return {
        "metadata": {
            "mission_name": mission_name or ulog_path.stem,
            "sample_rate_hz": sample_rate_hz,
            "total_points": len(points),
            "duration_s": duration_s,
            "failure_start_s": 0,
            "failure_end_s": 0,
            "airframe": "px4_sitl",
        },
        "points": points,
    }


def main() -> None:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s %(message)s"
    )
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--ulog", required=True, type=Path)
    p.add_argument("--output", required=True, type=Path)
    p.add_argument(
        "--telemetry-output",
        type=Path,
        default=None,
        help="se informado, escreve a série temporal (FlightTelemetryData) p/ o front",
    )
    p.add_argument(
        "--mission-name",
        default="",
        help="nome da missão p/ os metadados da telemetria (default: nome do .ulg)",
    )
    args = p.parse_args()

    # KPIs (metrics.json) — comportamento inalterado, sempre escrito.
    LOG.info("parsing %s", args.ulog)
    metrics = parse_ulog(args.ulog)
    LOG.info("metrics: %s", metrics)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(asdict(metrics), indent=2, sort_keys=True) + "\n")
    LOG.info("wrote %s", args.output)

    # Série temporal (flight-telemetry.json) — opcional, sob demanda da flag.
    if args.telemetry_output is not None:
        LOG.info("extracting telemetry series from %s", args.ulog)
        telemetry = parse_telemetry(args.ulog, mission_name=args.mission_name)
        LOG.info("telemetry: %d points", telemetry["metadata"]["total_points"])
        args.telemetry_output.parent.mkdir(parents=True, exist_ok=True)
        args.telemetry_output.write_text(json.dumps(telemetry, separators=(",", ":")) + "\n")
        LOG.info("wrote %s", args.telemetry_output)

    sys.exit(0)


if __name__ == "__main__":
    main()
