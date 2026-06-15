"""Unit tests da detecção de anomalias — função pura `detect_anomalies`.

Rápidos (<1s), isolados, sem I/O — espelham as regras de anomaly-detection.ts
(front) portadas para o CI (TG2). Asserções self-validating com diagnóstico
(ver docs/testing-philosophy.md).
"""

from scripts.detect_anomalies import detect_anomalies

# Ponto-base nominal (sem anomalia): valores dentro de todos os limiares. Cada
# teste sobrescreve só o que quer estressar (mantém o caso legível).
_NOMINAL = {
    "timestamp_ms": 1000,
    "roll_deg": -2.1,
    "pitch_deg": 1.5,
    "pwm1_us": 1496,
    "pwm2_us": 1499,
    "pwm3_us": 1491,
    "pwm4_us": 1508,
    "vibration_x_g": 0.2,
    "vibration_y_g": 0.0,
    "vibration_z_g": 0.7,
    "acceleration_m_s2": 9.6,
}


def _point(**overrides) -> dict:
    p = dict(_NOMINAL)
    p.update(overrides)
    return p


def test_ponto_nominal_nao_gera_anomalia():
    anomalies = detect_anomalies([_point()])
    assert anomalies == [], f"ponto nominal não deveria gerar anomalia, veio {anomalies}"


def test_vibration_spike_critical():
    # vibração no eixo Z acima de 1.5 g → VIBRATION SPIKE (CRITICAL).
    anomalies = detect_anomalies([_point(vibration_z_g=2.3)])
    assert len(anomalies) == 1, f"esperava 1 anomalia, veio {len(anomalies)}"
    a = anomalies[0]
    assert a["type"] == "VIBRATION SPIKE", f"type {a['type']} != VIBRATION SPIKE"
    assert a["severity"] == "CRITICAL", f"severity {a['severity']} != CRITICAL"
    assert a["timestamp_ms"] == 1000, f"timestamp_ms {a['timestamp_ms']} != 1000"


def test_pwm_divergence_warning():
    # spread de PWM = 1750 - 1496 = 254 µs > 200 → PWM DIVERGENCE (WARNING).
    anomalies = detect_anomalies([_point(pwm2_us=1750)])
    assert len(anomalies) == 1, f"esperava 1 anomalia, veio {len(anomalies)}"
    a = anomalies[0]
    assert a["type"] == "PWM DIVERGENCE", f"type {a['type']} != PWM DIVERGENCE"
    assert a["severity"] == "WARNING", f"severity {a['severity']} != WARNING"


def test_attitude_instability_warning():
    # roll -22° (abs > 15°) → ATTITUDE INSTABILITY (WARNING).
    anomalies = detect_anomalies([_point(roll_deg=-22.0)])
    assert len(anomalies) == 1, f"esperava 1 anomalia, veio {len(anomalies)}"
    a = anomalies[0]
    assert a["type"] == "ATTITUDE INSTABILITY", f"type {a['type']} != ATTITUDE INSTABILITY"
    assert a["severity"] == "WARNING", f"severity {a['severity']} != WARNING"


def test_acceleration_spike_warning():
    # aceleração 11.01 m/s² (> 10) → ACCELERATION SPIKE (WARNING).
    anomalies = detect_anomalies([_point(acceleration_m_s2=11.01)])
    assert len(anomalies) == 1, f"esperava 1 anomalia, veio {len(anomalies)}"
    a = anomalies[0]
    assert a["type"] == "ACCELERATION SPIKE", f"type {a['type']} != ACCELERATION SPIKE"
    assert a["severity"] == "WARNING", f"severity {a['severity']} != WARNING"
    assert a["variables"] == [{"label": "ACCEL", "value": "11.01 m/s²"}], (
        f"variables fora do contrato do front, veio {a['variables']}"
    )


def test_limiar_e_estritamente_maior():
    # exatamente no limiar NÃO dispara (front usa `> 1.5`, não `>=`).
    anomalies = detect_anomalies([_point(vibration_x_g=1.5)])
    assert anomalies == [], f"vibração == 1.5 g (no limiar) não deveria disparar, veio {anomalies}"
    # mesma regra de borda para aceleração (front usa `> 10`, não `>=`).
    accel_no_limiar = detect_anomalies([_point(acceleration_m_s2=10.0)])
    assert accel_no_limiar == [], (
        f"aceleração == 10 m/s² (no limiar) não deveria disparar, veio {accel_no_limiar}"
    )


def test_multiplas_regras_no_mesmo_ponto():
    # um ponto pode violar mais de uma regra de uma vez (vibração + atitude).
    anomalies = detect_anomalies([_point(vibration_z_g=2.0, pitch_deg=20.0)])
    types = sorted(a["type"] for a in anomalies)
    assert types == ["ATTITUDE INSTABILITY", "VIBRATION SPIKE"], (
        f"esperava as duas anomalias no mesmo ponto, veio {types}"
    )


def test_serie_vazia_e_segura():
    assert detect_anomalies([]) == [], "série vazia deveria render lista vazia"
