import React, { useState } from "react";
import { AppMode } from "../App";
import { parseLocalDate } from "../utils/dateHelpers";

interface FloatingActionButtonProps {
  onOpenEventModal: () => void;
  onOpenPayModal: () => void;
  appMode: AppMode;
  selectedDates?: Set<string>;
  onClearDate?: (dateString: string) => void;
  onQuickAdd?: () => void;
  isSyncing?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onOpenEventModal,
  onOpenPayModal,
  appMode,
  selectedDates = new Set(),
  onClearDate,
  onQuickAdd,
  isSyncing = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (appMode === "work_only") {
    const hasSelection = selectedDates.size > 0;
    const sortedDates = Array.from(selectedDates).sort();

    return (
      <div className={`pointer-events-none fixed inset-x-0 bottom-0 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))] px-4 sm:px-6 transition-transform duration-300 ease-in-out ${hasSelection ? "translate-y-0" : "translate-y-full"}`}>
        <div className="pointer-events-auto bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-4 max-w-md mx-auto flex flex-col gap-4">

          {/* Pills container */}
          <div className="flex overflow-x-auto gap-2 pb-1 custom-scrollbar snap-x">
            {sortedDates.map((dateStr) => {
              const date = parseLocalDate(dateStr);
              return (
                <div key={dateStr} className="flex-shrink-0 snap-start bg-slate-700 text-slate-200 text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-slate-600">
                  <span>{date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' }) : dateStr}</span>
                  <button
                    onClick={() => onClearDate && onClearDate(dateStr)}
                    className="hover:text-red-400 focus:outline-none transition-colors ml-1 p-0.5"
                    aria-label={`Remove ${dateStr}`}
                  >
                    <span className="material-symbols-outlined text-[16px] leading-none block">close</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onQuickAdd}
              disabled={isSyncing}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">add_task</span>
                  <span>Add {selectedDates.size} Work Shift{selectedDates.size !== 1 ? 's' : ''}</span>
                </>
              )}
            </button>
            <button
              onClick={onOpenEventModal}
              disabled={isSyncing}
              className="w-12 sm:w-14 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
              aria-label="Edit Details"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col-reverse items-end gap-3 pointer-events-none fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-10">
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
