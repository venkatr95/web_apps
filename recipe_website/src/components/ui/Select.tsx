import { cn } from "@/lib/utils";
import { forwardRef, SelectHTMLAttributes } from "react";
import { FiChevronDown } from "react-icons/fi";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={cn(
              // Glass morphism base
              "flex h-11 w-full appearance-none rounded-lg px-3 py-2 pr-10 text-sm transition-all duration-200",
              // Light mode glass effect
              "bg-white/70 dark:bg-gray-800/70",
              "backdrop-blur-xl backdrop-saturate-150",
              // Borders and shadows
              "border border-gray-200/50 dark:border-gray-700/50",
              "shadow-sm hover:shadow-md",
              // Text colors
              "text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              // Focus state with enhanced glass effect
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50",
              "focus-visible:border-primary-500/50 dark:focus-visible:border-primary-400/50",
              "focus-visible:bg-white/90 dark:focus-visible:bg-gray-800/90",
              "focus-visible:shadow-lg",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm",
              // Error state
              error &&
                "border-red-500/50 dark:border-red-400/50 focus-visible:ring-red-500/50 dark:focus-visible:ring-red-400/50",
              className
            )}
            {...props}
          >
            {options
              ? options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          {/* Chevron icon with glass effect */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="rounded-full p-1 bg-gray-100/50 dark:bg-gray-700/50 backdrop-blur-sm group-hover:bg-gray-200/50 dark:group-hover:bg-gray-600/50 transition-colors">
              <FiChevronDown className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
