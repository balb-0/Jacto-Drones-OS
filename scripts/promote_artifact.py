"""CLI: promove um artefato imutável (por SHA) entre ambientes — SEM rebuild.

Conceito central do CD imutável (Aula 07 + ADR-004 do demo): o artefato que
passou em `dev` é exatamente o mesmo que vai para `staging` e `prod`. Promoção
é "re-apontar", nunca recompilar.

Adaptação ao nosso GitLab (ADR-0006): a instância CE não tem Container Registry
(`CI_REGISTRY` vazio), então o artefato imutável é o **artefato de CI por
`$CI_COMMIT_SHA`** (metrics.json + binário SITL), e a promoção é registrada como
um manifesto de deploy por ambiente. O alvo real (k8s/OpenChoreo) é simulado —
mesma decisão do ADR-002 do demo ("OpenChoreo simulado").

O ambiente `canary` (ADR-0012) é o PRIMEIRO destino do rollout: promove o
artefato a um subconjunto da frota (o cliente de referência `jacto_ref`) ANTES de
staging/prod. O health-check fail-closed (scripts/canary_healthcheck.py) decide se
o rollout avança — se o canário adoece, o stage `deploy` não roda (auto-rollback).
Grava o mesmo manifesto de deploy simulado, em reports/deploy-canary.json.

Uso:
    python scripts/promote_artifact.py --env canary --sha "$CI_COMMIT_SHA"
    python scripts/promote_artifact.py --env staging --sha "$CI_COMMIT_SHA"
    python scripts/promote_artifact.py --env prod --sha "$SHA" [--rollback]
    python scripts/promote_artifact.py --env release --sha "$SHA" --tag v0.3.0
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path


def build_record(env: str, sha: str, tag: str | None, rollback: bool) -> dict:
    record = {
        "environment": env,
        "artifact_sha": sha,
        "artifact_ref": f"ci-artifact@{sha[:12]}",  # mesmo artefato, sem rebuild
        "tag": tag,
        "rollback": rollback,
        "pipeline_id": os.getenv("CI_PIPELINE_ID", "local"),
        "project": os.getenv("CI_PROJECT_PATH", "graduacao/2026-1b/t13/g04"),
        "deploy_kind": "simulado",
        "note": (
            "Deploy simulado (ADR-0006): instância sem Container Registry; "
            "artefato imutável = artefato de CI por SHA, promovido sem rebuild."
        ),
    }
    # Canário (ADR-0012): registra o SUBCONJUNTO do rollout (cliente de
    # referência jacto_ref) — só no manifesto canary, p/ não alterar os manifestos
    # staging/prod/release existentes.
    if env == "canary":
        record["rollout_subset"] = os.getenv("CANARY_SUBSET", "jacto_ref")
        record["note"] = (
            "Canary deploy simulado (ADR-0012): promove o artefato imutável por "
            "SHA a um subconjunto da frota (jacto_ref) ANTES de staging/prod; o "
            "health-check fail-closed decide se o rollout avança."
        )
    return record


def promote(env: str, sha: str, tag: str | None, rollback: bool) -> int:
    if not sha:
        print("erro: --sha obrigatório", file=sys.stderr)
        return 2
    record = build_record(env, sha, tag, rollback)
    name = f"release-{tag}" if env == "release" and tag else f"deploy-{env}"
    out = Path("reports") / f"{name}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(record, indent=2, sort_keys=True) + "\n")
    verbo = "ROLLBACK" if rollback else "promove"
    print(f"[promote_artifact] {verbo} {env} <- artefato sha={sha[:8]} (sem rebuild)")
    print(json.dumps(record, indent=2, ensure_ascii=False))
    return 0


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--env", required=True, choices=["canary", "staging", "prod", "release"])
    p.add_argument("--sha", default="")  # validado em promote() (testável sem argparse)
    p.add_argument("--tag", default=None)
    p.add_argument("--rollback", action="store_true")
    args = p.parse_args()
    sys.exit(promote(args.env, args.sha, args.tag, args.rollback))


if __name__ == "__main__":
    main()
