"""Unit tests do carregamento de missão (YAML → Mission, com NED→lat/lon)."""

from pathlib import Path

from libs.drone_modeling.mission import Waypoint, load_mission

MISSION_YAML = Path(__file__).resolve().parents[2] / "missions" / "square_50m.yaml"


def test_load_square_50m_basico():
    m = load_mission(MISSION_YAML)
    assert m.name == "square_50m"
    assert m.takeoff_altitude_m == 10.0
    assert m.max_duration_s == 180
    # takeoff + 4 waypoints + rtl
    assert len(m.waypoints) == 6, f"esperava 6 waypoints, veio {len(m.waypoints)}"


def test_primeiro_e_ultimo_waypoint():
    m = load_mission(MISSION_YAML)
    assert m.waypoints[0].type == "takeoff", "primeiro waypoint deveria ser takeoff"
    assert m.waypoints[-1].type == "rtl", "último waypoint deveria ser rtl"


def test_waypoint_ned_vira_latlon():
    m = load_mission(MISSION_YAML)
    wp_north = next(w for w in m.waypoints if w.name == "wp1_north")  # north_m=50
    assert isinstance(wp_north, Waypoint)
    assert wp_north.lat is not None and wp_north.lat > m.home_lat, (
        "waypoint ao norte (north_m=50) deveria ter latitude > home"
    )
    assert wp_north.alt_m == 10.0
