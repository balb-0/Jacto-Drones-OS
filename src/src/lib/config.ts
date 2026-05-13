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