"""CLI: avalia os quality gates contra coverage.xml, metrics.json e SAST.

Port do `tools/quality_gates.py` do demo (GitHub Actions) adaptado às chaves do
NOSSO `quality_gates.yaml` (TG6.1) e às restrições da instância GitLab:

- coverage  → lê `line-rate` do coverage.xml (formato Cobertura) e compara com
  `coverage.min_line_coverage` (actual >= threshold).
- mission   → lê reports/metrics.json e compara cada campo com o threshold
  versionado (regra: actual <= threshold):
      mission_metrics.max_acceleration_m_s2     → campo max_acceleration_m_s2
      mission_metrics.max_mission_duration_s    → campo mission_duration_s
      mission_metrics.max_std_altitude_cruise_m → campo std_altitude_cruise_m
- SAST      → no demo era consulta à API do Sonar; aqui usamos a chave
  `sast.require_passed`. `false` ⇒ gate "skipped" (passa); `true` ⇒ exige um
  relatório SAST (leitura preparada via --sast-report, mas hoje é skip — o
  runner sonar-00 entra na Sprint 4 / TG5).
- anomalies → (TG2) lê anomalies.json (job ci/anomaly.yml, regras portadas do
  dashboard) e REPROVA se houver anomalia CRITICAL. Só entra se --anomalies for
  informado; WARNING é informativo (não trava).

Saída: exit code 0 se todos os gates passam, != 0 se qualquer um falha.
Imprime relatório em markdown (reaproveitado no comentário do MR — TG6.4) e,
opcionalmente, grava o resultado estruturado em JSON (--output).

Uso:
    python scripts/quality_gates.py \\
        --gates quality_gates.yaml \\
        --metrics reports/metrics.json \\
        --coverage coverage.xml \\
        [--sast-report reports/sast.json] \\
        [--anomalies anomalies.json] \\
        [--output reports/quality_gates_result.json]

NÃO usa needs: no CI — herda coverage.xml + reports/metrics.json dos stages
anteriores por ordem de stage (evita DAG-bypass). Vide ci/quality-gates.yml.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass, field
from pathlib import Path

import yaml

LOG = logging.getLogger("quality_gates")


@dataclass
class GateResult:
    name: str
    passed: bool
    actual: float | str | None
    threshold: float | str | None
    message: str


@dataclass
class GatesReport:
    all_passed: bool
    results: list[GateResult] = field(default_factory=list)
    summary: str = ""


# --------------------------------------------------------------------------- #
# Coverage gate — line-rate do coverage.xml (Cobertura)
# --------------------------------------------------------------------------- #


def _parse_coverage_xml(path: Path) -> float:
    """Lê coverage.xml (formato Cobertura) e retorna line-rate (0.0-1.0)."""
    tree = ET.parse(path)
    root = tree.getroot()
    line_rate = root.attrib.get("line-rate")
    if line_rate is None:
        raise ValueError(f"coverage.xml sem atributo line-rate: {path}")
    return float(line_rate)


def check_coverage(coverage_xml: Path, threshold: float) -> GateResult:
    if not coverage_xml.is_file():
        return GateResult(
            name="coverage.min_line_coverage",
            passed=False,
            actual=None,
            threshold=threshold,
            message=f"coverage.xml não encontrado: {coverage_xml}",
        )
    try:
        actual = _parse_coverage_xml(coverage_xml)
    except (ET.ParseError, ValueError) as exc:
        return GateResult(
            name="coverage.min_line_coverage",
            passed=False,
            actual=None,
            threshold=threshold,
            message=f"coverage.xml inválido: {exc}",
        )
    passed = actual >= threshold
    return GateResult(
        name="coverage.min_line_coverage",
        passed=passed,
        actual=round(actual, 4),
        threshold=threshold,
        message=f"line coverage {actual:.2%} {'≥' if passed else '<'} threshold {threshold:.0%}",
    )


# --------------------------------------------------------------------------- #
# Mission metrics gates — actual <= threshold
# --------------------------------------------------------------------------- #

# (chave do threshold em quality_gates.yaml, campo correspondente em metrics.json)
_METRIC_RULES = [
    ("max_acceleration_m_s2", "max_acceleration_m_s2"),
    ("max_mission_duration_s", "mission_duration_s"),
    ("max_std_altitude_cruise_m", "std_altitude_cruise_m"),
]


def check_mission_metrics(metrics_json: Path, gates: dict[str, float]) -> list[GateResult]:
    if not metrics_json.is_file():
        return [
            GateResult(
                name="mission_metrics",
                passed=False,
                actual=None,
                threshold=None,
                message=f"metrics.json não encontrado: {metrics_json}",
            )
        ]
    try:
        metrics = json.loads(metrics_json.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        return [
            GateResult(
                name="mission_metrics",
                passed=False,
                actual=None,
                threshold=None,
                message=f"metrics.json inválido: {exc}",
            )
        ]

    results: list[GateResult] = []
    for threshold_key, metric_key in _METRIC_RULES:
        threshold = gates.get(threshold_key)
        if threshold is None:
            continue
        gate_name = f"mission_metrics.{threshold_key}"
        actual = metrics.get(metric_key)
        if actual is None:
            results.append(
                GateResult(
                    name=gate_name,
                    passed=False,
                    actual=None,
                    threshold=threshold,
                    message=f"métrica '{metric_key}' ausente em metrics.json",
                )
            )
            continue
        passed = float(actual) <= float(threshold)
        results.append(
            GateResult(
                name=gate_name,
                passed=passed,
                actual=actual,
                threshold=threshold,
                message=f"{metric_key} = {actual} {'≤' if passed else '>'} threshold {threshold}",
            )
        )
    return results


# --------------------------------------------------------------------------- #
# Anomaly gate — reprova se houver anomalia CRITICAL em anomalies.json (TG2)
# --------------------------------------------------------------------------- #


def check_anomalies(anomalies_json: Path) -> GateResult:
    """Gate de anomalias: reprova (passed=False) se houver CRITICAL.

    Lê anomalies.json (lista produzida por scripts/detect_anomalies.py — TG2,
    job ci/anomaly.yml). Cada item tem `severity` em {'CRITICAL','WARNING'}.
    Regra: WARNING é informativo (não trava); CRITICAL bloqueia o merge.

    Fail-closed: arquivo ausente/inválido reprova o gate (como coverage/metrics)
    — anomalies.json é entrada obrigatória do gate, não pode sumir em silêncio.
    """
    if not anomalies_json.is_file():
        return GateResult(
            name="anomalies.no_critical",
            passed=False,
            actual=None,
            threshold=0,
            message=f"anomalies.json não encontrado: {anomalies_json}",
        )
    try:
        anomalies = json.loads(anomalies_json.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        return GateResult(
            name="anomalies.no_critical",
            passed=False,
            actual=None,
            threshold=0,
            message=f"anomalies.json inválido: {exc}",
        )
    n_critical = sum(1 for a in anomalies if a.get("severity") == "CRITICAL")
    n_warning = sum(1 for a in anomalies if a.get("severity") == "WARNING")
    passed = n_critical == 0
    return GateResult(
        name="anomalies.no_critical",
        passed=passed,
        actual=n_critical,
        threshold=0,
        message=(
            f"{n_critical} anomalia(s) CRITICAL (+{n_warning} WARNING informativa) "
            f"{'≤' if passed else '>'} threshold 0"
        ),
    )


# --------------------------------------------------------------------------- #
# SAST gate — chave sast.require_passed (Sonar entra na Sprint 4 / TG5)
# --------------------------------------------------------------------------- #


def check_sast(require_passed: bool, sast_report: Path | None) -> GateResult:
    """Gate de SAST.

    `require_passed=false` (default da fundação) ⇒ "skipped" (passa). Quando
    a chave virar true (TG5, runner sonar-00 amarrado), exige um relatório SAST
    em --sast-report; a leitura já fica preparada, mas hoje o caminho quente é
    o skip — espelha o `check_sonar(require=False)` do demo.
    """
    if not require_passed:
        return GateResult(
            name="sast.require_passed",
            passed=True,
            actual="skipped",
            threshold="not required",
            message="SAST informativo (require_passed=false) — habilita na TG5/Sprint 4",
        )
    if sast_report is None or not sast_report.is_file():
        return GateResult(
            name="sast.require_passed",
            passed=False,
            actual=None,
            threshold="passed",
            message="relatório SAST exigido (require_passed=true) mas ausente",
        )
    try:
        data = json.loads(sast_report.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        return GateResult(
            name="sast.require_passed",
            passed=False,
            actual=None,
            threshold="passed",
            message=f"relatório SAST inválido: {exc}",
        )
    status = str(data.get("status", "UNKNOWN"))
    passed = status.upper() in {"OK", "PASSED", "SUCCESS"}
    return GateResult(
        name="sast.require_passed",
        passed=passed,
        actual=status,
        threshold="passed",
        message=f"status do SAST = {status}",
    )


# --------------------------------------------------------------------------- #
# Orquestração
# --------------------------------------------------------------------------- #


def evaluate(
    gates_yaml: Path,
    metrics_json: Path,
    coverage_xml: Path,
    sast_report: Path | None = None,
    anomalies_json: Path | None = None,
) -> GatesReport:
    config = yaml.safe_load(gates_yaml.read_text())
    results: list[GateResult] = []

    cov_threshold = config.get("coverage", {}).get("min_line_coverage")
    if cov_threshold is not None:
        results.append(check_coverage(coverage_xml, cov_threshold))

    metrics_config = config.get("mission_metrics", {})
    if metrics_config:
        results.extend(check_mission_metrics(metrics_json, metrics_config))

    # Gate de anomalias (TG2): só entra quando --anomalies é informado. Reprova
    # se houver anomalia CRITICAL no anomalies.json (job ci/anomaly.yml).
    if anomalies_json is not None:
        results.append(check_anomalies(anomalies_json))

    sast_config = config.get("sast", {})
    results.append(
        check_sast(
            require_passed=bool(sast_config.get("require_passed", False)),
            sast_report=sast_report,
        )
    )

    all_passed = all(r.passed for r in results)
    passed_count = sum(1 for r in results if r.passed)
    summary = f"{passed_count}/{len(results)} gates passaram"
    return GatesReport(all_passed=all_passed, results=results, summary=summary)


def _format_report(report: GatesReport) -> str:
    """Markdown legível pro log do CI (e reaproveitado no comentário do MR)."""
    lines = [f"## Quality Gates: {report.summary}", ""]
    for r in report.results:
        emoji = "✅" if r.passed else "❌"
        lines.append(f"- {emoji} **{r.name}** — {r.message}")
    lines.append("")
    lines.append("**TODOS OS GATES PASSARAM** ✅" if report.all_passed else "**GATES FALHARAM** ❌")
    return "\n".join(lines)


def main() -> None:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s %(message)s"
    )
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--gates", required=True, type=Path)
    p.add_argument("--metrics", required=True, type=Path)
    p.add_argument("--coverage", required=True, type=Path)
    p.add_argument("--sast-report", type=Path, help="relatório SAST (usado se require_passed=true)")
    p.add_argument("--anomalies", type=Path, help="anomalies.json (TG2); reprova se houver CRITICAL")
    p.add_argument("--output", type=Path, help="path pra JSON estruturado opcional")
    args = p.parse_args()

    report = evaluate(
        args.gates, args.metrics, args.coverage, args.sast_report, args.anomalies
    )

    print(_format_report(report))

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(
            json.dumps(
                {
                    "all_passed": report.all_passed,
                    "summary": report.summary,
                    "results": [asdict(r) for r in report.results],
                },
                indent=2,
                sort_keys=True,
            )
            + "\n"
        )

    sys.exit(0 if report.all_passed else 1)


if __name__ == "__main__":
    main()
