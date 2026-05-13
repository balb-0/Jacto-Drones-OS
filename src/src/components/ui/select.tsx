'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'SELECIONE...',
  className
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn('relative min-w-[200px]', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-[3px] border-black shadow-[3px_3px_0px_000000] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 font-black uppercase italic text-sm focus:outline-none"
      >
        <span className={cn(!selectedOption && 'text-gray-400')}>
          {selectedOption?.label.toUpperCase() || placeholder}
        </span>
        <ChevronDown className={cn(
          'w-5 h-5 text-black transition-transform',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 w-full mt-2 bg-white border-[3px] border-black shadow-[6px_6px_0px_000000] max-h-60 overflow-auto"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-3 text-left text-sm font-black uppercase italic hover:bg-primary transition-colors border-b-2 border-black last:border-b-0',
                    value === option.value && 'bg-primary text-black'
                  )}
                >
                  {option.label.toUpperCase()}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}