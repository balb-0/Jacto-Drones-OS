"""Invariantes FÍSICOS (imutáveis) da missão SITL.

Estes limites são leis do hardware — só mudam com ADR + revisão de engenharia
mecânica (NÃO por PR comum). Separados dos thresholds baseline justamente por
terem política de mudança diferente (ver docs/testing-philosophy.md e ADR-0003).
"""

# Limite mecânico do frame x500 (ADR-0003).
MAX_ACCEL_M_S2 = 15.0


def test_max_acceleration_within_hardware_limit(mission_metrics):
    v = mission_metrics["max_acceleration_m_s2"]
    assert v <= MAX_ACCEL_M_S2, (
        f"violação de invariante físico: aceleração máxima {v:.2f} m/s² excede o "
        f"limite mecânico de {MAX_ACCEL_M_S2} m/s² (frame x500, ADR-0003)"
    )


def test_altitude_sign_is_physical(mission_metrics):
    # No frame NED a altitude (=-z) tem que ser positiva durante o voo.
    v = mission_metrics["max_altitude_m"]
    assert v > 0, (
        f"altitude máxima {v} m não-positiva — provável erro de sinal NED na extração "
        f"(o drone deveria ter subido a ~10 m na missão square_50m)"
    )
