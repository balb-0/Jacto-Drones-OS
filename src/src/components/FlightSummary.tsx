'use client';

import { useMemo } from 'react';
import type { FlightTelemetryData } from '@/types/flight-telemetry';
import type { LoggedAnomaly } from '@/lib/anomaly-detection';

const QUALITY_GATES = {
  max_acceleration_m_s2: 15.0,
  max_std_altitude_cruise_m: 1.0,
  max_vibration_g: 2.0,
} as const;

function calcStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

interface MetricResult {
  label: string;
  value: string;
  unit: string;
  passed: boolean | null;
}

interface GateCheck {
  label: string;
  limit: string;
  actual: string;
  passed: boolean;
}

interface FlightSummaryProps {
  data: FlightTelemetryData;
  anomalies: LoggedAnomaly[];
  onReplay: () => void;
}

export function FlightSummary({ data, anomalies, onReplay }: FlightSummaryProps) {
  const { metrics, gates, verdict, criticalCount, warningCount } = useMemo(() => {
    const pts = data.points;
    const meta = data.metadata;

    const totalFlightTime = meta.duration_s ?? (pts.length > 0 ? pts[pts.length - 1].sim_time_s : 0);

    const maxAltitude = Math.max(...pts.map(p => p.altitude_m));
    const maxAcceleration = Math.max(...pts.map(p => p.acceleration_m_s2));
    const maxVibrationX = Math.max(...pts.map(p => p.vibration_x_g));
    const maxVibrationY = Math.max(...pts.map(p => p.vibration_y_g));
    const maxVibrationZ = Math.max(...pts.map(p => p.vibration_z_g));
    const maxVibration = Math.max(maxVibrationX, maxVibrationY, maxVibrationZ);

    const batteryStart = pts.length > 0 ? pts[0].battery_pct : 0;
    const batteryEnd = pts.length > 0 ? pts[pts.length - 1].battery_pct : 0;
    const batteryUsed = batteryStart - batteryEnd;

    const altitudeStdDev = calcStdDev(pts.map(p => p.altitude_m));

    const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;
    const warningCount = anomalies.filter(a => a.severity === 'WARNING').length;

    const gateAccel = maxAcceleration <= QUALITY_GATES.max_acceleration_m_s2;
    const gateAltStd = altitudeStdDev <= QUALITY_GATES.max_std_altitude_cruise_m;
    const gateVibration = maxVibration <= QUALITY_GATES.max_vibration_g;
    const allPass = gateAccel && gateAltStd && gateVibration;

    const metricsList: MetricResult[] = [
      { label: 'FLIGHT TIME', value: totalFlightTime.toFixed(1), unit: 's', passed: null },
      { label: 'MAX ALTITUDE', value: maxAltitude.toFixed(2), unit: 'm', passed: null },
      { label: 'MAX ACCEL', value: maxAcceleration.toFixed(2), unit: 'm/s²', passed: gateAccel },
      { label: 'MAX VIBRATION', value: maxVibration.toFixed(2), unit: 'g', passed: gateVibration },
      { label: 'BATTERY USED', value: batteryUsed.toFixed(1), unit: '%', passed: null },
      { label: 'ANOMALIES', value: `${anomalies.length}`, unit: '', passed: anomalies.length === 0 },
    ];

    const gatesList: GateCheck[] = [
      {
        label: 'MAX ACCELERATION',
        limit: `≤ ${QUALITY_GATES.max_acceleration_m_s2} m/s²`,
        actual: `${maxAcceleration.toFixed(2)} m/s²`,
        passed: gateAccel,
      },
      {
        label: 'ALTITUDE STD DEV',
        limit: `≤ ${QUALITY_GATES.max_std_altitude_cruise_m} m`,
        actual: `${altitudeStdDev.toFixed(3)} m`,
        passed: gateAltStd,
      },
      {
        label: 'MAX VIBRATION',
        limit: `≤ ${QUALITY_GATES.max_vibration_g} g`,
        actual: `${maxVibration.toFixed(2)} g`,
        passed: gateVibration,
      },
    ];

    return {
      metrics: metricsList,
      gates: gatesList,
      verdict: allPass ? 'PASS' : 'FAIL',
      criticalCount,
      warningCount,
    };
  }, [data, anomalies]);

  const isPass = verdict === 'PASS';

  return (
    <div
      className="brutal-card overflow-hidden"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <div
        className="px-5 py-4 border-b-[4px] border-black flex items-center justify-between"
        style={{ backgroundColor: isPass ? '#22c55e' : '#ef4444' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-2xl"
            style={{ filter: 'grayscale(0) brightness(1)' }}
          >
            {isPass ? '✓' : '✕'}
          </span>
          <span className="text-lg font-black uppercase tracking-tight text-white">
            FLIGHT SUMMARY
          </span>
        </div>
        <span
          className="text-sm font-black uppercase tracking-widest px-4 py-1"
          style={{
            backgroundColor: '#000',
            color: '#fff',
            border: '2px solid #fff',
          }}
        >
          {verdict}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 border-b-[4px] border-black">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="px-5 py-4 flex flex-col gap-1"
            style={{
              borderRight: (i % 3 !== 2) ? '2px solid #e5e5e5' : 'none',
              borderBottom: (i < metrics.length - (metrics.length % 3 === 0 ? 3 : metrics.length % 3)) || (i < 3 && metrics.length > 3) ? '2px solid #e5e5e5' : 'none',
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {m.label}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-xl font-black tabular-nums"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {m.value}
              </span>
              {m.unit && (
                <span className="text-[11px] font-bold text-gray-500 uppercase">
                  {m.unit}
                </span>
              )}
            </div>
            {m.passed !== null && (
              <span
                className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: m.passed ? '#22c55e' : '#ef4444' }}
              >
                {m.passed ? 'GATE PASS' : 'GATE FAIL'}
              </span>
            )}
          </div>
        ))}
      </div>

      {anomalies.length > 0 && (
        <div
          className="px-5 py-3 border-b-[4px] border-black flex items-center gap-4"
          style={{ backgroundColor: '#f5f3ee' }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
            BREAKDOWN:
          </span>
          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <span className="text-[11px] font-black flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5"
                  style={{ backgroundColor: '#dc2626' }}
                />
                <span style={{ color: '#dc2626' }}>{criticalCount}</span>
                <span className="text-gray-600">CRITICAL</span>
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-[11px] font-black flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5"
                  style={{ backgroundColor: '#ea580c' }}
                />
                <span style={{ color: '#ea580c' }}>{warningCount}</span>
                <span className="text-gray-600">WARNING</span>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="px-5 py-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block">
          QUALITY GATES
        </span>
        <div className="space-y-2">
          {gates.map(g => (
            <div
              key={g.label}
              className="flex items-center justify-between px-3 py-2"
              style={{
                backgroundColor: g.passed ? '#f0fdf4' : '#fef2f2',
                border: `2px solid ${g.passed ? '#22c55e' : '#ef4444'}`,
              }}
            >
              <span className="text-[11px] font-black uppercase tracking-wider">
                {g.label}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-gray-600 tabular-nums">
                  {g.actual}
                </span>
                <span className="text-[10px] font-black text-gray-400">
                  {g.limit}
                </span>
                <span
                  className="text-[11px] font-black uppercase"
                  style={{ color: g.passed ? '#22c55e' : '#ef4444' }}
                >
                  {g.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="px-5 py-3 border-t-[4px] border-black flex items-center justify-between"
        style={{ backgroundColor: '#000' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {data.metadata.mission_name.toUpperCase()} — {data.metadata.airframe.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={onReplay}
          className="brutal-btn font-mono font-black text-xs"
          style={{ backgroundColor: '#ec6608', color: '#ffffff' }}
        >
          REPLAY
        </button>
      </div>
    </div>
  );
}
