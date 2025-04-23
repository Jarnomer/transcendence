import React from 'react';

interface SliderProps {
  level: number;
  min: number;
  max: number;
  step: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  isEnabled: boolean;
  id: string;
}

export const Slider: React.FC<SliderProps> = ({
  id,
  level,
  min,
  max,
  step,
  setLevel,
  isEnabled,
}) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={level}
        onChange={(e) => setLevel(parseFloat(e.target.value))}
        disabled={!isEnabled}
        className={`w-full appearance-none h-2 rounded-lg cursor-pointer ${
          isEnabled ? 'bg-gray-700' : 'bg-gray-500 opacity-50 cursor-not-allowed'
        }`}
      />
      <label
        htmlFor={id}
        className={`block text-xs font-medium ${isEnabled ? 'text-secondary' : 'text-gray-400'} `}
      >
        <span className="font-semibold">{isEnabled ? 'volume: ' + level : 'Disabled'}</span>
      </label>
    </div>
  );
};
