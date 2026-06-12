'use client';

import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import type { LoggedAnomaly } from '@/lib/anomaly-detection';
import { formatTimestamp } from '@/lib/anomaly-detection';

interface AnomalyLogProps {
  anomalies: LoggedAnomaly[];
}

export function AnomalyLog({ anomalies }: AnomalyLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && anomalies.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [anomalies.length]);

  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = anomalies.filter(a => a.severity === 'WARNING').length;

  return (
    <div
      style={{
        border: '3px solid #000',
        backgroundColor: '#fff',
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: '4px 4px 0px #000',
      }}
    >
      <div
        className="px-4 py-3 border-b-[3px] border-black flex items-center justify-between"
        style={{ backgroundColor: '#000' }}
      >
        <span className="text-sm font-black uppercase tracking-tight text-white">
          ANOMALY LOG
        </span>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <span className="text-[11px] font-black text-white flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5"
                style={{ backgroundColor: '#dc2626' }}
              />
              {criticalCount} CRITICAL
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-[11px] font-black text-white flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5"
                style={{ backgroundColor: '#ea580c' }}
              />
              {warningCount} WARNING
            </span>
          )}
          {anomalies.length === 0 && (
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              0 EVENTS
            </span>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: '280px' }}
      >
        {anomalies.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              NO ANOMALIES DETECTED
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-200">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="px-4 py-3 flex items-start gap-3"
                style={{ backgroundColor: anomaly.severity === 'CRITICAL' ? '#fef2f2' : '#fff7ed' }}
              >
                <span
                  className="text-[11px] font-black tabular-nums text-gray-600 whitespace-nowrap mt-0.5"
                  style={{ minWidth: '64px' }}
                >
                  {formatTimestamp(anomaly.timestamp_ms)}
                </span>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      {anomaly.type}
                    </span>
                    <Badge
                      variant={anomaly.severity === 'CRITICAL' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {anomaly.variables.map((v, vIdx) => (
                      <span key={vIdx} className="text-[11px] font-bold text-gray-800">
                        <span className="text-gray-500">{v.label}:</span>{' '}
                        <span className="font-black text-black">{v.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="px-4 py-2 border-t-[3px] border-black flex items-center justify-between"
        style={{ backgroundColor: '#f5f3ee' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
          TOTAL: {anomalies.length} EVENT{anomalies.length !== 1 ? 'S' : ''}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
          FLIGHT SESSION LOG
        </span>
      </div>
    </div>
  );
}
