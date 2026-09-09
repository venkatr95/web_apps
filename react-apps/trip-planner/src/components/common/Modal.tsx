import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  footer,
}) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto"; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const modalClasses = `
    fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6
  `;

  const backdropClasses = `
    absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity
    ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
  `;

  const contentClasses = `
    w-full ${sizeClasses[size]} rounded-lg shadow-xl transform transition-all
    ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}
    ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
  `;

  return (
    <div className={modalClasses} aria-modal="true" role="dialog">
      <div className={backdropClasses} />

      <div ref={modalRef} className={contentClasses}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
            icon={<X size={18} />}
          />
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
