import React, { useState } from "react";
import CalendarIcon from "./icons/CalendarIcon";
import PayIcon from "./icons/PayIcon";

interface FloatingToolbarProps {
  onOpenEventModal: () => void;
  onOpenPayModal: () => void;
  selectedDates: Set<string>;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  onOpenEventModal,
  onOpenPayModal,
  selectedDates,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedDates.size === 0) return null;

  return (
    <div className="w-full h-full flex justify-end items-end p-4 sm:p-6">
      <div className="relative flex flex-col-reverse items-center gap-3 pointer-events-auto">
        {/* Main FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-2xl bg-primary-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-primary-500 active:bg-primary-700 ${
            isExpanded ? "rotate-45 bg-slate-800 hover:bg-slate-700" : ""
          }`}
          aria-label={isExpanded ? "Close menu" : "Open menu"}
          aria-expanded={isExpanded}
        >
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>

        {/* Speed Dial FAB Menu */}
        <div
          className={`flex flex-col items-center gap-3 transition-all duration-200 ease-in-out ${
            isExpanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          {/* Secondary FABs */}
          <button
            onClick={onOpenPayModal}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700 text-white shadow-md transition-all hover:bg-slate-600 active:bg-slate-800"
            aria-label="Pay Estimator"
          >
            <PayIcon />
          </button>
          <button
            onClick={onOpenEventModal}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700 text-white shadow-md transition-all hover:bg-slate-600 active:bg-slate-800"
            aria-label="Templates"
          >
            <CalendarIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingToolbar;