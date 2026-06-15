#!/usr/bin/env python3
"""
Generate synthetic flight telemetry data for multiple scenarios.
Outputs JSON files with 200 data points at 2.5Hz for ~80s flight.

Scenarios:
  - motor_failure  : Motor 3 fails at 50s, recovery/RTL (existing)
  - normal         : Clean flight, no anomalies
  - vibration      : Periodic vibration spikes >1.5g throughout cruise
  - battery        : Gradual voltage degradation, forced landing
"""

import json
import math
import numpy as np
from pathlib import Path

SAMPLE_RATE_HZ = 2.5
DURATION_S = 80.0
TOTAL_POINTS = int(SAMPLE_RATE_HZ * DURATION_S)
DT = 1.0 / SAMPLE_RATE_HZ

TAKEOFF_END = 10.0
CRUISE_END = 50.0
FAILURE_END = 60.0

DATA_DIR = Path(__file__).parent.parent / "src" / "src" / "data"


# ---------------------------------------------------------------------------
# Shared phase generators
# ---------------------------------------------------------------------------

def _takeoff(t: float, rng: np.random.Generator, *,
             battery_drain: float = 0.1,
             vib_scale: float = 1.0) -> dict:
    """Takeoff phase (0-10s)."""
    progress = t / TAKEOFF_END
    altitude = 10.0 * (1 - math.cos(math.pi * progress)) / 2
    base_accel = 8.0 + 2.0 * math.sin(math.pi * progress)
    acceleration = base_accel + rng.normal(0, 0.5)
    battery = 100.0 - battery_drain * progress

    roll = rng.normal(0, 2.0)
    pitch = rng.normal(0, 2.0)
    yaw = rng.normal(0, 1.0)
    ang_roll = rng.normal(0, 5.0)
    ang_pitch = rng.normal(0, 5.0)
    ang_yaw = rng.normal(0, 3.0)

    pwm_base = 1500 + 100 * progress
    pwm1 = pwm_base + rng.normal(0, 10)
    pwm2 = pwm_base + rng.normal(0, 10)
    pwm3 = pwm_base + rng.normal(0, 10)
    pwm4 = pwm_base + rng.normal(0, 10)

    vib_x = rng.normal(0, 0.3 * vib_scale)
    vib_y = rng.normal(0, 0.3 * vib_scale)
    vib_z = rng.normal(0.5, 0.2 * vib_scale)

    return {
        "roll_deg": round(roll, 1), "pitch_deg": round(pitch, 1),
        "yaw_deg": round(yaw, 1),
        "angular_rate_roll_dps": round(ang_roll, 1),
        "angular_rate_pitch_dps": round(ang_pitch, 1),
        "angular_rate_yaw_dps": round(ang_yaw, 1),
        "altitude_m": round(altitude, 1),
        "acceleration_m_s2": round(acceleration, 1),
        "battery_pct": round(battery, 1),
        "pwm1_us": int(pwm1), "pwm2_us": int(pwm2),
        "pwm3_us": int(pwm3), "pwm4_us": int(pwm4),
        "vibration_x_g": round(vib_x, 1),
        "vibration_y_g": round(vib_y, 1),
        "vibration_z_g": round(vib_z, 1),
        "cooper_harper": 2,
    }


