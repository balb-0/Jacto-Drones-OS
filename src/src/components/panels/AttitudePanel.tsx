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
  { key: 'roll_deg', color: '#0a5193', label: 'Roll' },
  { key: 'pitch_deg', color: '#ec6608', label: 'Pitch' },
  { key: 'yaw_deg', color: '#22c55e', label: 'Yaw' },
];

export function AttitudePanel({ data, currentIndex }: PanelProps) {
  return (
    <Card className="p-0">
      <AnimatedLineChart
        data={data}
        currentIndex={currentIndex}
        channels={CHANNELS}
        yLabel="Degrees"
        title="ATTITUDE"
      />
    </Card>
  );
}
