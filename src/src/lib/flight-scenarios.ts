// Catálogo de cenários do Flight Replay — fonte única de verdade.
//
// O cenário PRIMÁRIO consome src/src/data/flight-telemetry.json, que o pipeline
// (job de telemetria da missão SITL) publica a partir do .ulg da missão real
// square_50m — mesma origem do metrics.json do /qos. Os demais cenários
// (normal/vibração/bateria) são fixtures SINTÉTICAS geradas por
// scripts/generate_telemetry.py e ficam EXPLICITAMENTE rotuladas "Simulado"
// para não passarem por voo real (aderência).
//
// Fallback gracioso: enquanto o pipeline ainda não substituiu o
// flight-telemetry.json pelo log real, o arquivo carrega a fixture sintética de
// falha de motor. Detectamos essa situação por assinatura de metadados e
// marcamos o cenário primário como sintético, para a UI exibir o aviso
// "dado sintético" em vez de afirmar voo real.

import type { FlightTelemetryData } from '@/types/flight-telemetry';

import primaryJson from '@/data/flight-telemetry.json';
import normalJson from '@/data/flight-telemetry-normal.json';
import vibrationJson from '@/data/flight-telemetry-vibration.json';
import batteryJson from '@/data/flight-telemetry-battery.json';

/** Identificadores dos cenários disponíveis no seletor. */
export type FlightScenario = 'real' | 'normal' | 'vibration' | 'battery';

/** Procedência do dado de um cenário (governa rótulo e aviso na UI). */
export type ScenarioKind = 'real' | 'synthetic';

export interface FlightScenarioOption {
  id: FlightScenario;
  /** Rótulo curto do botão (uppercase no estilo brutalista). */
  label: string;
  /** Descrição (tooltip). */
  description: string;
  /** 'real' = log da missão SITL; 'synthetic' = fixture gerada. */
  kind: ScenarioKind;
  /** Tag curta exibida no botão/banner: "REAL (SITL)" ou "SIMULADO". */
  tag: string;
  data: FlightTelemetryData;
}

const primaryData = primaryJson as unknown as FlightTelemetryData;
const normalData = normalJson as unknown as FlightTelemetryData;
const vibrationData = vibrationJson as unknown as FlightTelemetryData;
const batteryData = batteryJson as unknown as FlightTelemetryData;

// Assinatura das fixtures sintéticas geradas por generate_telemetry.py:
// nome de missão sufixado pelo cenário e 200 amostras a 2.5 Hz. A missão real
// (square_50m) tem milhares de amostras e nome sem esse sufixo.
const SYNTHETIC_NAME_RE = /_(motor_failure|normal|vibration|battery)$/;
const SYNTHETIC_POINTS = 200;
const SYNTHETIC_SAMPLE_RATE_HZ = 2.5;

/**
 * Heurística: o flight-telemetry.json ainda é o placeholder sintético (pipeline
 * não publicou o log real)? Conservadora — só marca sintético quando casa a
 * assinatura conhecida das fixtures; qualquer log com outra cara é tratado como
 * real.
 */
export function isPlaceholderTelemetry(data: FlightTelemetryData): boolean {
  const meta = data.metadata;
  if (SYNTHETIC_NAME_RE.test(meta.mission_name)) return true;
  return meta.total_points === SYNTHETIC_POINTS && meta.sample_rate_hz === SYNTHETIC_SAMPLE_RATE_HZ;
}

/** true quando o cenário primário está servindo a fixture sintética de fallback. */
export const realIsSynthetic = isPlaceholderTelemetry(primaryData);

const REAL_DESCRIPTION = realIsSynthetic
  ? 'Telemetria REAL pendente — exibindo fixture sintética (dado sintético)'
  : 'Telemetria da missão square_50m (log .ulg do pipeline SITL)';

/**
 * Cenário primário: a missão real do SITL. Degrada para sintético com aviso
 * enquanto o log real não estiver no build.
 */
export const REAL_SCENARIO: FlightScenarioOption = {
  id: 'real',
  label: 'MISSÃO REAL (SITL)',
  description: REAL_DESCRIPTION,
  kind: realIsSynthetic ? 'synthetic' : 'real',
  tag: realIsSynthetic ? 'SIMULADO' : 'REAL (SITL)',
  data: primaryData,
};

const SYNTHETIC_SCENARIOS: FlightScenarioOption[] = [
  {
    id: 'normal',
    label: 'VOO NORMAL',
    description: 'Cenário simulado — voo limpo, sem anomalias',
    kind: 'synthetic',
    tag: 'SIMULADO',
    data: normalData,
  },
  {
    id: 'vibration',
    label: 'VIBRAÇÃO',
    description: 'Cenário simulado — picos periódicos de vibração >1.5g',
    kind: 'synthetic',
    tag: 'SIMULADO',
    data: vibrationData,
  },
  {
    id: 'battery',
    label: 'DEGRADAÇÃO DE BATERIA',
    description: 'Cenário simulado — queda de tensão e pouso forçado',
    kind: 'synthetic',
    tag: 'SIMULADO',
    data: batteryData,
  },
];

/** Lista ordenada para o seletor: missão real primeiro, depois os simulados. */
export const FLIGHT_SCENARIOS: FlightScenarioOption[] = [REAL_SCENARIO, ...SYNTHETIC_SCENARIOS];

const SCENARIO_BY_ID: Record<FlightScenario, FlightScenarioOption> = {
  real: REAL_SCENARIO,
  normal: SYNTHETIC_SCENARIOS[0],
  vibration: SYNTHETIC_SCENARIOS[1],
  battery: SYNTHETIC_SCENARIOS[2],
};

/** Cenário padrão exibido ao abrir o Flight Replay. */
export const DEFAULT_SCENARIO: FlightScenario = 'real';

/** Resolve um cenário pelo id (cai no primário se vier um id desconhecido). */
export function getScenario(id: FlightScenario): FlightScenarioOption {
  return SCENARIO_BY_ID[id] ?? REAL_SCENARIO;
}
