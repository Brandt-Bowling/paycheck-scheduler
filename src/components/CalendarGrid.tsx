import React from "react";
import { CalendarDayItem } from "../utils/dateHelpers";

interface CalendarGridProps {
  calendarGridData: CalendarDayItem[];
  selectedDates: Set<string>;
  todayDateString: string | null;
  onDateSelect: (dateString: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarGridData,
  selectedDates,
  todayDateString,
  onDateSelect,
}) => {
  return (
    <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1.5 h-full">
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
          dayClasses += " selected";
        }

        if (isToday) {
          dayClasses += " today";
        }

        const isTodayCircle = isToday && !isSelected;
        const numberClass = isTodayCircle
          ? "bg-sky-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-medium shadow-sm"
          : "";

        return (
          <div
            key={item.dateString}
            className={dayClasses}
            onClick={() => onDateSelect(item.dateString)}
          >
            <span className={numberClass}>{item.day}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGrid;