def _cruise(t: float, rng: np.random.Generator, *,
            battery_start: float = 100.0,
            battery_drain_rate: float = 5.0,
            vib_scale: float = 1.0,
            vibration_spike: bool = False) -> dict:
    """Cruise phase (10-50s)."""
    phase_time = t - TAKEOFF_END
    phase_progress = phase_time / (CRUISE_END - TAKEOFF_END)

    altitude = 10.0 + 0.7 * math.sin(2 * math.pi * phase_time / 5.0)
    altitude += rng.normal(0, 0.1)
    acceleration = 2.0 + rng.normal(0, 0.8)
    battery = battery_start - battery_drain_rate * phase_progress

    roll = 3.0 * math.sin(2 * math.pi * phase_time / 8.0) + rng.normal(0, 1.0)
    pitch = 2.0 * math.cos(2 * math.pi * phase_time / 10.0) + rng.normal(0, 1.0)
    yaw = 5.0 * math.sin(2 * math.pi * phase_time / 20.0) + rng.normal(0, 0.5)
    ang_roll = rng.normal(0, 3.0)
    ang_pitch = rng.normal(0, 3.0)
    ang_yaw = rng.normal(0, 2.0)

    pwm_base = 1500
    pwm1 = pwm_base + 50 * math.sin(2 * math.pi * phase_time / 6.0) + rng.normal(0, 10)
    pwm2 = pwm_base + 50 * math.cos(2 * math.pi * phase_time / 6.0) + rng.normal(0, 10)
    pwm3 = pwm_base + 50 * math.sin(2 * math.pi * phase_time / 6.0 + math.pi / 2) + rng.normal(0, 10)
    pwm4 = pwm_base + 50 * math.cos(2 * math.pi * phase_time / 6.0 + math.pi / 2) + rng.normal(0, 10)

    vib_x = rng.normal(0, 0.15 * vib_scale)
    vib_y = rng.normal(0, 0.15 * vib_scale)
    vib_z = 1.0 + rng.normal(0, 0.1 * vib_scale)

    # Periodic vibration spikes every ~8s during cruise
    if vibration_spike:
        spike_cycle = phase_time % 8.0
        if spike_cycle < 2.0:
            spike_intensity = math.sin(math.pi * spike_cycle / 2.0)
            vib_x += 2.0 * spike_intensity * math.sin(2 * math.pi * phase_time / 0.8)
            vib_y += 1.8 * spike_intensity * math.cos(2 * math.pi * phase_time / 0.9)
            vib_z += 2.5 * spike_intensity

    cooper_harper = 2

    return {
        "roll_deg": round(roll, 1), "pitch_deg": round(pitch, 1),
        "yaw_deg": round(yaw, 1),
        "angular_rate_roll_dps": round(ang_roll, 1),
        "angular_rate_pitch_dps": round(ang_pitch, 1),
        "angular_rate_yaw_dps": round(ang_yaw, 1),
        "altitude_m": round(altitude, 1),
        "acceleration_m_s2": round(acceleration, 1),
        "battery_pct": round(max(0, battery), 1),
        "pwm1_us": int(pwm1), "pwm2_us": int(pwm2),
        "pwm3_us": int(pwm3), "pwm4_us": int(pwm4),
        "vibration_x_g": round(vib_x, 1),
        "vibration_y_g": round(vib_y, 1),
        "vibration_z_g": round(vib_z, 1),
        "cooper_harper": cooper_harper,
    }


