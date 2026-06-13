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
  { key: 'pwm1_us', color: '#0a5193', label: 'PWM 1' },
  { key: 'pwm2_us', color: '#ec6608', label: 'PWM 2' },
  { key: 'pwm3_us', color: '#22c55e', label: 'PWM 3' },
  { key: 'pwm4_us', color: '#a855f7', label: 'PWM 4' },
];

export function MotorsPanel({ data, currentIndex }: PanelProps) {
  return (
    <Card className="p-0">
      <AnimatedLineChart
        data={data}
        currentIndex={currentIndex}
        channels={CHANNELS}
        yLabel="PWM (μs)"
        title="MOTORS"
      />
    </Card>
  );
}
