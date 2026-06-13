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
  { key: 'vibration_x_g', color: '#0a5193', label: 'Vib X' },
  { key: 'vibration_y_g', color: '#ec6608', label: 'Vib Y' },
  { key: 'vibration_z_g', color: '#22c55e', label: 'Vib Z' },
];

export function VibrationPanel({ data, currentIndex }: PanelProps) {
  return (
    <Card className="p-0">
      <AnimatedLineChart
        data={data}
        currentIndex={currentIndex}
        channels={CHANNELS}
        yLabel="G-Force"
        title="VIBRATION"
      />
    </Card>
  );
}
