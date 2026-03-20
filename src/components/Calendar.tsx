import React, { useState, useMemo, useRef } from "react";
import { DAY_NAMES, MONTH_NAMES, formatDateToYYYYMMDD, getCalendarGridData } from "../utils/dateHelpers";
import AuthStatus from "./AuthStatus";
import CalendarGrid from "./CalendarGrid";
import { AppMode } from "../App";

interface CalendarProps {
  selectedDates: Set<string>;
  onDateSelect: (dateString: string) => void;
  onOpenSettings: () => void;
  appMode: AppMode;
}

const SWIPE_THRESHOLD = 50; // Minimum distance to trigger a swipe
const SNAP_VELOCITY = 0.5; // Optional: velocity-based swipe

const Calendar: React.FC<CalendarProps> = ({ selectedDates, onDateSelect, onOpenSettings, appMode }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Start with the first day of the current month
    return d;
  });

  // Swipe State
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [animatingDirection, setAnimatingDirection] = useState<'prev' | 'next' | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const getPrevMonthDate = (date: Date) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    return newDate;
  };

  const getNextMonthDate = (date: Date) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    return newDate;
  };

  const prevMonthDate = useMemo(() => getPrevMonthDate(currentDate), [currentDate]);
  const nextMonthDate = useMemo(() => getNextMonthDate(currentDate), [currentDate]);

  const prevCalendarGridData = useMemo(() => getCalendarGridData(prevMonthDate), [prevMonthDate]);
  const calendarGridData = useMemo(() => getCalendarGridData(currentDate), [currentDate]);
  const nextCalendarGridData = useMemo(() => getCalendarGridData(nextMonthDate), [nextMonthDate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = touchStartX.current;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;

    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;

    // Prevent default scroll behavior while swiping horizontally
    if (Math.abs(diff) > 10) {
      // It's a bit tricky to preventDefault in React synthetic events
      // We rely on CSS touch-action: pan-y or similar on the container if needed.
    }

    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchCurrentX.current || !containerRef.current) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }

    const diff = touchCurrentX.current - touchStartX.current;
    const width = containerRef.current.offsetWidth;
    const threshold = Math.min(SWIPE_THRESHOLD, width / 3);

    setIsSwiping(false);

    if (diff > threshold) {
      // Swiped right -> prev month
      setAnimatingDirection('prev');
      setSwipeOffset(width); // Snap to previous month
    } else if (diff < -threshold) {
      // Swiped left -> next month
      setAnimatingDirection('next');
      setSwipeOffset(-width); // Snap to next month
    } else {
      // Snap back to current
      setSwipeOffset(0);
    }

    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  const handleTransitionEnd = () => {
    if (animatingDirection === 'prev') {
      handlePrevMonth();
    } else if (animatingDirection === 'next') {
      handleNextMonth();
    }

    // Reset state silently
    if (animatingDirection) {
      // Disable transition temporarily while resetting position
      setIsSwiping(true);
      setSwipeOffset(0);
      setAnimatingDirection(null);

      // Re-enable transition after the browser has guaranteed a reflow/repaint
      // using a double requestAnimationFrame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSwiping(false);
        });
      });
    }
  };

  const handleDateSelectWrapper = (dateString: string) => {
    // Only allow click if not swiping significantly
    if (Math.abs(swipeOffset) < 10) {
      onDateSelect(dateString);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom">
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

      {/* Calendar Grid Container */}
      <div
        className="flex-1 flex flex-col pb-2 overflow-hidden relative"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Day Names Header (Static) */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-sm sm:text-base px-2 z-10 bg-slate-900">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="font-medium text-slate-500 py-2 text-xs sm:text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Swipeable Area */}
        <div
          ref={containerRef}
          className="flex-1 relative w-full h-full select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* We use a wide container that holds 3 months side-by-side */}
          <div
            className="absolute top-0 left-0 w-[300%] h-full flex"
            style={{
              transform: `translateX(calc(-33.333% + ${swipeOffset}px))`,
              transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {/* Previous Month */}
            <div className="w-1/3 h-full px-2 flex-shrink-0">
              <CalendarGrid
                calendarGridData={prevCalendarGridData}
                selectedDates={selectedDates}
                todayDateString={todayDateString}
                onDateSelect={handleDateSelectWrapper}
              />
            </div>

            {/* Current Month */}
            <div className="w-1/3 h-full px-2 flex-shrink-0">
              <CalendarGrid
                calendarGridData={calendarGridData}
                selectedDates={selectedDates}
                todayDateString={todayDateString}
                onDateSelect={handleDateSelectWrapper}
              />
            </div>

            {/* Next Month */}
            <div className="w-1/3 h-full px-2 flex-shrink-0">
              <CalendarGrid
                calendarGridData={nextCalendarGridData}
                selectedDates={selectedDates}
                todayDateString={todayDateString}
                onDateSelect={handleDateSelectWrapper}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Calendar;
