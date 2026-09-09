"use client";

import { FiPrinter } from "react-icons/fi";

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      <FiPrinter className="h-4 w-4" />
    </button>
  );
}
