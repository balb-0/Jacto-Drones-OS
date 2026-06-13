'use client';

import { Card } from '@/components/ui/card';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import type { ChannelConfig } from '@/components/charts/AnimatedLineChart';
import type { FlightTelemetryPoint } from '@/types/flight-telemetry';

interface PanelProps {
  data: FlightTelemetryPoint[];
  currentIndex: number;
}

const CHANNELS: ChannelConfig[] = [
  { key: 'altitude_m', color: '#0a5193', label: 'Altitude' },
  { key: 'acceleration_m_s2', color: '#ec6608', label: 'Accel' },
  { key: 'battery_pct', color: '#22c55e', label: 'Battery' },
];

export function FlightPanel({ data, currentIndex }: PanelProps) {
  return (
    <Card className="p-0">
      <AnimatedLineChart
        data={data}
        currentIndex={currentIndex}
        channels={CHANNELS}
        yLabel="Mixed Units"
        title="FLIGHT"
      />
    </Card>
  );
}
