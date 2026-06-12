'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { FlightTelemetryPoint } from '@/types/flight-telemetry';
import {
  tooltipContentStyle,
  tooltipCursorStroke,
  FONT_MONO,
} from '@/lib/chart-styles';

export interface ChannelConfig {
  /** Field name in data (e.g. 'altitude_m'). */
  key: string;
  /** Hex color (e.g. '#0a5193'). */
  color: string;
  /** Display name (e.g. 'Altitude'). */
  label: string;
}

export interface AnimatedLineChartProps {
  /** Full telemetry dataset. */
  data: FlightTelemetryPoint[];
  /** Show data from index 0 up to (and including) this index. */
  currentIndex: number;
  /** Which variables to plot as separate lines. */
  channels: ChannelConfig[];
  /** Y-axis label. */
  yLabel: string;
  /** Chart title. */
  title: string;
}

const TOKENS = {
  fontMono: FONT_MONO,
  border: '3px solid #000',
  shadow: '4px 4px 0px #000',
  gridStroke: '#00000010',
  axisStroke: '#000',
  indicatorColor: '#ef4444',
  paperBg: '#f5f3ee',
} as const;

const tickStyle = {
  fontSize: 10,
  fontWeight: 900 as const,
  fontFamily: TOKENS.fontMono,
  fill: '#000',
};

function AnimatedLineChartInner({
  data,
  currentIndex,
  channels,
  yLabel,
  title,
}: AnimatedLineChartProps) {
  const visibleData = useMemo(
    () => data.slice(0, currentIndex + 1),
    [data, currentIndex],
  );

  const currentTime = visibleData.length > 0
    ? visibleData[visibleData.length - 1]?.sim_time_s
    : 0;

  return (
    <div
      style={{
        border: TOKENS.border,
        boxShadow: TOKENS.shadow,
        backgroundColor: TOKENS.paperBg,
        padding: 16,
      }}
    >
      <h3
        style={{
          fontFamily: TOKENS.fontMono,
          fontWeight: 900,
          fontSize: 12,
          textTransform: 'uppercase',
          marginBottom: 12,
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={visibleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="0" stroke={TOKENS.gridStroke} vertical={false} />

          <XAxis
            dataKey="sim_time_s"
            tick={{ ...tickStyle, fontSize: 9 }}
            stroke={TOKENS.axisStroke}
            strokeWidth={2}
            axisLine
            tickFormatter={(v: number) => `${v.toFixed(0)}s`}
          />

          <YAxis
            tick={tickStyle}
            stroke={TOKENS.axisStroke}
            strokeWidth={2}
            axisLine
            label={{
              value: yLabel.toUpperCase(),
              angle: -90,
              position: 'insideLeft',
              offset: -5,
              style: {
                fontFamily: TOKENS.fontMono,
                fontWeight: 900,
                fontSize: 10,
                textTransform: 'uppercase',
                fill: '#000',
              },
            }}
          />

          <Tooltip
            contentStyle={tooltipContentStyle}
            itemStyle={{ color: '#000', fontSize: 13, fontWeight: 700 }}
            labelStyle={{ fontSize: 14, fontWeight: 900, color: '#000' }}
            cursor={tooltipCursorStroke}
            labelFormatter={(label) => `T: ${Number(label).toFixed(2)}s`}
          />

          <Legend
            wrapperStyle={{
              paddingTop: 16,
              fontFamily: TOKENS.fontMono,
              fontWeight: 900,
              fontSize: 10,
              textTransform: 'uppercase',
            }}
          />

          {visibleData.length > 0 && (
            <ReferenceLine
              x={currentTime}
              stroke={TOKENS.indicatorColor}
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                value: 'NOW',
                position: 'top',
                style: {
                  fontFamily: TOKENS.fontMono,
                  fontWeight: 900,
                  fontSize: 9,
                  fill: TOKENS.indicatorColor,
                  textTransform: 'uppercase',
                },
              }}
            />
          )}

          {channels.map((ch) => (
            <Line
              key={ch.key}
              type="monotone"
              dataKey={ch.key}
              name={ch.label}
              stroke={ch.color}
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                fill: ch.color,
                stroke: '#000',
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export const AnimatedLineChart = React.memo(AnimatedLineChartInner);
