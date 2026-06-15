import type { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  refreshInterval: 30000,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Base do repositorio GitLab do G04 — usada para montar links de auditoria
// (pipeline/MR/tag/job) por numero na UI. Rastreabilidade: cada indicador de
// snapshot aponta de volta para a evidencia no GitLab.
export const GITLAB_BASE_URL =
  'https://git.inteli.edu.br/graduacao/2026-1b/t13/g04';

/** Link direto para um pipeline por id. */
export function gitlabPipelineUrl(id: number | string): string {
  return `${GITLAB_BASE_URL}/-/pipelines/${id}`;
}

/** Link direto para um merge request por IID. */
export function gitlabMergeRequestUrl(iid: number | string): string {
  return `${GITLAB_BASE_URL}/-/merge_requests/${iid}`;
}

/** Link direto para uma tag/release por nome. */
export function gitlabTagUrl(tag: string): string {
  return `${GITLAB_BASE_URL}/-/tags/${tag}`;
}

export const TIME_RANGES = {
  '24h': { label: 'Últimas 24 horas', days: 1 },
  '7d': { label: 'Últimos 7 dias', days: 7 },
  '30d': { label: 'Últimos 30 dias', days: 30 },
  '90d': { label: 'Últimos 90 dias', days: 90 },
} as const;

export const DORA_LEVELS = {
  elite: { color: 'success', label: 'Elite' },
  high: { color: 'info', label: 'Alto' },
  medium: { color: 'warning', label: 'Médio' },
  low: { color: 'error', label: 'Baixo' },
} as const;