import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const { theme } = useTheme();
  
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: theme === 'dark' 
      ? 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500' 
      : 'bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-400',
    secondary: theme === 'dark'
      ? 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
      : 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400',
    outline: theme === 'dark'
      ? 'border border-gray-600 hover:bg-gray-800 text-gray-300 focus:ring-gray-500'
      : 'border border-gray-300 hover:bg-gray-100 text-gray-700 focus:ring-gray-300',
    ghost: theme === 'dark'
      ? 'hover:bg-gray-800 text-gray-300 focus:ring-gray-600'
      : 'hover:bg-gray-100 text-gray-700 focus:ring-gray-300',
    danger: theme === 'dark'
      ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
      : 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
  };
  
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 space-x-1.5',
    md: 'text-sm px-4 py-2 space-x-2',
    lg: 'text-base px-5 py-2.5 space-x-2.5',
  };
  
  const disabledStyles = 'opacity-50 cursor-not-allowed';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${disabled || isLoading ? disabledStyles : ''}
    ${widthStyles}
    ${className}
  `;

  return (
    <button 
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : iconPosition === 'left' && icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      
      <span>{children}</span>
      
      {!isLoading && iconPosition === 'right' && icon ? (
        <span className="ml-2">{icon}</span>
      ) : null}
    </button>
  );
};

export default Button;