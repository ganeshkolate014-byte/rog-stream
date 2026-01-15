import React from 'react';
import { motion } from 'framer-motion';

interface SegmentedControlProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  name?: string; // For layoutId uniqueness
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = "",
  name = "segment"
}) => {
  return (
    <div className={`flex bg-zinc-900/50 backdrop-blur-md p-1 rounded-lg border border-white/5 relative ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`relative flex-1 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors z-10 ${
              isActive ? 'text-black' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`active-pill-${name}`}
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