def _landing(t: float, start_time: float, end_time: float,
             rng: np.random.Generator, *,
             altitude_start: float = 10.0,
             battery_start: float = 90.0,
             battery_drain: float = 5.0,
             vib_scale: float = 1.0,
             cooper_start: int = 3,
             cooper_end: int = 2) -> dict:
    """Generic landing/descent phase."""
    phase_time = t - start_time
    phase_progress = phase_time / (end_time - start_time)

    altitude = altitude_start * (1 - phase_progress) + rng.normal(0, 0.1)
    altitude = max(0.0, altitude)
    acceleration = 4.0 - 2.0 * phase_progress + rng.normal(0, 0.5)
    acceleration = max(1.5, acceleration)
    battery = battery_start - battery_drain * phase_progress

    stability = 1.0 - 0.3 * phase_progress
    roll = 2.0 * stability * math.sin(2 * math.pi * phase_time / 6.0) + rng.normal(0, 1.0)
    pitch = 1.5 * stability * math.cos(2 * math.pi * phase_time / 7.0) + rng.normal(0, 1.0)
    yaw = 3.0 * stability * math.sin(2 * math.pi * phase_time / 10.0) + rng.normal(0, 0.5)
    ang_roll = rng.normal(0, 2.0 * stability)
    ang_pitch = rng.normal(0, 2.0 * stability)
    ang_yaw = rng.normal(0, 1.5 * stability)

    pwm_base = 1500 - 200 * phase_progress
    pwm1 = pwm_base + rng.normal(0, 10)
    pwm2 = pwm_base + rng.normal(0, 10)
    pwm3 = pwm_base + rng.normal(0, 10)
    pwm4 = pwm_base + rng.normal(0, 10)

    vib_x = rng.normal(0, 0.2 * vib_scale)
    vib_y = rng.normal(0, 0.2 * vib_scale)
    vib_z = 0.8 - 0.3 * phase_progress + rng.normal(0, 0.1)

    cooper = int(cooper_start + (cooper_end - cooper_start) * phase_progress)

    return {
        "roll_deg": round(roll, 1), "pitch_deg": round(pitch, 1),
        "yaw_deg": round(yaw, 1),
        "angular_rate_roll_dps": round(ang_roll, 1),
        "angular_rate_pitch_dps": round(ang_pitch, 1),
        "angular_rate_yaw_dps": round(ang_yaw, 1),
        "altitude_m": round(altitude, 1),
        "acceleration_m_s2": round(acceleration, 1),
        "battery_pct": round(max(0, battery), 1),
        "pwm1_us": int(pwm1), "pwm2_us": int(pwm2),
        "pwm3_us": int(pwm3), "pwm4_us": int(pwm4),
        "vibration_x_g": round(vib_x, 1),
        "vibration_y_g": round(vib_y, 1),
        "vibration_z_g": round(vib_z, 1),
        "cooper_harper": max(1, cooper),
    }


# ---------------------------------------------------------------------------
# Scenario: Motor Failure (existing)
# ---------------------------------------------------------------------------

def _motor_failure_phase(t: float, rng: np.random.Generator) -> dict:
    """Motor failure phase (50-60s): motor 3 drops."""
    phase_time = t - CRUISE_END
    phase_progress = phase_time / (FAILURE_END - CRUISE_END)

    if phase_time < 5.0:
        pwm3_drop = 1500 - 700 * (phase_time / 5.0)
    else:
        pwm3_drop = 800

    altitude = 10.0 - 2.0 * phase_progress + rng.normal(0, 0.3)
    acceleration = 12.0 + 3.0 * math.sin(2 * math.pi * phase_time / 2.0)
    acceleration += rng.normal(0, 1.5)
    battery = 95.0 - 2.0 * phase_progress

    roll = 20.0 * math.sin(2 * math.pi * phase_time / 3.0) + rng.normal(0, 3.0)
    pitch = 15.0 * math.cos(2 * math.pi * phase_time / 2.5) + rng.normal(0, 3.0)
    yaw = 10.0 * math.sin(2 * math.pi * phase_time / 4.0) + rng.normal(0, 2.0)
    ang_roll = 15.0 * math.cos(2 * math.pi * phase_time / 3.0) + rng.normal(0, 5.0)
    ang_pitch = 12.0 * math.sin(2 * math.pi * phase_time / 2.5) + rng.normal(0, 5.0)
    ang_yaw = 8.0 * math.cos(2 * math.pi * phase_time / 4.0) + rng.normal(0, 3.0)

    pwm_base = 1500
    pwm1 = pwm_base + 100 * phase_progress + rng.normal(0, 20)
    pwm2 = pwm_base + 80 * phase_progress + rng.normal(0, 20)
    pwm3 = pwm3_drop + rng.normal(0, 15)
    pwm4 = pwm_base + 90 * phase_progress + rng.normal(0, 20)

    vib_x = 2.0 * math.sin(2 * math.pi * phase_time / 1.5) + rng.normal(0, 0.5)
    vib_y = 1.5 * math.cos(2 * math.pi * phase_time / 1.8) + rng.normal(0, 0.5)
    vib_z = 2.5 + 1.0 * math.sin(2 * math.pi * phase_time / 2.0) + rng.normal(0, 0.3)
    cooper_harper = int(2 + 6 * min(1.0, phase_progress * 2))

    return {
        "roll_deg": round(roll, 1), "pitch_deg": round(pitch, 1),
        "yaw_deg": round(yaw, 1),
        "angular_rate_roll_dps": round(ang_roll, 1),
        "angular_rate_pitch_dps": round(ang_pitch, 1),
        "angular_rate_yaw_dps": round(ang_yaw, 1),
        "altitude_m": round(altitude, 1),
        "acceleration_m_s2": round(acceleration, 1),
        "battery_pct": round(battery, 1),
        "pwm1_us": int(pwm1), "pwm2_us": int(pwm2),
        "pwm3_us": int(pwm3), "pwm4_us": int(pwm4),
        "vibration_x_g": round(vib_x, 1),
        "vibration_y_g": round(vib_y, 1),
        "vibration_z_g": round(vib_z, 1),
        "cooper_harper": cooper_harper,
    }


