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
  type: "blank" | "day";
  day?: number;
  dateString?: string;
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
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDayItem[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ type: "blank" });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        type: "day",
        day,
        dateString: formatDateToYYYYMMDD(new Date(year, month, day)) || undefined, // Ensure string or undefined
      });
    }
    return days;
  }, [currentDate]);

  return (
    <div className="flex-1 flex flex-col pt-safe-top px-4">
      {/* Header */}
      <header className="flex justify-between items-start pt-8 pb-4 gap-4">
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
                className="p-1.5 flex items-center justify-center text-slate-400 hover:text-slate-200 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700 shadow-lg"
                aria-label="Settings"
            >
                <span className="material-symbols-outlined text-base leading-none">settings</span>
            </button>
        </div>
      </header>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5">
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
      <div className="flex-1 flex flex-col pb-4">
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
          {calendarGridData.map((item, index) => {
            if (item.type === "blank" || !item.dateString) {
              return (
                <div
                  key={`blank-${index}`}
                  className="calendar-day disabled p-1 sm:p-2 border border-transparent rounded-xl opacity-60"
                ></div>
              );
            }

            const isSelected = selectedDates.has(item.dateString);
            const isToday = item.dateString === todayDateString;

            let dayClasses =
              "calendar-day text-slate-300 border border-slate-700 hover:border-slate-600 rounded-xl cursor-pointer transition-colors flex items-center justify-center";
            if (isSelected) {
              dayClasses += " selected";
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
                onClick={() => onDateSelect(item.dateString as string)}
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
