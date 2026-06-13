'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { FlightTelemetryData } from '@/types/flight-telemetry';
import { useFlightReplay } from '@/hooks/useFlightReplay';
import { AttitudePanel, MotorsPanel, VibrationPanel, FlightPanel } from '@/components/panels';
import { AnomalyAlert } from '@/components/AnomalyAlert';
import { AnomalyLog } from '@/components/AnomalyLog';
import { FlightSummary } from '@/components/FlightSummary';
import { detectAnomalies } from '@/lib/anomaly-detection';
import type { LoggedAnomaly } from '@/lib/anomaly-detection';
import type { FlightScenario } from '@/components/ScenarioSelector';
import { cn } from '@/lib/utils';

import motorFailureJson from '@/data/flight-telemetry.json';
import normalJson from '@/data/flight-telemetry-normal.json';
import vibrationJson from '@/data/flight-telemetry-vibration.json';
import batteryJson from '@/data/flight-telemetry-battery.json';

const SCENARIO_DATA: Record<FlightScenario, FlightTelemetryData> = {
  motor_failure: motorFailureJson as unknown as FlightTelemetryData,
  normal: normalJson as unknown as FlightTelemetryData,
  vibration: vibrationJson as unknown as FlightTelemetryData,
  battery: batteryJson as unknown as FlightTelemetryData,
};

interface FlightReplayProps {
  scenario?: FlightScenario;
}

let anomalyIdCounter = 0;

export function FlightReplay({ scenario = 'motor_failure' }: FlightReplayProps) {
  const [data, setData] = useState<FlightTelemetryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prevScenario, setPrevScenario] = useState<FlightScenario>(scenario);
  const [anomalyLog, setAnomalyLog] = useState<LoggedAnomaly[]>([]);
  const loggedTimestampsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (scenario !== prevScenario) {
      setPrevScenario(scenario);
      setData(null);
      setAnomalyLog([]);
      loggedTimestampsRef.current.clear();
    }
  }, [scenario, prevScenario]);

  useEffect(() => {
    try {
      setData(SCENARIO_DATA[scenario]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load telemetry data');
    }
  }, [scenario]);

  const {
    isPlaying,
    currentIndex,
    currentTime,
    visibleData,
    start,
    stop,
    reset,
    isComplete,
  } = useFlightReplay(data?.points ?? []);

  const totalDuration = data?.metadata.duration_s ?? 80;

  const localIndex = visibleData.length - 1;
  const currentPoint = data?.points[currentIndex] ?? null;

  const accumulateAnomalies = useCallback((point: typeof currentPoint) => {
    if (!point) return;
    const detected = detectAnomalies(point);
    if (detected.length === 0) return;

    const newEntries: LoggedAnomaly[] = [];
    for (const anomaly of detected) {
      const key = `${point.timestamp_ms}-${anomaly.type}`;
      if (!loggedTimestampsRef.current.has(key)) {
        loggedTimestampsRef.current.add(key);
        newEntries.push({
          ...anomaly,
          timestamp_ms: point.timestamp_ms,
          id: `anomaly-${++anomalyIdCounter}`,
        });
      }
    }

    if (newEntries.length > 0) {
      setAnomalyLog(prev => [...prev, ...newEntries]);
    }
  }, []);

  useEffect(() => {
    if (isPlaying && currentPoint) {
      accumulateAnomalies(currentPoint);
    }
  }, [currentIndex, isPlaying, currentPoint, accumulateAnomalies]);

  const handleResetAndStart = useCallback(() => {
    setAnomalyLog([]);
    loggedTimestampsRef.current.clear();
    reset();
    start();
  }, [reset, start]);

  const progressPercent = useMemo(
    () => (totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0),
    [currentTime, totalDuration],
  );

  const formattedTime = useMemo(
    () => `T+${currentTime.toFixed(1)}s / ${totalDuration.toFixed(1)}s`,
    [currentTime, totalDuration],
  );

  if (!data && !error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="brutal-card p-8 text-center"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          <p className="text-lg font-black uppercase tracking-tight">LOADING TELEMETRY…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="brutal-card p-8 text-center"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          <p className="text-lg font-black uppercase tracking-tight" style={{ color: '#ef4444' }}>
            LOAD FAILED
          </p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="brutal-card p-4 flex items-center gap-4 flex-wrap"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        {!isComplete ? (
          <button
            type="button"
            onClick={isPlaying ? stop : start}
            className={cn(
              'brutal-btn font-mono font-black text-sm',
              isPlaying ? 'text-white' : 'text-black',
            )}
            style={{
              backgroundColor: isPlaying ? '#22c55e' : '#000000',
              color: '#ffffff',
            }}
          >
            {isPlaying ? 'STOP' : 'PLAY'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResetAndStart}
            className="brutal-btn font-mono font-black text-sm"
            style={{ backgroundColor: '#ec6608', color: '#ffffff' }}
          >
            REPLAY
          </button>
        )}

        <span
          className="text-sm font-black tabular-nums whitespace-nowrap"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {formattedTime}
        </span>

        <div
          className="flex-1 h-4 min-w-[120px]"
          style={{ backgroundColor: '#ffffff', border: '3px solid #000' }}
        >
          <div
            className="h-full transition-[width] duration-100"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: '#22c55e',
            }}
          />
        </div>
      </div>

      {isComplete && data ? (
        <FlightSummary
          data={data}
          anomalies={anomalyLog}
          onReplay={handleResetAndStart}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AttitudePanel data={visibleData} currentIndex={localIndex} />
            <MotorsPanel data={visibleData} currentIndex={localIndex} />
            <VibrationPanel data={visibleData} currentIndex={localIndex} />
            <FlightPanel data={visibleData} currentIndex={localIndex} />
          </div>

          <AnomalyLog anomalies={anomalyLog} />
        </>
      )}

      <AnomalyAlert currentPoint={currentPoint} isVisible={isPlaying} />
    </div>
  );
}