def _motor_recovery_phase(t: float, rng: np.random.Generator) -> dict:
    """Recovery/RTL after motor failure (60-80s)."""
    phase_time = t - FAILURE_END
    phase_progress = phase_time / (DURATION_S - FAILURE_END)

    pwm3_recovery = 800 + 400 * phase_progress
    altitude = 8.0 - 7.0 * phase_progress + rng.normal(0, 0.2)
    altitude = max(0.5, altitude)
    acceleration = 8.0 - 5.0 * phase_progress + rng.normal(0, 0.8)
    acceleration = max(2.0, acceleration)
    battery = 93.0 - 3.0 * phase_progress

    stability_factor = 1.0 - phase_progress
    roll = 10.0 * stability_factor * math.sin(2 * math.pi * phase_time / 4.0) + rng.normal(0, 2.0 * stability_factor)
    pitch = 8.0 * stability_factor * math.cos(2 * math.pi * phase_time / 3.5) + rng.normal(0, 2.0 * stability_factor)
    yaw = 5.0 * stability_factor * math.sin(2 * math.pi * phase_time / 5.0) + rng.normal(0, 1.0 * stability_factor)
    ang_roll = 8.0 * stability_factor * math.cos(2 * math.pi * phase_time / 4.0) + rng.normal(0, 3.0 * stability_factor)
    ang_pitch = 6.0 * stability_factor * math.sin(2 * math.pi * phase_time / 3.5) + rng.normal(0, 3.0 * stability_factor)
    ang_yaw = 4.0 * stability_factor * math.cos(2 * math.pi * phase_time / 5.0) + rng.normal(0, 2.0 * stability_factor)

    pwm_base = 1500
    pwm1 = pwm_base + 50 * stability_factor + rng.normal(0, 15)
    pwm2 = pwm_base + 40 * stability_factor + rng.normal(0, 15)
    pwm3 = pwm3_recovery + rng.normal(0, 15)
    pwm4 = pwm_base + 45 * stability_factor + rng.normal(0, 15)

    vib_x = 1.5 * stability_factor * math.sin(2 * math.pi * phase_time / 2.0) + rng.normal(0, 0.3)
    vib_y = 1.0 * stability_factor * math.cos(2 * math.pi * phase_time / 2.2) + rng.normal(0, 0.3)
    vib_z = 1.5 + 0.5 * stability_factor + rng.normal(0, 0.2)
    cooper_harper = int(8 - 5 * phase_progress)
    cooper_harper = max(3, cooper_harper)

    return {
        "roll_deg": round(roll, 1), "pitch_deg": round(pitch, 1),
        "yaw_deg": round(yaw, 1),
        "angular_rate_roll_dps": round(ang_roll, 1),
        "angular_rate_pitch_dps": round(ang_pitch, 1),
        "angular_rate_yaw_dps": round(ang_yaw, 1),
        "altitude_m": round(altitude, 1),
        "acceleration_m_s2": round(acceleration, 1),
        "battery_pct": round(battery, 1),
        "pwm1_us": int(pwm1), "pwm2_us": int(pwm2),
        "pwm3_us": int(pwm3), "pwm4_us": int(pwm4),
        "vibration_x_g": round(vib_x, 1),
        "vibration_y_g": round(vib_y, 1),
        "vibration_z_g": round(vib_z, 1),
        "cooper_harper": cooper_harper,
    }


