import { Star } from "lucide-react";
import React from "react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className = "",
}) => {
  // Ensure value is between 0 and max
  const safeValue = Math.max(0, Math.min(value, max));

  // Calculate the percentage for filled stars
  const percentage = (safeValue / max) * 100;

  const sizeMap = {
    sm: { starSize: 12, textSize: "text-xs" },
    md: { starSize: 16, textSize: "text-sm" },
    lg: { starSize: 20, textSize: "text-base" },
  };

  const { starSize, textSize } = sizeMap[size];

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex relative">
        {/* Background Stars (gray) */}
        <div className="flex">
          {[...Array(max)].map((_, i) => (
            <Star key={`bg-${i}`} size={starSize} fill="transparent" />
          ))}
        </div>

        {/* Foreground Stars (filled based on rating value) */}
        <div
          className="flex absolute top-0 left-0 overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          {[...Array(max)].map((_, i) => (
            <Star
              key={`fg-${i}`}
              size={starSize}
              fill="currentColor"
              className="text-warning-500 flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {showValue && (
        <span className={`ml-2 ${textSize} font-medium`}>
          {safeValue.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
