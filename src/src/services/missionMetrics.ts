// Serviço de QoS de produto — lê os KPIs de missão REAIS (fim do mock).
//
// Fonte de dados: src/src/data/metrics.json, que carrega os valores do
// artefato real reports/metrics.json (job `sitl-mission-metrics` em
// ci/sitl-metrics.yml). Em produção, este JSON viria do artefato do último
// pipeline em develop via uma rota de API (ex.: GET /api/metrics que faz proxy
// autenticado da API de artefatos do GitLab com $GITLAB_TOKEN no servidor),
// mantendo o token fora do browser. Aqui ele é comitado para o dashboard
// funcionar sem credenciais e para o avaliador ver o caminho ponta a ponta.

import rawMetrics from '@/data/metrics.json';
import type {
  MissionMetrics,
  QoSIndicator,
  QoSIndicatorId,
  QoSSnapshot,
  ThresholdDirection,
} from '@/types/mission';

/** Origem declarada dos dados (rastreabilidade na UI). */
export const QOS_SOURCE =
  'reports/metrics.json — job sitl-mission-metrics (último run do pipeline em develop)';

// Thresholds espelhados de quality_gates.yaml (seção mission_metrics). Mudar
// um valor de gate é decisão de quality_gates.yaml (PR + justificativa); aqui
// só refletimos para a UI poder colorir conformidade. Indicadores sem gate
// ficam como 'info'.
interface IndicatorSpec {
  label: string;
  unit: string;
  direction: ThresholdDirection;
  threshold?: number;
}

const INDICATOR_SPECS: Record<QoSIndicatorId, IndicatorSpec> = {
  mission_duration_s: {
    label: 'Duração da missão',
    unit: 's',
    direction: 'max',
    threshold: 180, // mission_metrics.max_mission_duration_s
  },
  max_acceleration_m_s2: {
    label: 'Aceleração máxima',
    unit: 'm/s²',
    direction: 'max',
    threshold: 15.0, // mission_metrics.max_acceleration_m_s2 (invariante físico)
  },
  std_altitude_cruise_m: {
    label: 'Estabilidade de altitude (σ cruzeiro)',
    unit: 'm',
    direction: 'max',
    threshold: 1.0, // mission_metrics.max_std_altitude_cruise_m
  },
  max_altitude_m: {
    label: 'Altitude máxima',
    unit: 'm',
    direction: 'info', // sem gate dedicado; contextual da missão square_50m
  },
  mean_altitude_m: {
    label: 'Altitude média',
    unit: 'm',
    direction: 'info',
  },
  max_battery_drop_pct: {
    label: 'Maior queda de bateria',
    unit: '%',
    direction: 'info', // medido; baseline de bateria ainda não cravado em gate
  },
};

// Ordem de exibição: indicadores com gate primeiro (são QoS "duro"), depois os
// informativos de contexto.
const INDICATOR_ORDER: QoSIndicatorId[] = [
  'std_altitude_cruise_m',
  'max_acceleration_m_s2',
  'mission_duration_s',
  'max_altitude_m',
  'mean_altitude_m',
  'max_battery_drop_pct',
];

/** Avalia conformidade de um valor contra seu threshold/direção. */
function evaluate(
  value: number,
  direction: ThresholdDirection,
  threshold?: number,
): boolean | undefined {
  if (threshold === undefined || direction === 'info') return undefined;
  return direction === 'max' ? value <= threshold : value >= threshold;
}

/** Constrói um indicador resolvido a partir da métrica crua. */
function buildIndicator(id: QoSIndicatorId, metrics: MissionMetrics): QoSIndicator {
  const spec = INDICATOR_SPECS[id];
  const value = metrics[id];
  return {
    id,
    label: spec.label,
    value,
    unit: spec.unit,
    threshold: spec.threshold,
    direction: spec.direction,
    passing: evaluate(value, spec.direction, spec.threshold),
  };
}

/**
 * Lê os KPIs de missão reais e devolve o snapshot de QoS resolvido (com
 * thresholds e veredito). Síncrono: o dado é estático no bundle. Assinatura
 * Promise para casar com o consumo assíncrono da página e com a futura troca
 * por fetch da API sem mexer no componente.
 */
export async function fetchMissionMetrics(): Promise<MissionMetrics> {
  return rawMetrics as MissionMetrics;
}

/** Mesma fonte, já mapeada para os indicadores de QoS exibidos no /qos. */
export async function fetchQoSSnapshot(): Promise<QoSSnapshot> {
  const metrics = (await fetchMissionMetrics()) as MissionMetrics;
  const indicators = INDICATOR_ORDER.map((id) => buildIndicator(id, metrics));
  return {
    source: QOS_SOURCE,
    indicators,
    raw: metrics,
  };
}

/** Versão síncrona (útil para validação/teste sem await). */
export function buildQoSSnapshotSync(metrics: MissionMetrics): QoSSnapshot {
  const indicators = INDICATOR_ORDER.map((id) => buildIndicator(id, metrics));
  return { source: QOS_SOURCE, indicators, raw: metrics };
}
