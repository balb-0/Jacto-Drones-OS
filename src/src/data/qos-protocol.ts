// Protocolo de medição por indicador de QoS (TG2.4.2 — fecha feedback S2 item 2).
//
// Para CADA indicador exibido no dashboard /qos declaramos, de forma explícita
// e versionada, COMO ele é medido: janela × método × regra de aceite. Princípio
// "evidência no entorno imediato": a UI renderiza este protocolo ao lado do
// próprio número, para que ninguém precise sair do painel para saber de onde
// o valor veio nem o que o torna verde/vermelho.
//
// Origem dos aceites: quality_gates.yaml (seção mission_metrics) + ADR-0003
// (critérios de aprovação de log SITL). Indicadores sem gate dedicado são
// rotulados como "contexto" (informativos), não como aprovação/reprovação.

import type { QoSIndicatorId } from '@/types/mission';

/** Como medir e aceitar um indicador de QoS. */
export interface QoSMeasurementProtocol {
  /** Sobre QUAIS dados o indicador é avaliado (recorte temporal/amostral). */
  window: string;
  /** O CAMINHO de produção do número (job → script → artefato → campo). */
  method: string;
  /** A REGRA que decide aprovação (threshold + origem) ou "contexto". */
  acceptance: string;
}

/**
 * Mapa indicador → protocolo. Chaves casam 1:1 com QoSIndicatorId, garantindo
 * em tempo de compilação que todo indicador exibido tenha protocolo declarado.
 */
export const QOS_PROTOCOL: Record<QoSIndicatorId, QoSMeasurementProtocol> = {
  std_altitude_cruise_m: {
    window:
      'Último run do pipeline em develop; amostras de altitude na janela de cruzeiro (>= 5 m) de uma missão square_50m.',
    method:
      'Job sitl-mission-metrics (ci/sitl-metrics.yml) → PX4 SITL voa square_50m → .ulg → scripts/extract_metrics.py (std da altitude em cruzeiro) → reports/metrics.json[std_altitude_cruise_m].',
    acceptance:
      'Aceite: <= 1.0 m (quality_gates.yaml: mission_metrics.max_std_altitude_cruise_m). Baseline medido ~0.69 m. Acima do limite reprova o gate.',
  },
  max_acceleration_m_s2: {
    window:
      'Último run do pipeline em develop; pico do módulo de aceleração ao longo de toda a missão square_50m.',
    method:
      'Job sitl-mission-metrics → tópico vehicle_acceleration do .ulg → scripts/extract_metrics.py (máximo do módulo) → reports/metrics.json[max_acceleration_m_s2]. NB: inclui g (~9.8 m/s²).',
    acceptance:
      'Aceite: <= 15.0 m/s² (quality_gates.yaml: mission_metrics.max_acceleration_m_s2 — invariante físico). Acima reprova o gate.',
  },
  mission_duration_s: {
    window:
      'Último run do pipeline em develop; tempo total entre a primeira e a última amostra da missão square_50m.',
    method:
      'Job sitl-mission-metrics → timestamps de vehicle_local_position no .ulg → scripts/extract_metrics.py (último − primeiro) → reports/metrics.json[mission_duration_s].',
    acceptance:
      'Aceite: <= 180 s (quality_gates.yaml: mission_metrics.max_mission_duration_s — baseline ~79 s + folga). Acima reprova o gate.',
  },
  max_altitude_m: {
    window:
      'Último run do pipeline em develop; pico de altitude da missão square_50m.',
    method:
      'Job sitl-mission-metrics → z de vehicle_local_position (NED, convertido para positivo) no .ulg → scripts/extract_metrics.py (máximo) → reports/metrics.json[max_altitude_m].',
    acceptance:
      'Contexto (sem gate dedicado): valida que a missão atingiu o teto esperado (~10 m no square_50m). Não aprova/reprova isoladamente.',
  },
  mean_altitude_m: {
    window:
      'Último run do pipeline em develop; média de altitude ao longo da missão square_50m.',
    method:
      'Job sitl-mission-metrics → z de vehicle_local_position no .ulg → scripts/extract_metrics.py (média) → reports/metrics.json[mean_altitude_m].',
    acceptance:
      'Contexto (sem gate dedicado): caracteriza o perfil de voo; lido junto de max/σ de altitude.',
  },
  max_battery_drop_pct: {
    window:
      'Último run do pipeline em develop; maior queda de bateria entre amostras consecutivas da missão square_50m.',
    method:
      'Job sitl-mission-metrics → remaining de battery_status no .ulg → scripts/extract_metrics.py (máxima diferença consecutiva) → reports/metrics.json[max_battery_drop_pct].',
    acceptance:
      'Contexto (sem gate dedicado nesta sprint): monitorado para regressão de consumo; vira gate quando o baseline de bateria for cravado.',
  },
};

/** Acesso tipado ao protocolo de um indicador. */
export function getProtocol(id: QoSIndicatorId): QoSMeasurementProtocol {
  return QOS_PROTOCOL[id];
}
