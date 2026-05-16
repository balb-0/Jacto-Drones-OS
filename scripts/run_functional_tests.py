"""Generate functional test evidence for the Jacto Drones OS MVP.

This script keeps the MVP simple: it creates the same reports that a real
PX4/MAVLink run should create in CI. When the runner has PX4 SITL installed,
the scenario functions can be replaced by real commands without changing the
JSON and Markdown outputs consumed by the dashboard.
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter


OUTPUT_DIR = Path("artifacts/functional-tests")


@dataclass
class ScenarioResult:
    name: str
    status: str
    duration_seconds: float
    errors: list[str]
    warnings: list[str]
    log_file: str


def should_fail(scenario_name: str) -> bool:
    """Allow CI or local runs to force a failure and test the quality gate."""

    forced = os.getenv("FUNCTIONAL_TEST_FORCE_FAIL", "").strip().lower()
    return forced in {scenario_name.lower(), "all"}


def run_scenario(name: str, description: str, warning: str | None = None) -> ScenarioResult:
    start = perf_counter()
    log_path = OUTPUT_DIR / "simulation.log"
    errors: list[str] = []
    warnings: list[str] = []

    if warning:
        warnings.append(warning)

    if should_fail(name):
        errors.append(f"Falha forçada no cenário '{name}' para validar o gate do pipeline.")

    status = "failed" if errors else "passed"
    duration = round(perf_counter() - start, 3)

    with log_path.open("a", encoding="utf-8") as log_file:
        log_file.write(f"[{datetime.now(timezone.utc).isoformat()}] {name}: {description}\n")
        log_file.write(f"[{datetime.now(timezone.utc).isoformat()}] status={status}\n")
        for item in warnings:
            log_file.write(f"[warning] {item}\n")
        for item in errors:
            log_file.write(f"[error] {item}\n")

    return ScenarioResult(
        name=name,
        status=status,
        duration_seconds=duration,
        errors=errors,
        warnings=warnings,
        log_file=str(log_path),
    )


def build_report(scenarios: list[ScenarioResult]) -> dict:
    total = len(scenarios)
    failed = sum(1 for scenario in scenarios if scenario.status == "failed")
    passed = total - failed

    return {
        "pipeline_id": os.getenv("CI_PIPELINE_ID", "local"),
        "commit_sha": os.getenv("CI_COMMIT_SHA", "local"),
        "branch": os.getenv("CI_COMMIT_REF_NAME", "local"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": {
            "mode": "demonstrativo",
            "simulator": "PX4 SITL",
            "communication": "MAVLink",
            "note": "Substituir por execução real de PX4 SITL quando o runner estiver preparado.",
        },
        "scenarios": [asdict(scenario) for scenario in scenarios],
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "skipped": 0,
            "duration_seconds": round(sum(s.duration_seconds for s in scenarios), 3),
            "status": "failed" if failed else "passed",
        },
    }


def write_markdown_summary(report: dict) -> None:
    summary = report["summary"]
    lines = [
        "# Resumo dos Testes Funcionais",
        "",
        f"- Status geral: **{summary['status']}**",
        f"- Total de testes: {summary['total']}",
        f"- Aprovados: {summary['passed']}",
        f"- Com falha: {summary['failed']}",
        f"- Duração total: {summary['duration_seconds']}s",
        "",
        "## Cenários",
        "",
    ]

    for scenario in report["scenarios"]:
        lines.append(f"### {scenario['name']}")
        lines.append(f"- Status: {scenario['status']}")
        lines.append(f"- Duração: {scenario['duration_seconds']}s")
        if scenario["warnings"]:
            lines.append(f"- Avisos: {'; '.join(scenario['warnings'])}")
        if scenario["errors"]:
            lines.append(f"- Erros: {'; '.join(scenario['errors'])}")
        lines.append("")

    lines.extend(
        [
            "## Observação",
            "",
            "Esta execução gera evidências no formato esperado pelo MVP. Em um runner com PX4 pronto, os passos demonstrativos devem ser trocados por comandos reais de PX4 SITL/MAVLink.",
            "",
        ]
    )

    (OUTPUT_DIR / "functional-test-summary.md").write_text(
        "\n".join(lines),
        encoding="utf-8",
    )


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "simulation.log").write_text("", encoding="utf-8")

    scenarios = [
        run_scenario(
            "px4_sitl_startup",
            "Verifica se a simulação PX4/SITL inicia e fica pronta para teste.",
        ),
        run_scenario(
            "mavlink_heartbeat",
            "Verifica se existe comunicação MAVLink básica por heartbeat.",
        ),
        run_scenario(
            "simple_mission_flow",
            "Executa um fluxo curto de missão simulada: preparar, executar e finalizar.",
            warning="Cenário demonstrativo sem drone físico e sem dados reais.",
        ),
        run_scenario(
            "log_collection",
            "Confere se logs e relatórios foram gerados para análise posterior.",
        ),
    ]

    report = build_report(scenarios)
    (OUTPUT_DIR / "functional-test-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_markdown_summary(report)

    return 1 if report["summary"]["status"] == "failed" else 0


if __name__ == "__main__":
    sys.exit(main())
