import React, { useState } from "react";
import { AppMode } from "../App";

interface FloatingActionButtonProps {
  onOpenEventModal: () => void;
  onOpenPayModal: () => void;
  selectedDates: Set<string>;
  appMode: AppMode;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onOpenEventModal,
  onOpenPayModal,
  selectedDates,
  appMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedDates.size === 0) return null;

  if (appMode === "work_only") {
    return (
        <div className="relative flex flex-col-reverse items-end gap-3 pointer-events-none">
          <button
              onClick={onOpenEventModal}
              className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-primary-500 active:bg-primary-700"
              aria-label="Add Work Event"
          >
              <span className="material-symbols-outlined text-xl">calendar_today</span>
          </button>
        </div>
    );
  }

  return (
    <div className="relative flex flex-col-reverse items-end gap-3 pointer-events-none">
      {/* Main FAB */}
      <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-2xl bg-primary-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-primary-500 active:bg-primary-700 ${
            isExpanded ? "rotate-45 bg-slate-800 hover:bg-slate-700" : ""
          }`}
          aria-label={isExpanded ? "Close menu" : "Open menu"}
          aria-expanded={isExpanded}
        >
          <span className="material-symbols-outlined text-2xl sm:text-3xl">add</span>
        </button>

        {/* Speed Dial FAB Menu */}
        <div
          className={`flex flex-col items-end gap-3 transition-all duration-200 ease-in-out pr-1 sm:pr-2 ${
            isExpanded
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          {/* Secondary FABs */}
          <div className="flex items-center gap-3">
            <span className="text-white bg-slate-700 p-2 rounded-lg shadow-md">
              Pay Estimator
            </span>
            <button
              onClick={onOpenPayModal}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700 text-white shadow-md transition-all hover:bg-slate-600 active:bg-slate-800"
              aria-label="Pay Estimator"
            >
              <span className="material-symbols-outlined text-xl">attach_money</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white bg-slate-700 p-2 rounded-lg shadow-md">
              Templates
            </span>
            <button
              onClick={onOpenEventModal}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700 text-white shadow-md transition-all hover:bg-slate-600 active:bg-slate-800"
              aria-label="Templates"
            >
              <span className="material-symbols-outlined text-xl">calendar_today</span>
            </button>
          </div>
      </div>
    </div>
  );
};

export default FloatingActionButton;
