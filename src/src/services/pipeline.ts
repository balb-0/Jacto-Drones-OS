// Servico de status do pipeline (TG5 — secao "status do pipeline").
//
// Le o SNAPSHOT versionado src/data/pipeline-snapshot.json (derivado de
// evidence/raw/*.json — API GitLab projeto 10705). O token JAMAIS chega ao
// browser: o snapshot bruto e coletado no CI (scripts/collect_gitlab_metrics.py)
// e comitado; aqui so importamos o JSON (resolveJsonModule). Em producao, o
// ultimo run viria via rota de API com proxy autenticado dos artefatos do
// GitLab. A contagem de anomalias e derivada do contrato TG2 (anomalies.json),
// mantendo um unico ponto de verdade para o numero exibido.

import pipelineSnapshotRaw from '@/data/pipeline-snapshot.json';
import anomaliesRaw from '@/data/anomalies.json';
import type { PipelineSnapshot } from '@/types/pipeline';

const pipelineSnapshot = pipelineSnapshotRaw as PipelineSnapshot;

/** Contagem de anomalias do contrato TG2 (fonte unica: anomalies.json). */
function anomalyCountFromContract(): number {
  const list = (anomaliesRaw as { anomalies?: unknown[] }).anomalies;
  return Array.isArray(list) ? list.length : 0;
}

/**
 * Retorna o snapshot de status do pipeline, com a contagem de anomalias
 * reconciliada com o contrato TG2 (anomalies.json) em vez do numero estatico
 * do snapshot — evita divergencia entre as duas fontes.
 */
export function getPipelineSnapshot(): PipelineSnapshot {
  return {
    ...pipelineSnapshot,
    anomalies: {
      ...pipelineSnapshot.anomalies,
      count: anomalyCountFromContract(),
    },
  };
}

/** Versao assincrona para uniformizar com os demais servicos do dashboard. */
export async function fetchPipelineSnapshot(): Promise<PipelineSnapshot> {
  return getPipelineSnapshot();
}
