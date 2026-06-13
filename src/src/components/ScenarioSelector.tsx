'use client';

import { cn } from '@/lib/utils';

export type FlightScenario = 'motor_failure' | 'normal' | 'vibration' | 'battery';

interface ScenarioOption {
  id: FlightScenario;
  label: string;
  description: string;
}

const SCENARIOS: ScenarioOption[] = [
  { id: 'motor_failure', label: 'MOTOR FAILURE', description: 'Motor 3 fails at T+50s' },
  { id: 'normal', label: 'NORMAL FLIGHT', description: 'No anomalies' },
  { id: 'vibration', label: 'VIBRATION ISSUES', description: 'Periodic spikes >1.5g' },
  { id: 'battery', label: 'BATTERY DEGRADATION', description: 'Voltage drop, forced landing' },
];

interface ScenarioSelectorProps {
  selected: FlightScenario;
  onChange: (scenario: FlightScenario) => void;
}

export function ScenarioSelector({ selected, onChange }: ScenarioSelectorProps) {
  return (
    <div
      className="brutal-card p-4"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <p className="text-xs font-black uppercase tracking-tight mb-3" style={{ color: '#6b7280' }}>
        SCENARIO SELECT
      </p>
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={cn(
              'px-3 py-2 font-mono font-black text-xs uppercase tracking-tight',
              'border-[3px] border-black transition-colors',
              selected === s.id
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100',
            )}
            title={s.description}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
