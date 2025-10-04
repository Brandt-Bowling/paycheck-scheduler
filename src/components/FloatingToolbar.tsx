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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <div className="relative">
        {/* Speed Dial FAB Menu */}
        <div
          className={`absolute bottom-16 right-0 flex flex-col-reverse items-end gap-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <button
            onClick={onOpenPayModal}
            className="group flex items-center gap-2 p-2 pr-4 rounded-2xl bg-slate-800/90 backdrop-blur text-white shadow-lg transition-all hover:bg-slate-700/90 active:bg-slate-600/90"
          >
            <span className="w-10 h-10 flex items-center justify-center rounded-full bg-teal-600 group-hover:bg-teal-500">
              <PayIcon />
            </span>
            <span className="text-sm font-medium">Pay Estimator</span>
          </button>
          <button
            onClick={onOpenEventModal}
            className="group flex items-center gap-2 p-2 pr-4 rounded-2xl bg-slate-800/90 backdrop-blur text-white shadow-lg transition-all hover:bg-slate-700/90 active:bg-slate-600/90"
          >
            <span className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-600 group-hover:bg-sky-500">
              <CalendarIcon />
            </span>
            <span className="text-sm font-medium">Templates</span>
          </button>
        </div>
        {/* Main FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-600 text-white shadow-[0_4px_8px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-primary-500 active:bg-primary-700 ${
            isExpanded ? "rotate-45 bg-slate-800 hover:bg-slate-700" : ""
          }`}
          aria-label="Show options"
        >
          <svg
            className="w-6 h-6"
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
      </div>
    </div>
  );
};

export default FloatingToolbar;
