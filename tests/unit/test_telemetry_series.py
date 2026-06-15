"""Unit tests da série temporal de telemetria — funções puras (sem pyulog/I/O).

Validam o TRANSFORM `build_telemetry_series` (séries brutas alinhadas → pontos
no shape de FlightTelemetryPoint) e os utilitários de conversão/alinhamento.
A ponte com o pyulog (`parse_telemetry`) é exercitada no pipeline SITL.
"""

import math

from scripts.extract_metrics import (
    TELEMETRY_FIELDS,
    align_series,
    build_telemetry_series,
    decimate,
    normalized_to_pwm_us,
    quaternion_to_euler_deg,
)

# Campos de FlightTelemetryPoint que NÃO estão em TELEMETRY_FIELDS (têm chave própria).
_TIME_FIELDS = {"timestamp_ms", "sim_time_s"}


def test_quaternion_identity_is_zero_attitude():
    roll, pitch, yaw = quaternion_to_euler_deg(1.0, 0.0, 0.0, 0.0)
    assert abs(roll) < 1e-6 and abs(pitch) < 1e-6 and abs(yaw) < 1e-6, (
        f"quaternion identidade deveria dar (0,0,0), veio ({roll},{pitch},{yaw})"
    )


def test_quaternion_yaw_90_deg():
    # Rotação de 90° em yaw: q = (cos45, 0, 0, sin45).
    c = math.cos(math.radians(45))
    roll, pitch, yaw = quaternion_to_euler_deg(c, 0.0, 0.0, c)
    assert abs(yaw - 90.0) < 1e-3, f"yaw deveria ser 90°, veio {yaw}"
    assert abs(roll) < 1e-6 and abs(pitch) < 1e-6


def test_quaternion_zero_norm_is_safe():
    # Quaternion degenerado (norma 0) não pode dividir por zero.
    assert quaternion_to_euler_deg(0.0, 0.0, 0.0, 0.0) == (0.0, 0.0, 0.0)


def test_normalized_to_pwm_bounds_and_clamp():
    assert normalized_to_pwm_us(0.0) == 1000.0, "0.0 (parado) → 1000µs"
    assert normalized_to_pwm_us(1.0) == 2000.0, "1.0 (máx) → 2000µs"
    assert normalized_to_pwm_us(0.5) == 1500.0, "0.5 → 1500µs"
    # actuator_motors usa [-1,1]: -1 → 1000µs (mapeado p/ 0).
    assert normalized_to_pwm_us(-1.0) == 1000.0, "-1.0 → 1000µs (faixa [-1,1])"
    # Fora da faixa é clampado, não extrapola.
    assert normalized_to_pwm_us(2.0) == 2000.0, "acima de 1.0 clampa em 2000µs"


def test_align_series_nearest_and_missing_topic():
    base_t = [0.0, 1.0, 2.0]
    topics = {
        # tópico com grade mais grossa → hold/nearest na grade base
        "battery_status": {"t": [0.0, 2.0], "remaining": [1.0, 0.8]},
        # tópico ausente de colunas válidas é omitido (gracioso)
        "vehicle_imu_status": {"t": []},
    }
    aligned = align_series(base_t, topics)
    assert aligned["battery_status.remaining"] == [1.0, 1.0, 0.8], (
        f"nearest deveria dar [1.0,1.0,0.8], veio {aligned.get('battery_status.remaining')}"
    )
    assert "vehicle_imu_status.gyro_vibration_metric" not in aligned, (
        "tópico sem amostras não deveria aparecer no alinhado"
    )


def _synthetic_aligned(n: int) -> dict:
    """3 amostras alinhadas com valores conhecidos por campo."""
    return {
        "vehicle_attitude.q[0]": [1.0] * n,  # identidade → atitude 0
        "vehicle_attitude.q[1]": [0.0] * n,
        "vehicle_attitude.q[2]": [0.0] * n,
        "vehicle_attitude.q[3]": [0.0] * n,
        "vehicle_angular_velocity.xyz[0]": [math.radians(10.0)] * n,  # 10 deg/s
        "vehicle_angular_velocity.xyz[1]": [0.0] * n,
        "vehicle_angular_velocity.xyz[2]": [0.0] * n,
        "vehicle_local_position.z": [-5.0] * n,  # NED z=-5 → altitude +5
        "vehicle_acceleration.xyz[0]": [0.0] * n,
        "vehicle_acceleration.xyz[1]": [0.0] * n,
        "vehicle_acceleration.xyz[2]": [-9.8] * n,  # módulo 9.8
        "battery_status.remaining": [1.0, 0.9, 0.8][:n],  # → 100,90,80 pct
        "actuator_motors.control[0]": [0.5] * n,  # → 1500µs
        "actuator_motors.control[1]": [0.5] * n,
        "actuator_motors.control[2]": [0.5] * n,
        "actuator_motors.control[3]": [0.5] * n,
        "vehicle_imu_status.accel_vibration_metric": [0.3] * n,
        "vehicle_imu_status.gyro_vibration_metric": [0.2] * n,
        "vehicle_imu_status.accel_vibration_metric_z": [0.5] * n,
    }


def test_build_telemetry_series_shape_and_fields():
    base_t = [100.0, 100.4, 100.8]  # t0=100 → timestamps relativos
    points = build_telemetry_series(base_t, _synthetic_aligned(3))

    assert len(points) == 3, f"deveria produzir 3 pontos, veio {len(points)}"

    expected_keys = set(TELEMETRY_FIELDS) | _TIME_FIELDS
    for i, pt in enumerate(points):
        assert set(pt.keys()) == expected_keys, (
            f"ponto {i} tem chaves {set(pt.keys())}, esperado {expected_keys}"
        )

    first = points[0]
    # Tempo relativo ao início.
    assert first["timestamp_ms"] == 0, f"1º timestamp_ms deveria ser 0, veio {first['timestamp_ms']}"
    assert points[-1]["timestamp_ms"] == 800, "último timestamp_ms deveria ser 800 (0.8s)"
    # Conversões de unidade.
    assert first["roll_deg"] == 0.0 and first["pitch_deg"] == 0.0 and first["yaw_deg"] == 0.0
    assert first["angular_rate_roll_dps"] == 10.0, "rad/s deveria virar 10 deg/s"
    assert first["altitude_m"] == 5.0, "z=-5 NED deveria virar altitude +5"
    assert first["acceleration_m_s2"] == 9.8, "módulo de (0,0,-9.8) deveria ser 9.8"
    assert first["battery_pct"] == 100.0 and points[1]["battery_pct"] == 90.0
    assert first["pwm1_us"] == 1500, "control 0.5 deveria virar 1500µs"
    assert first["vibration_x_g"] == 0.3
    assert first["cooper_harper"] == 0, "cooper_harper não é medido → 0 (não inferido)"


def test_build_telemetry_series_missing_topics_are_zeroed():
    # Só posição presente; demais tópicos ausentes não podem quebrar.
    base_t = [0.0, 0.5]
    aligned = {"vehicle_local_position.z": [-2.0, -3.0]}
    points = build_telemetry_series(base_t, aligned)
    assert len(points) == 2
    pt = points[0]
    assert pt["altitude_m"] == 2.0
    # Sem bateria/motores/atitude → zeros graciosos (sem KeyError).
    assert pt["battery_pct"] == 0.0
    assert pt["pwm1_us"] == 1000, "motor ausente → normalizado 0 → 1000µs"
    assert pt["roll_deg"] == 0.0 and pt["vibration_z_g"] == 0.0


def test_build_telemetry_series_empty_is_safe():
    assert build_telemetry_series([], {}) == []


def test_decimate_keeps_target_order_of_magnitude():
    n = 10_000
    data = list(range(n))
    out = decimate(data, target=1500)
    # Passo = max(1, n // 1500) = 6 → ceil(n/6) = 1667 pontos (overshoot ~2x).
    step = max(1, n // 1500)
    assert len(out) == math.ceil(n / step), (
        f"decimação deveria dar {math.ceil(n / step)} pontos, veio {len(out)}"
    )
    assert len(out) < n // 5, "decimação deveria reduzir ao menos ~5x o volume"
    assert out[0] == 0, "decimação preserva o primeiro ponto"
    assert out[1] == step, f"passo deveria ser {step}, veio {out[1]}"


def test_decimate_noop_when_small():
    data = [1, 2, 3]
    assert decimate(data, target=1500) == [1, 2, 3]