def generate_motor_failure() -> dict:
    """Motor failure scenario (existing)."""
    rng = np.random.default_rng(seed=42)
    points = []
    for i in range(TOTAL_POINTS):
        t = i * DT
        if t < TAKEOFF_END:
            data = _takeoff(t, rng)
        elif t < CRUISE_END:
            data = _cruise(t, rng)
        elif t < FAILURE_END:
            data = _motor_failure_phase(t, rng)
        else:
            data = _motor_recovery_phase(t, rng)
        points.append({"timestamp_ms": int(t * 1000), "sim_time_s": round(t, 2), **data})

    return {
        "metadata": {
            "mission_name": "square_50m_motor_failure",
            "sample_rate_hz": SAMPLE_RATE_HZ,
            "total_points": TOTAL_POINTS,
            "duration_s": DURATION_S,
            "failure_start_s": CRUISE_END,
            "failure_end_s": FAILURE_END,
            "airframe": "DJI Agras T50",
            "home_location": {"latitude": 47.397742, "longitude": 8.545594, "name": "Zurich/ETH"},
        },
        "points": points,
    }


# ---------------------------------------------------------------------------
# Scenario: Normal Flight
# ---------------------------------------------------------------------------

def generate_normal() -> dict:
    """Normal flight — no anomalies, smooth and healthy."""
    rng = np.random.default_rng(seed=100)
    points = []
    for i in range(TOTAL_POINTS):
        t = i * DT
        if t < TAKEOFF_END:
            data = _takeoff(t, rng, battery_drain=0.05, vib_scale=0.8)
        elif t < CRUISE_END:
            data = _cruise(t, rng, battery_start=100.0, battery_drain_rate=4.0, vib_scale=0.8)
        else:
            data = _landing(t, CRUISE_END, DURATION_S, rng,
                            altitude_start=10.0, battery_start=84.0,
                            battery_drain=3.0, vib_scale=0.8,
                            cooper_start=2, cooper_end=2)
        points.append({"timestamp_ms": int(t * 1000), "sim_time_s": round(t, 2), **data})

    return {
        "metadata": {
            "mission_name": "square_50m_normal",
            "sample_rate_hz": SAMPLE_RATE_HZ,
            "total_points": TOTAL_POINTS,
            "duration_s": DURATION_S,
            "failure_start_s": 0,
            "failure_end_s": 0,
            "airframe": "DJI Agras T50",
            "home_location": {"latitude": 47.397742, "longitude": 8.545594, "name": "Zurich/ETH"},
        },
        "points": points,
    }


# ---------------------------------------------------------------------------
# Scenario: Vibration Issues
# ---------------------------------------------------------------------------

def _vibration_cruise(t: float, rng: np.random.Generator) -> dict:
    """Cruise with periodic vibration spikes."""
    return _cruise(t, rng, battery_start=100.0, battery_drain_rate=5.0,
                   vib_scale=1.0, vibration_spike=True)


