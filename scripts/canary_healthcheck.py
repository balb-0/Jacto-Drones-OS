"""CLI: health-check FAIL-CLOSED do canário (auto-rollback do rollout — TG-C1).

Fecha a lacuna apontada pelo avaliador ("Serviços de Deploy 3,0/4,0: deploy
simples, lacuna entre deploy descrito e comprovado") e atende o pedido do
parceiro ("canary deploy faz sentido na frota Jacto"): em vez de promover o
artefato direto a staging/prod, a esteira primeiro promove a um CANÁRIO
(subconjunto = cliente de referência `jacto_ref`) e SÓ AVANÇA se o canário
estiver comprovadamente saudável.

Posição na esteira (ci/deploy.yml + .gitlab-ci.yml): stage `canary` ENTRE `gate`
e `deploy`. `deploy_canary` promove o artefato ao canário; ESTE health-check roda
em seguida (`canary_healthcheck`). Se o canário está DOENTE, sai com código != 0
→ pipeline vermelho → os jobs do stage `deploy` (staging/prod) NÃO rodam = o
rollout é interrompido (rollback automático: a promoção a staging/prod nunca
acontece). É o mesmo princípio fail-closed do gate de anomalias (ADR-0009),
agora aplicado à PROMOÇÃO (ADR-0012).

Saúde do canário (reusa os MESMOS limiares/lógica do gate — quality_gates.py +
quality_gates.yaml, ADR-0005, para NÃO divergir do que já reprova o merge):
  - 0 anomalia CRITICAL em reports/anomalies.json (contrato {_meta, anomalies},
    via quality_gates.check_anomalies — WARNING é informativo, não derruba);
  - invariantes-chave da missão dentro do gate em reports/metrics.json
    (max_acceleration_m_s2 / mission_duration_s / std_altitude_cruise_m <=
    threshold de mission_metrics, via quality_gates.check_mission_metrics).

CRÍTICO (TG-C1): no baseline REAL `jacto_ref`/`square_50m` (accel 11.01 < 15,
dur 78.83 < 180, std 0.688 < 1.0, 0 anomalias) o canário é SAUDÁVEL → exit 0
(verde). O fail-closed só dispara num canário GENUINAMENTE ruim (anomalia
CRITICAL ou KPI fora do envelope), NUNCA no baseline bom — senão a esteira
nunca promoveria nada.

Espelha quality_gates.py/detect_anomalies.py: núcleo PURO (`evaluate_canary`,
sem I/O sobre rede) + CLI. exit 0 se saudável, 1 se doente.

Uso:
    python scripts/canary_healthcheck.py \\
        --gates quality_gates.yaml \\
        --metrics reports/metrics.json \\
        --anomalies reports/anomalies.json \\
        [--canary jacto_ref] \\
        [--output reports/canary-health.json]
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

import yaml

# O job de CI roda 'python scripts/canary_healthcheck.py' SEM PYTHONPATH=., então
# sys.path[0] é scripts/ (não a raiz) e 'import scripts.*' falha (ModuleNotFoundError).
# Garante a raiz do repo no path — no-op sob pytest, que já roda com PYTHONPATH=.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Reusa os checks JÁ versionados do gate (não reimplementa limiar nenhum): o
# canário é avaliado pela MESMA régua que reprova o merge — par contratual com
# ADR-0005/ADR-0009. Mudar o limiar no quality_gates.yaml move o gate E o canário
# juntos, sem janela de divergência.
from scripts.quality_gates import (  # noqa: E402
    GateResult,
    check_anomalies,
    check_mission_metrics,
)

LOG = logging.getLogger("canary_healthcheck")

# Subconjunto do rollout que recebe o canário. Na frota Jacto (ADR-0011), o
# cliente de REFERÊNCIA `jacto_ref` roda a missão canônica `square_50m` — é dele
# que saem metrics.json/anomalies.json canônicos, então é o canário natural.
DEFAULT_CANARY = "jacto_ref"


@dataclass
class CanaryHealth:
    """Veredito do canário: healthy + os GateResult que o sustentam (rastro)."""

    healthy: bool
    canary: str
    results: list[GateResult] = field(default_factory=list)
    summary: str = ""


def evaluate_canary(
    gates_yaml: Path,
    metrics_json: Path,
    anomalies_json: Path,
    canary: str = DEFAULT_CANARY,
) -> CanaryHealth:
    """Núcleo PURO: decide se o canário está saudável reusando os checks do gate.

    Canário SAUDÁVEL ⟺ 0 anomalia CRITICAL E todos os invariantes-chave da missão
    dentro do gate. Fail-closed: arquivo ausente/inválido vira GateResult
    `passed=False` (herdado de check_anomalies/check_mission_metrics) → canário
    DOENTE, nunca verde por omissão.
    """
    config = yaml.safe_load(gates_yaml.read_text()) or {}
    results: list[GateResult] = []

    # (1) invariantes-chave da missão no canário (actual <= threshold), MESMA
    # régua do gate (mission_metrics do quality_gates.yaml). Se a seção não
    # existir, check_mission_metrics não roda — mas o canário não pode ficar sem
    # NENHUM critério; isso é coberto pela anomalia abaixo + guard em main().
    metrics_config = config.get("mission_metrics", {})
    if metrics_config:
        results.extend(check_mission_metrics(metrics_json, metrics_config))

    # (2) anomalia CRITICAL no canário derruba o rollout (contrato {_meta,
    # anomalies}; WARNING informativo). check_anomalies é fail-closed por
    # construção (ausente/inválido reprova).
    results.append(check_anomalies(anomalies_json))

    healthy = all(r.passed for r in results)
    passed_count = sum(1 for r in results if r.passed)
    summary = (
        f"canário '{canary}': {passed_count}/{len(results)} verificações de saúde"
        f" {'OK' if healthy else 'FALHARAM'}"
    )
    return CanaryHealth(healthy=healthy, canary=canary, results=results, summary=summary)


def _format_report(health: CanaryHealth) -> str:
    """Markdown legível pro log do CI (mesmo estilo de quality_gates._format_report)."""
    estado = "SAUDÁVEL" if health.healthy else "DOENTE"
    lines = [f"## Canary health-check ({health.summary})", ""]
    for r in health.results:
        emoji = "✅" if r.passed else "❌"
        lines.append(f"- {emoji} **{r.name}** — {r.message}")
    lines.append("")
    if health.healthy:
        lines.append(
            f"**CANÁRIO {estado}** ✅ — libera a promoção ao stage `deploy` "
            "(staging/prod)."
        )
    else:
        lines.append(
            f"**CANÁRIO {estado}** ❌ — FAIL-CLOSED: pipeline vermelho, jobs de "
            "`deploy` NÃO rodam (rollback automático do rollout)."
        )
    return "\n".join(lines)


def main() -> None:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s %(message)s"
    )
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--gates", required=True, type=Path)
    p.add_argument("--metrics", required=True, type=Path)
    p.add_argument(
        "--anomalies",
        required=True,
        type=Path,
        help="anomalies.json (contrato {_meta, anomalies}); CRITICAL derruba o canário",
    )
    p.add_argument(
        "--canary",
        default=DEFAULT_CANARY,
        help=f"subconjunto/cliente do canário (default {DEFAULT_CANARY})",
    )
    p.add_argument("--output", type=Path, help="path pra JSON estruturado opcional (rastro)")
    args = p.parse_args()

    health = evaluate_canary(args.gates, args.metrics, args.anomalies, args.canary)

    # Guard anti-falso-verde: se NENHUMA verificação rodou (config vazia/sem
    # mission_metrics E sem anomalia), não declaramos o canário saudável por
    # vácuo — fail-closed. (Na prática check_anomalies sempre adiciona 1 result.)
    if not health.results:
        LOG.error("nenhuma verificação de saúde executada — fail-closed (canário DOENTE)")
        health = CanaryHealth(
            healthy=False,
            canary=args.canary,
            results=[],
            summary=f"canário '{args.canary}': 0 verificações — fail-closed",
        )

    print(_format_report(health))

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(
            json.dumps(
                {
                    "healthy": health.healthy,
                    "canary": health.canary,
                    "summary": health.summary,
                    "results": [asdict(r) for r in health.results],
                },
                indent=2,
                sort_keys=True,
            )
            + "\n"
        )

    # exit 0 = canário saudável (segue pro deploy); 1 = doente (fail-closed →
    # pipeline vermelho → stage deploy não roda = auto-rollback do rollout).
    sys.exit(0 if health.healthy else 1)


if __name__ == "__main__":
    main()
