// Serviço de indicadores de PROCESSO reais (QoP).
//
// Lê o snapshot estático src/data/process-metrics.json — gerado por
// scripts/collect_gitlab_metrics.py a partir da API GitLab (projeto 10705).
// O token de API JAMAIS chega ao browser: o coletor roda no CI e comita só
// números agregados. Aqui apenas importamos o JSON (resolveJsonModule).

import processMetricsRaw from '@/data/process-metrics.json';
import doraRaw from '@/data/dora.json';
import type { ProcessMetrics, DoraMetricsReal } from '@/types/metrics';

const processMetrics = processMetricsRaw as ProcessMetrics;
const doraMetrics = doraRaw as DoraMetricsReal;

/** Retorna o snapshot de indicadores de processo coletado da API GitLab. */
export function getProcessMetrics(): ProcessMetrics {
  return processMetrics;
}

/** Versão assíncrona para uniformizar com os demais serviços do dashboard. */
export async function fetchProcessMetrics(): Promise<ProcessMetrics> {
  return processMetrics;
}

/** Retorna o DORA medido, derivado do snapshot real (src/data/dora.json). */
export function getDoraMetrics(): DoraMetricsReal {
  return doraMetrics;
}

/** Versão assíncrona do DORA medido. */
export async function fetchDoraMetrics(): Promise<DoraMetricsReal> {
  return doraMetrics;
}
