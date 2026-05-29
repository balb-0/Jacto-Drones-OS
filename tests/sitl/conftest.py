"""Fixtures dos testes SITL.

Os testes de integração leem o `metrics.json` produzido pela missão SITL real
(rodada uma vez no job, antes do pytest — ver ci/sitl-metrics.yml). Isso evita
re-executar a missão por teste (PX4 SITL não reinicializa entre missões sem
reset completo) e mantém os testes Fast/Repeatable (sem `sleep`, sem MAVSDK).
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def mission_metrics() -> dict:
    """Carrega os KPIs da missão (reports/metrics.json, ou $METRICS_JSON)."""
    path = Path(os.environ.get("METRICS_JSON", "reports/metrics.json"))
    if not path.is_file():
        pytest.skip(f"metrics.json não encontrado em {path} — rode a missão SITL antes")
    return json.loads(path.read_text())
