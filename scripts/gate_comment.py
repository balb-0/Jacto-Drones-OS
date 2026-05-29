"""Helper de formatação do comentário de quality gates no MR (TG6.4.2).

Lê o resultado estruturado do avaliador (reports/quality_gates_result.json,
produzido por scripts/quality_gates.py --output) e renderiza o markdown do
comentário do MR: cabeçalho "X/Y gates" + uma linha ✅/❌ por gate com
actual × threshold.

Separado do avaliador de propósito: a régua (quality_gates.py) decide pass/fail
e fica testável sem se misturar com a apresentação; este helper só formata, e o
job de MR (ci/quality-gates.yml) o consome para postar a nota.

Uso:
    python scripts/gate_comment.py --result reports/quality_gates_result.json
    # imprime markdown em stdout (redirecionado pro corpo da nota do MR)
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def _fmt(value: Any) -> str:
    """Formata actual/threshold para a tabela (None vira '—')."""
    if value is None:
        return "—"
    return str(value)


def render_comment(report: dict[str, Any]) -> str:
    """Renderiza o markdown do comentário a partir do dict do resultado.

    Espera as chaves do scripts/quality_gates.py: all_passed (bool),
    summary (str, ex.: "5/5 gates passaram") e results (lista de dicts com
    name/passed/actual/threshold/message).
    """
    results = report.get("results", [])
    passed_count = sum(1 for r in results if r.get("passed"))
    total = len(results)
    all_passed = bool(report.get("all_passed", passed_count == total and total > 0))

    header_emoji = "✅" if all_passed else "❌"
    lines = [
        f"## {header_emoji} Quality Gates — {passed_count}/{total} gates",
        "",
        "| | Gate | Atual | Threshold |",
        "|---|---|---|---|",
    ]
    for r in results:
        emoji = "✅" if r.get("passed") else "❌"
        name = r.get("name", "?")
        lines.append(
            f"| {emoji} | `{name}` | {_fmt(r.get('actual'))} | {_fmt(r.get('threshold'))} |"
        )

    lines.append("")
    if all_passed:
        lines.append("**Todos os gates passaram.** Veredito automático: verde.")
    else:
        falhos = [r.get("name", "?") for r in results if not r.get("passed")]
        lines.append(f"**Gates reprovados:** {', '.join(falhos)}. Pipeline bloqueado.")
    lines.append("")
    lines.append("_Comentário informativo (TG6.4). O bloqueio é do job `quality-gates`._")
    return "\n".join(lines)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--result", required=True, type=Path, help="JSON do avaliador (--output)")
    args = p.parse_args()

    if not args.result.is_file():
        print(f"_resultado de quality gates não encontrado: {args.result}_")
        sys.exit(0)

    report = json.loads(args.result.read_text())
    print(render_comment(report))


if __name__ == "__main__":
    main()
