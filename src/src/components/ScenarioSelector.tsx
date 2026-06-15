'use client';

import { cn } from '@/lib/utils';
import { FLIGHT_SCENARIOS, type FlightScenario } from '@/lib/flight-scenarios';

// Re-export para manter os imports existentes (`@/components/ScenarioSelector`).
// A fonte de verdade do tipo e do catálogo é '@/lib/flight-scenarios'.
export type { FlightScenario };

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
        SELECIONE O CENÁRIO
      </p>
      <div className="flex flex-wrap gap-2">
        {FLIGHT_SCENARIOS.map((s) => {
          const isSelected = selected === s.id;
          const isReal = s.kind === 'real';
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              aria-pressed={isSelected}
              className={cn(
                'flex items-center gap-2 px-3 py-2 font-mono font-black text-xs uppercase tracking-tight',
                'border-[3px] border-black transition-colors',
                isSelected ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100',
              )}
              title={s.description}
            >
              <span>{s.label}</span>
              {/* Rótulo de procedência: REAL (SITL) vs SIMULADO — aderência,
                  para não confundir fixture sintética com voo real. */}
              <span
                className={cn(
                  'px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight border-2 border-current',
                  isReal
                    ? isSelected
                      ? 'text-[#22c55e]'
                      : 'text-[#15803d]'
                    : isSelected
                      ? 'text-[#fbbf24]'
                      : 'text-[#b45309]',
                )}
              >
                {s.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
