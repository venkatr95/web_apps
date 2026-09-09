import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverable = false,
  elevated = false,
}) => {
  return (
    <div
      className={`
        rounded-xl overflow-hidden
        ${
          elevated
            ? "shadow-md"
            : "border border-gray-200 dark:border-secondary-700"
        }
        ${
          hoverable
            ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            : ""
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-5 border-b ${className}`}>{children}</div>
);

export const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`p-5 border-t border-gray-200 dark:border-secondary-700 ${className}`}
  >
    {children}
  </div>
);

export default Card;
