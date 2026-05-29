// Tipos dos KPIs de missão SITL — a fonte REAL de QoS de produto (firmware).
//
// Espelham 1:1 o contrato de reports/metrics.json (artefato do job
// `sitl-mission-metrics` em ci/sitl-metrics.yml, gerado por
// scripts/extract_metrics.py a partir do .ulg da missão square_50m).
// NÃO inventar campos: o que entra aqui é o que o pipeline publica.

/** Forma crua do metrics.json publicado pelo pipeline (1 run da missão). */
export interface MissionMetrics {
  /** Tempo total da missão entre 1ª e última amostra (s). */
  mission_duration_s: number;
  /** Pico de altitude atingido (m, frame NED convertido para positivo). */
  max_altitude_m: number;
  /** Altitude média ao longo da missão (m). */
  mean_altitude_m: number;
  /** Desvio padrão da altitude na janela de cruzeiro (>= 5 m) — estabilidade. */
  std_altitude_cruise_m: number;
  /** Pico do módulo de aceleração (m/s²; inclui g ~9.8). */
  max_acceleration_m_s2: number;
  /** Maior queda de bateria entre amostras consecutivas (fração 0–1). */
  max_battery_drop_pct: number;
  /** Número de amostras digeridas do log. */
  n_samples: number;
}

/** Chaves dos indicadores de QoS de produto derivados da missão. */
export type QoSIndicatorId =
  | 'mission_duration_s'
  | 'max_altitude_m'
  | 'mean_altitude_m'
  | 'std_altitude_cruise_m'
  | 'max_acceleration_m_s2'
  | 'max_battery_drop_pct';

/** Direção do limite: 'max' = aceita valores <= threshold; 'info' = sem gate. */
export type ThresholdDirection = 'max' | 'min' | 'info';

/**
 * Indicador de QoS já resolvido para a UI: valor real medido + (quando há)
 * threshold do quality_gates.yaml e veredito de conformidade.
 */
export interface QoSIndicator {
  id: QoSIndicatorId;
  /** Rótulo curto exibido no card. */
  label: string;
  /** Valor medido (vindo do metrics.json). */
  value: number;
  /** Unidade exibida (ex.: 's', 'm', 'm/s²', '%'). */
  unit: string;
  /** Threshold do quality_gates.yaml, quando o indicador tem gate. */
  threshold?: number;
  /** Direção do limite quando há gate. */
  direction: ThresholdDirection;
  /** true se passa o gate; undefined quando é apenas informativo. */
  passing?: boolean;
}

/** Conjunto de indicadores QoS + metadados do run que os originou. */
export interface QoSSnapshot {
  /** Origem dos dados (artefato/arquivo). */
  source: string;
  indicators: QoSIndicator[];
  /** Eco da forma crua, útil para depuração/auditoria. */
  raw: MissionMetrics;
}