def _vibration_landing(t: float, rng: np.random.Generator) -> dict:
    """Landing after vibration scenario — still some residual vibration."""
    phase_time = t - CRUISE_END
    phase_progress = phase_time / (DURATION_S - CRUISE_END)

    data = _landing(t, CRUISE_END, DURATION_S, rng,
                    altitude_start=10.0, battery_start=88.0,
                    battery_drain=4.0, vib_scale=1.2,
                    cooper_start=4, cooper_end=3)

    # Residual vibration spikes during landing
    spike_cycle = phase_time % 6.0
    if spike_cycle < 1.5:
        intensity = math.sin(math.pi * spike_cycle / 1.5) * (1.0 - phase_progress)
        data["vibration_x_g"] = round(data["vibration_x_g"] + 1.8 * intensity, 1)
        data["vibration_y_g"] = round(data["vibration_y_g"] + 1.5 * intensity, 1)
        data["vibration_z_g"] = round(data["vibration_z_g"] + 2.0 * intensity, 1)

    return data


def generate_vibration() -> dict:
    """Vibration scenario — periodic spikes >1.5g throughout."""
    rng = np.random.default_rng(seed=200)
    points = []
    for i in range(TOTAL_POINTS):
        t = i * DT
        if t < TAKEOFF_END:
            data = _takeoff(t, rng, battery_drain=0.1, vib_scale=1.2)
        elif t < CRUISE_END:
            data = _vibration_cruise(t, rng)
        else:
            data = _vibration_landing(t, rng)
        points.append({"timestamp_ms": int(t * 1000), "sim_time_s": round(t, 2), **data})

    return {
        "metadata": {
            "mission_name": "square_50m_vibration",
            "sample_rate_hz": SAMPLE_RATE_HZ,
            "total_points": TOTAL_POINTS,
            "duration_s": DURATION_S,
            "failure_start_s": 0,
            "failure_end_s": 0,
            "airframe": "DJI Agras T50",
            "home_location": {"latitude": 47.397742, "longitude": 8.545594, "name": "Zurich/ETH"},
        },
        "points": points,
    }


# ---------------------------------------------------------------------------
# Scenario: Battery Degradation
# ---------------------------------------------------------------------------

def _battery_cruise(t: float, rng: np.random.Generator) -> dict:
    """Cruise with aggressive battery drain."""
    phase_time = t - TAKEOFF_END
    phase_progress = phase_time / (CRUISE_END - TAKEOFF_END)

    data = _cruise(t, rng, battery_start=100.0, battery_drain_rate=12.0, vib_scale=0.9)

    # As battery drops, motors struggle — slight PWM asymmetry
    if phase_progress > 0.5:
        struggle = (phase_progress - 0.5) * 2.0
        data["pwm1_us"] = int(data["pwm1_us"] + 30 * struggle)
        data["pwm3_us"] = int(data["pwm3_us"] - 20 * struggle)
        data["cooper_harper"] = int(2 + 3 * struggle)

    return data


