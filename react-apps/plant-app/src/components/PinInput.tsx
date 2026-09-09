import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  label: string;
  error?: string;
}

export function PinInput({ length = 6, onComplete, label, error }: PinInputProps) {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check completion
    const pinString = newPin.join('');
    if (pinString.length === length && !newPin.includes('')) {
      onComplete(pinString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{label}</h3>
      
      <div className="flex gap-2 sm:gap-3 mb-6">
        {pin.map((digit, idx) => (
          <motion.input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200 ${
              error 
                ? 'border-red-300 bg-red-50 text-red-600' 
                : 'border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white text-gray-800'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          />
        ))}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>
      )}
    </div>
  );
}
