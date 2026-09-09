import React from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const [isDragging, setIsDragging] = React.useState(false);

  // Generate mock histogram data
  const histogramData = React.useMemo(() => {
    const bars = 30;
    return Array.from({ length: bars }, (_, i) => ({
      height: Math.sin(i / 5) * 0.5 + 0.5,
      selected: i >= (localValue[0] / max) * bars && i <= (localValue[1] / max) * bars,
    }));
  }, [localValue, max]);

  const handleChange = (newValue: [number, number]) => {
    setLocalValue(newValue);
    if (!isDragging) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full">
      {/* Histogram */}
      <div className="h-24 flex items-end space-x-1 mb-6">
        {histogramData.map((bar, index) => (
          <div
            key={index}
            className="flex-1"
            style={{ height: `${bar.height * 100}%` }}
          >
            <div
              className={`w-full h-full rounded-sm transition-colors ${
                bar.selected ? 'bg-black' : 'bg-gray-200'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Slider */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-full bg-black rounded-full"
          style={{
            left: `${(localValue[0] / max) * 100}%`,
            right: `${100 - (localValue[1] / max) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[0]}
          onChange={(e) => {
            const newValue = Math.min(parseInt(e.target.value), localValue[1]);
            handleChange([newValue, localValue[1]]);
          }}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => {
            setIsDragging(false);
            onChange(localValue);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[1]}
          onChange={(e) => {
            const newValue = Math.max(parseInt(e.target.value), localValue[0]);
            handleChange([localValue[0], newValue]);
          }}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => {
            setIsDragging(false);
            onChange(localValue);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />

        {/* Thumbs */}
        <div
          className="absolute w-6 h-6 bg-white border-2 border-black rounded-full -mt-2 -ml-3 cursor-pointer"
          style={{ left: `${(localValue[0] / max) * 100}%` }}
        />
        <div
          className="absolute w-6 h-6 bg-white border-2 border-black rounded-full -mt-2 -ml-3 cursor-pointer"
          style={{ left: `${(localValue[1] / max) * 100}%` }}
        />
      </div>

      {/* Price inputs */}
      <div className="flex justify-between items-center mt-6">
        <div className="relative">
          <input
            type="number"
            value={localValue[0]}
            onChange={(e) => {
              const newValue = Math.min(parseInt(e.target.value) || min, localValue[1]);
              handleChange([newValue, localValue[1]]);
            }}
            onBlur={() => onChange(localValue)}
            className="w-24 p-2 pl-6 border rounded-lg"
            min={min}
            max={localValue[1]}
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2">€</span>
        </div>
        <span className="text-gray-300">—</span>
        <div className="relative">
          <input
            type="number"
            value={localValue[1]}
            onChange={(e) => {
              const newValue = Math.max(parseInt(e.target.value) || localValue[0], localValue[0]);
              handleChange([localValue[0], newValue]);
            }}
            onBlur={() => onChange(localValue)}
            className="w-24 p-2 pl-6 border rounded-lg"
            min={localValue[0]}
            max={max}
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2">€</span>
        </div>
      </div>
    </div>
  );
};