def _battery_emergency_landing(t: float, rng: np.random.Generator) -> dict:
    """Emergency landing due to low battery (60-80s)."""
    phase_time = t - CRUISE_END
    phase_progress = phase_time / (DURATION_S - CRUISE_END)

    # Rapid descent — battery nearly depleted
    altitude = 10.0 * (1 - phase_progress ** 0.7) + rng.normal(0, 0.2)
    altitude = max(0.0, altitude)
    acceleration = 5.0 - 3.0 * phase_progress + rng.normal(0, 0.8)
    acceleration = max(1.0, acceleration)
    battery = 28.0 - 25.0 * phase_progress  # Drops from ~28% to ~3%
    battery = max(0.5, battery)

    # Motors weakening — PWM dropping
    pwm_base = 1300 - 300 * phase_progress
    pwm1 = pwm_base + rng.normal(0, 15)
    pwm2 = pwm_base + rng.normal(0, 15)
    pwm3 = pwm_base - 30 + rng.normal(0, 15)
    pwm4 = pwm_base + rng.normal(0, 15)

    # Increasing instability as battery dies
    instability = phase_progress
    roll = 5.0 * instability * math.sin(2 * math.pi * phase_time / 3.0) + rng.normal(0, 2.0)
    pitch = 4.0 * instability * math.cos(2 * math.pi * phase_time / 2.5) + rng.normal(0, 2.0)
    yaw = 3.0 * instability * math.sin(2 * math.pi * phase_time / 4.0) + rng.normal(0, 1.5)
    ang_roll = rng.normal(0, 4.0 * instability)
    ang_pitch = rng.normal(0, 3.0 * instability)
    ang_yaw = rng.normal(0, 2.5 * instability)

    vib_x = rng.normal(0, 0.3 + 0.3 * instability)
    vib_y = rng.normal(0, 0.3 + 0.2 * instability)
    vib_z = 0.8 + 0.4 * instability + rng.normal(0, 0.15)

    cooper = int(4 + 4 * phase_progress)

    return {
        "roll_deg": round(roll, 1), "pitch_deg": round(pitch, 1),
        "yaw_deg": round(yaw, 1),
        "angular_rate_roll_dps": round(ang_roll, 1),
        "angular_rate_pitch_dps": round(ang_pitch, 1),
        "angular_rate_yaw_dps": round(ang_yaw, 1),
        "altitude_m": round(altitude, 1),
        "acceleration_m_s2": round(acceleration, 1),
        "battery_pct": round(battery, 1),
        "pwm1_us": int(pwm1), "pwm2_us": int(pwm2),
        "pwm3_us": int(pwm3), "pwm4_us": int(pwm4),
        "vibration_x_g": round(vib_x, 1),
        "vibration_y_g": round(vib_y, 1),
        "vibration_z_g": round(vib_z, 1),
        "cooper_harper": min(10, cooper),
    }


def generate_battery() -> dict:
    """Battery degradation scenario — voltage drops, forced landing."""
    rng = np.random.default_rng(seed=300)
    points = []
    for i in range(TOTAL_POINTS):
        t = i * DT
        if t < TAKEOFF_END:
            data = _takeoff(t, rng, battery_drain=0.5, vib_scale=0.9)
        elif t < CRUISE_END:
            data = _battery_cruise(t, rng)
        else:
            data = _battery_emergency_landing(t, rng)
        points.append({"timestamp_ms": int(t * 1000), "sim_time_s": round(t, 2), **data})

    return {
        "metadata": {
            "mission_name": "square_50m_battery_degradation",
            "sample_rate_hz": SAMPLE_RATE_HZ,
            "total_points": TOTAL_POINTS,
            "duration_s": DURATION_S,
            "failure_start_s": CRUISE_END,
            "failure_end_s": DURATION_S,
            "airframe": "DJI Agras T50",
            "home_location": {"latitude": 47.397742, "longitude": 8.545594, "name": "Zurich/ETH"},
        },
        "points": points,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

SCENARIOS = {
    "flight-telemetry": generate_motor_failure,
    "flight-telemetry-normal": generate_normal,
    "flight-telemetry-vibration": generate_vibration,
    "flight-telemetry-battery": generate_battery,
}


def main() -> int:
    """Generate all scenario files."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    all_ok = True

    for name, gen_fn in SCENARIOS.items():
        print(f"Generating {TOTAL_POINTS} points at {SAMPLE_RATE_HZ}Hz → {name}.json ...")
        telemetry = gen_fn()
        path = DATA_DIR / f"{name}.json"

        with open(path, "w") as f:
            json.dump(telemetry, f, separators=(",", ":"))

        file_size = path.stat().st_size
        print(f"  ✓ {path.name}  ({file_size / 1024:.1f} KB)")

        if file_size > 100 * 1024:
            print("  ⚠ Warning: exceeds 100KB limit!")
            all_ok = False

    if all_ok:
        print("\n✓ All scenarios generated successfully")
    else:
        print("\n⚠ Some files exceeded size limit")
    return 0 if all_ok else 1


if __name__ == "__main__":
    exit(main())
