import React, { useState, useMemo } from "react";
import { DAY_NAMES, MONTH_NAMES, formatDateToYYYYMMDD } from "../utils/dateHelpers";
import AuthStatus from "./AuthStatus";
import { AppMode } from "../App";

interface CalendarProps {
  selectedDates: Set<string>;
  onDateSelect: (dateString: string) => void;
  onOpenSettings: () => void;
  appMode: AppMode;
}

interface CalendarDayItem {
  day: number;
  dateString: string;
  isCurrentMonth: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDates, onDateSelect, onOpenSettings, appMode }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Start with the first day of the current month
    return d;
  });

  const todayDateString = useMemo(() => formatDateToYYYYMMDD(new Date()), []);

  const handlePrevMonth = (): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = (): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const calendarGridData = useMemo<CalendarDayItem[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    // Grid always starts on Sunday (0).
    // Calculate the offset to the first day of the grid.
    // If month starts on Sunday (0), offset is 1 (1st day).
    // If month starts on Tuesday (2), offset is 1 - 2 = -1 (Last day of prev month is 0, so -1 is 2nd to last).
    // The loop uses 1-based day index logic relative to current month.
    const startOffset = 1 - firstDayOfWeek;
    const totalSlots = 42; // 6 rows * 7 columns

    const days: CalendarDayItem[] = [];

    for (let i = 0; i < totalSlots; i++) {
        const dayOffset = startOffset + i;
        const date = new Date(year, month, dayOffset);

        // Manual date string construction to avoid timezone issues and ensure local YYYY-MM-DD
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        days.push({
            day: date.getDate(),
            dateString,
            isCurrentMonth: date.getMonth() === month
        });
    }

    return days;
  }, [currentDate]);

  return (
    <div className="flex-1 flex flex-col pt-safe-top">
      {/* Header */}
      <header className="flex justify-between items-start pt-8 pb-4 gap-4 px-4">
        <div>
          <h1 className="text-2xl font-medium text-slate-100 text-left">
            You go work?
          </h1>
          <p className="text-sm text-slate-400/80 mt-1 text-left">
            {appMode === "work_only" ? 'Select dates to add a "Work" event' : "Select dates to add events"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <AuthStatus />
            <button
                onClick={onOpenSettings}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700 shadow-lg"
                aria-label="Settings"
            >
                <span className="material-symbols-outlined text-base leading-none">settings</span>
            </button>
        </div>
      </header>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5 px-4">
        <button
          onClick={handlePrevMonth}
          aria-label="Previous month"
          className="p-2.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-medium text-slate-200">
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={handleNextMonth}
          aria-label="Next month"
          className="p-2.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">chevron_right</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col pb-2 px-2">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-sm sm:text-base">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="font-medium text-slate-500 py-2 text-xs sm:text-sm"
            >
              {day}
            </div>
          ))}
        </div>
        {/* Dates Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1.5">
          {calendarGridData.map((item) => {
            const isSelected = selectedDates.has(item.dateString);
            const isToday = item.dateString === todayDateString;

            let dayClasses = "calendar-day rounded-xl cursor-pointer transition-colors flex items-center justify-center border ";

            // Base styling depending on whether it's the current month
            if (item.isCurrentMonth) {
                dayClasses += "text-slate-300 border-slate-700 hover:border-slate-600 ";
            } else {
                dayClasses += "text-slate-600 border-slate-800 hover:border-slate-700 ";
            }

            // Selection and Today states override/append
            if (isSelected) {
              // Ensure selected state looks good even if it's a prev/next month date
              dayClasses += " selected";
              // Note: 'selected' class in CSS/Tailwind usually sets background/border.
              // We might need to check if 'selected' handles text color.
              // Assuming global CSS or tailwind classes handle bg-primary etc.
              // Let's rely on the previous implementation's 'selected' handling if it was class-based,
              // but here we are constructing className string.
              // Previous code: `if (isSelected) dayClasses += " selected";`
              // I should look at `index.css` or verify what `selected` does.
              // If `selected` isn't a defined utility, it might be a custom class.
            }

            if (isToday) {
              dayClasses += " today";
              if (!isSelected) {
                dayClasses += " text-sky-400";
              }
            }

            return (
              <div
                key={item.dateString}
                className={dayClasses}
                onClick={() => onDateSelect(item.dateString)}
              >
                {item.day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default Calendar;
