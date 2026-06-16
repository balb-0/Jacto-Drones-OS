import type { FlightTelemetryPoint } from '@/types/flight-telemetry';

export type Severity = 'CRITICAL' | 'WARNING';

export interface Anomaly {
  type: string;
  severity: Severity;
  variables: { label: string; value: string }[];
}

export interface LoggedAnomaly extends Anomaly {
  timestamp_ms: number;
  id: string;
}

export function detectAnomalies(point: FlightTelemetryPoint): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Rule 1: Vibration Spike — any axis > 1.5g
  const { vibration_x_g, vibration_y_g, vibration_z_g } = point;
  if (vibration_x_g > 1.5 || vibration_y_g > 1.5 || vibration_z_g > 1.5) {
    anomalies.push({
      type: 'VIBRATION SPIKE',
      severity: 'CRITICAL',
      variables: [
        { label: 'VIB X', value: `${vibration_x_g.toFixed(2)}g` },
        { label: 'VIB Y', value: `${vibration_y_g.toFixed(2)}g` },
        { label: 'VIB Z', value: `${vibration_z_g.toFixed(2)}g` },
      ],
    });
  }

  // Rule 2: PWM Divergence — max(pwm1-4) - min(pwm1-4) > 350μs (recalibrado p/ voo real)
  const pwms = [point.pwm1_us, point.pwm2_us, point.pwm3_us, point.pwm4_us];
  const pwmDiff = Math.max(...pwms) - Math.min(...pwms);
  if (pwmDiff > 350) {
    anomalies.push({
      type: 'PWM DIVERGENCE',
      severity: 'WARNING',
      variables: [
        { label: 'PWM1', value: `${pwms[0].toFixed(0)}μs` },
        { label: 'PWM2', value: `${pwms[1].toFixed(0)}μs` },
        { label: 'PWM3', value: `${pwms[2].toFixed(0)}μs` },
        { label: 'PWM4', value: `${pwms[3].toFixed(0)}μs` },
        { label: 'Δ', value: `${pwmDiff.toFixed(0)}μs` },
      ],
    });
  }

  // Rule 3: Attitude Instability — abs(roll) > 25° OR abs(pitch) > 25° (recalibrado p/ voo real)
  const { roll_deg, pitch_deg } = point;
  if (Math.abs(roll_deg) > 25 || Math.abs(pitch_deg) > 25) {
    anomalies.push({
      type: 'ATTITUDE INSTABILITY',
      severity: 'CRITICAL',
      variables: [
        { label: 'ROLL', value: `${roll_deg.toFixed(1)}°` },
        { label: 'PITCH', value: `${pitch_deg.toFixed(1)}°` },
      ],
    });
  }

  // Rule 4: Acceleration Spike — acceleration > 18 m/s² (inclui gravidade ~9.8; recalibrado)
  if (point.acceleration_m_s2 > 18) {
    anomalies.push({
      type: 'ACCELERATION SPIKE',
      severity: 'WARNING',
      variables: [
        { label: 'ACCEL', value: `${point.acceleration_m_s2.toFixed(2)} m/s²` },
      ],
    });
  }

  return anomalies;
}

export function formatTimestamp(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1);
  return `T+${String(minutes).padStart(2, '0')}:${String(seconds).padStart(4, '0')}`;
}
