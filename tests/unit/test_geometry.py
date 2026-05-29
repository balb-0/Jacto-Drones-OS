"""Unit tests da geometria (funções puras lat/lon ↔ NED, RMS de trajetória)."""

import pytest

from libs.drone_modeling.geometry import (
    haversine_distance,
    lat_lon_to_ned,
    ned_to_lat_lon,
    trajectory_rms_error,
)


def test_haversine_one_degree_latitude():
    d = haversine_distance(0.0, 0.0, 1.0, 0.0)
    assert abs(d - 111_195) < 2000, f"1° de latitude ~111 km; veio {d:.0f} m"


def test_ned_latlon_roundtrip():
    lat0, lon0 = 47.397742, 8.545594
    lat, lon = ned_to_lat_lon(50.0, 50.0, lat0, lon0)
    n, e = lat_lon_to_ned(lat, lon, lat0, lon0)
    assert abs(n - 50.0) < 1e-6 and abs(e - 50.0) < 1e-6, f"roundtrip NED falhou: n={n}, e={e}"


def test_ned_north_increases_latitude():
    lat0, lon0 = 47.397742, 8.545594
    lat, _ = ned_to_lat_lon(100.0, 0.0, lat0, lon0)
    assert lat > lat0, "deslocamento ao norte deveria aumentar a latitude"


def test_trajectory_rms_zero_when_identical():
    pts = [(0.0, 0.0), (1.0, 1.0), (2.0, 2.0)]
    assert trajectory_rms_error(pts, pts) == 0.0, "RMS de trajetória idêntica deveria ser 0"


def test_trajectory_rms_raises_on_length_mismatch():
    with pytest.raises(ValueError):
        trajectory_rms_error([(0.0, 0.0)], [(0.0, 0.0), (1.0, 1.0)])


def test_trajectory_rms_raises_on_empty():
    with pytest.raises(ValueError):
        trajectory_rms_error([], [])
