// Tipos de telemetria de voo SITL — ponto, metadados e agregador.
//
// Usados pelo hook de playback e componentes de gráfico para renderizar
// séries temporais dos logs de voo (square_50m e demais missões).

/** Um ponto amostral de telemetria (1 linha do log de voo). */
export interface FlightTelemetryPoint {
  /** Tempo absoluto desde o início da missão (ms inteiro). */
  timestamp_ms: number;
  /** Tempo de simulação em segundos (float). */
  sim_time_s: number;
  // Attitude
  /** Ângulo de rolagem (graus). */
  roll_deg: number;
  /** Ângulo de arfagem (graus). */
  pitch_deg: number;
  /** Ângulo de guinada (graus). */
  yaw_deg: number;
  /** Taxa angular no eixo de rolagem (graus/s). */
  angular_rate_roll_dps: number;
  /** Taxa angular no eixo de arfagem (graus/s). */
  angular_rate_pitch_dps: number;
  /** Taxa angular no eixo de guinada (graus/s). */
  angular_rate_yaw_dps: number;
  // Flight
  /** Altitude em metros (frame NED convertido para positivo). */
  altitude_m: number;
  /** Módulo da aceleração (m/s²; inclui g ~9.8). */
  acceleration_m_s2: number;
  /** Carga da bateria (percentual 0–100). */
  battery_pct: number;
  // Motors
  /** Largura de pulso do motor 1 (µs). */
  pwm1_us: number;
  /** Largura de pulso do motor 2 (µs). */
  pwm2_us: number;
  /** Largura de pulso do motor 3 (µs). */
  pwm3_us: number;
  /** Largura de pulso do motor 4 (µs). */
  pwm4_us: number;
  // Vibration
  /** Vibração no eixo X (g). */
  vibration_x_g: number;
  /** Vibração no eixo Y (g). */
  vibration_y_g: number;
  /** Vibração no eixo Z (g). */
  vibration_z_g: number;
  // Rating
  /** Índice Cooper-Harper atribuído ao ponto (1–10). */
  cooper_harper: number;
}

/** Metadados da missão que originou a telemetria. */
export interface FlightTelemetryMetadata {
  /** Nome da missão (ex.: 'square_50m'). */
  mission_name: string;
  /** Taxa de amostragem do log (Hz). */
  sample_rate_hz: number;
  /** Número total de pontos na série. */
  total_points: number;
  /** Duração total da missão (s). */
  duration_s: number;
  /** Instante de início da falha (s); 0 se não houve. */
  failure_start_s: number;
  /** Instante de fim da falha (s); 0 se não houve. */
  failure_end_s: number;
  /** Tipo de aeronave (ex.: 'iris', 'quadrotor_x'). */
  airframe: string;
}

/** Agregador completo: metadados + série temporal de telemetria. */
export interface FlightTelemetryData {
  metadata: FlightTelemetryMetadata;
  points: FlightTelemetryPoint[];
}
