import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlightTelemetryPoint } from '@/types/flight-telemetry';
import { Badge } from '@/components/ui/badge';
import { detectAnomalies, formatTimestamp } from '@/lib/anomaly-detection';
import type { Severity } from '@/lib/anomaly-detection';

interface AnomalyAlertProps {
  currentPoint: FlightTelemetryPoint | null;
  isVisible: boolean;
}

const DISMISS_DELAY_MS = 5000;

export function AnomalyAlert({ currentPoint, isVisible }: AnomalyAlertProps) {
  const [showAlert, setShowAlert] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const anomalies = currentPoint ? detectAnomalies(currentPoint) : [];
  const hasAnomalies = anomalies.length > 0;

  useEffect(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    if (isVisible && hasAnomalies) {
      setShowAlert(true);
    } else if (showAlert && !hasAnomalies) {
      dismissTimerRef.current = setTimeout(() => {
        setShowAlert(false);
      }, DISMISS_DELAY_MS);
    }

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [isVisible, hasAnomalies, showAlert]);

  if (!showAlert || !currentPoint) return null;

  const highestSeverity: Severity = anomalies.some(a => a.severity === 'CRITICAL')
    ? 'CRITICAL'
    : 'WARNING';

  const bgColor = highestSeverity === 'CRITICAL' ? '#dc2626' : '#ea580c';
  const bgLight = highestSeverity === 'CRITICAL' ? '#fef2f2' : '#fff7ed';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: [
            '4px 4px 0px #000',
            '6px 6px 0px #000',
            '4px 4px 0px #000',
          ],
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          opacity: { duration: 0.15 },
          scale: { duration: 0.15 },
          boxShadow: {
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="fixed bottom-6 right-6 z-50 w-[380px]"
        style={{
          border: '3px solid #000',
          backgroundColor: bgLight,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div
          className="px-4 py-3 border-b-[3px] border-black flex items-center justify-between"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="text-xl"
            >
              ⚠
            </motion.span>
            <span className="text-sm font-black uppercase tracking-tight text-white">
              ANOMALY DETECTED
            </span>
          </div>
          <Badge
            variant={highestSeverity === 'CRITICAL' ? 'error' : 'warning'}
            size="sm"
          >
            {highestSeverity}
          </Badge>
        </div>

        <div className="px-4 py-3 space-y-3">
          {anomalies.map((anomaly, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
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
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {anomaly.variables.map((v, vIdx) => (
                  <span key={vIdx} className="text-[11px] font-bold text-gray-800">
                    <span className="text-gray-500">{v.label}:</span>{' '}
                    <span className="font-black text-black">{v.value}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-2 border-t-[3px] border-black bg-black text-white flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest">
            TELEMETRY ALERT
          </span>
          <span className="text-[11px] font-black tabular-nums">
            {formatTimestamp(currentPoint.timestamp_ms)}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
