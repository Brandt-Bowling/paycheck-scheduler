import React, { useState, useEffect, useMemo } from "react";

// --- Helper Functions & Constants ---
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatDateToYYYYMMDD = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return null;
  return date.toISOString().split("T")[0];
};

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// --- SVG Icons (as React Components) ---
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
    <path d="M8 14h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 14h.01"></path>
  </svg>
);

const PayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Calendar Component ---
const Calendar = ({ selectedDates, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Start with the first day of the current month
    return d;
  });

  const todayDateString = useMemo(() => formatDateToYYYYMMDD(new Date()), []);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const calendarGridData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Add blank days
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ type: "blank" });
    }
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        type: "day",
        day,
        dateString: formatDateToYYYYMMDD(new Date(year, month, day)),
      });
    }
    return days;
  }, [currentDate]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={handlePrevMonth}
          aria-label="Previous month"
          className="p-2.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeftIcon />
        </button>
        <h2 className="text-xl sm:text-2xl font-medium text-slate-200">
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={handleNextMonth}
          aria-label="Next month"
          className="p-2.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronRightIcon />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-sm sm:text-base">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="font-medium text-slate-500 py-2 text-xs sm:text-sm"
          >
            {day}
          </div>
        ))}
        {calendarGridData.map((item, index) => {
          if (item.type === "blank") {
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
            "calendar-day text-slate-300 p-1 sm:p-2 border border-slate-700 hover:border-slate-600 rounded-xl cursor-pointer transition-colors flex items-center justify-center aspect-square";
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
              onClick={() => onDateSelect(item.dateString)}
            >
              {item.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Paycheck Modal Component ---
const PaycheckModal = ({ isOpen, onClose, selectedDates }) => {
  const [payRate, setPayRate] = useState("20");
  const [hoursPerEvent, setHoursPerEvent] = useState("8");
  const [takeHomePercent, setTakeHomePercent] = useState("70");
  const [payPeriodLength, setPayPeriodLength] = useState("14");
  const [payPeriodStart, setPayPeriodStart] = useState("");

  const [paycheck, setPaycheck] = useState({
    eventsInPeriod: 0,
    totalHours: 0,
    grossPay: 0,
    takeHomePay: 0,
  });

  useEffect(() => {
    // Set default start date on mount
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const defaultStartDate = new Date();
    defaultStartDate.setDate(today.getDate() + diffToMonday);
    setPayPeriodStart(formatDateToYYYYMMDD(defaultStartDate));
  }, []);

  useEffect(() => {
    const rate = parseFloat(payRate) || 0;
    const hours = parseFloat(hoursPerEvent) || 0;
    const percent = parseFloat(takeHomePercent) || 0;
    const length = parseInt(payPeriodLength);

    if (!payPeriodStart) return;

    const periodStartDate = parseLocalDate(payPeriodStart);
    if (!periodStartDate) return;

    const periodEndDate = new Date(periodStartDate);
    periodEndDate.setDate(periodStartDate.getDate() + length - 1);

    let eventsInCurrentPeriod = 0;
    selectedDates.forEach((dateStr) => {
      const eventDate = parseLocalDate(dateStr);
      if (eventDate >= periodStartDate && eventDate <= periodEndDate) {
        eventsInCurrentPeriod++;
      }
    });

    const totalHoursInPeriod = eventsInCurrentPeriod * hours;
    const grossPay = totalHoursInPeriod * rate;
    const takeHomePay = grossPay * (percent / 100);

    setPaycheck({
      eventsInPeriod: eventsInCurrentPeriod,
      totalHours: totalHoursInPeriod,
      grossPay: grossPay,
      takeHomePay: takeHomePay,
    });
  }, [
    selectedDates,
    payRate,
    hoursPerEvent,
    takeHomePercent,
    payPeriodLength,
    payPeriodStart,
  ]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop active" onClick={onClose}></div>
      <div className="bottom-sheet-modal active">
        <div className="bottom-sheet-header">
          <h2 className="bottom-sheet-title">Paycheck Estimator</h2>
          <button
            onClick={onClose}
            className="bottom-sheet-close-button"
            aria-label="Close paycheck settings"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="bottom-sheet-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label htmlFor="payRate" className="form-label">
                Hourly Pay Rate ($)
              </label>
              <input
                type="number"
                id="payRate"
                className="form-input"
                value={payRate}
                onChange={(e) => setPayRate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="hoursPerEvent" className="form-label">
                Hours per Event
              </label>
              <input
                type="number"
                id="hoursPerEvent"
                className="form-input"
                value={hoursPerEvent}
                onChange={(e) => setHoursPerEvent(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="takeHomePercent" className="form-label">
                Take-Home (%)
              </label>
              <input
                type="number"
                id="takeHomePercent"
                className="form-input"
                value={takeHomePercent}
                onChange={(e) => setTakeHomePercent(e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div>
              <label htmlFor="payPeriodLength" className="form-label">
                Pay Period Length
              </label>
              <select
                id="payPeriodLength"
                className="form-select"
                value={payPeriodLength}
                onChange={(e) => setPayPeriodLength(e.target.value)}
              >
                <option value="7">Weekly (7 days)</option>
                <option value="14">Bi-weekly (14 days)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="payPeriodStart" className="form-label">
                Pay Period Start Date
              </label>
              <input
                type="date"
                id="payPeriodStart"
                className="form-input"
                value={payPeriodStart}
                onChange={(e) => setPayPeriodStart(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6 bg-slate-700/50 p-4 rounded-xl">
            <h3 className="text-lg font-medium text-slate-200 mb-3">
              Estimated Pay for Period:
            </h3>
            <div id="paySummary" className="space-y-1 text-sm">
              <div className="pay-summary-item">
                <span className="pay-summary-label">Work Events:</span>
                <span className="pay-summary-value">
                  {paycheck.eventsInPeriod}
                </span>
              </div>
              <div className="pay-summary-item">
                <span className="pay-summary-label">Total Hours:</span>
                <span className="pay-summary-value">
                  {paycheck.totalHours.toFixed(1)} hrs
                </span>
              </div>
              <div className="pay-summary-item">
                <span className="pay-summary-label">Gross Pay:</span>
                <span className="pay-summary-value">
                  ${paycheck.grossPay.toFixed(2)}
                </span>
              </div>
              <div className="pay-summary-item">
                <span className="pay-summary-label">Est. Take-Home:</span>
                <span className="pay-summary-value">
                  ${paycheck.takeHomePay.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-5 rounded-full"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

// --- Event Summary Modal Component ---
const EventSummaryModal = ({ isOpen, onClose, selectedDates }) => {
  const preparedEvents = useMemo(() => {
    return Array.from(selectedDates)
      .sort()
      .map((dateStr) => ({
        summary: "Work",
        description: "Quickly added event.",
        date: dateStr,
      }));
  }, [selectedDates]);

  const handleCopy = () => {
    const json = JSON.stringify(preparedEvents, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      // You could add a "copied" message here
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop active" onClick={onClose}></div>
      <div className="modal-content-wrapper" style={{ display: "flex" }}>
        <div className="modal-dialog">
          <span onClick={onClose} className="modal-close-button">
            &times;
          </span>
          <h2 className="text-2xl font-medium text-slate-100 mb-5">
            Prepared Event Templates
          </h2>
          <div className="text-sm space-y-2.5 max-h-64 overflow-y-auto bg-slate-700 p-3.5 rounded-xl">
            {preparedEvents.map((event) => (
              <div
                key={event.date}
                className="border-b border-slate-600 pb-2.5 mb-2.5 last:border-b-0 last:mb-0"
              >
                <p className="font-medium text-slate-100">{event.summary}</p>
                <p className="text-slate-400">
                  Date:{" "}
                  {parseLocalDate(event.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-5 rounded-full"
          >
            Copy Details
          </button>
        </div>
      </div>
    </>
  );
};

// --- Main App Component ---
export default function App() {
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const handleDateSelect = (dateString) => {
    setSelectedDates((prevDates) => {
      const newDates = new Set(prevDates);
      if (newDates.has(dateString)) {
        newDates.delete(dateString);
      } else {
        newDates.add(dateString);
      }
      return newDates;
    });
  };

  const handleOpenEventModal = () => {
    if (selectedDates.size === 0) {
      // You could implement a toast notification system here
      alert("Please select at least one date.");
      return;
    }
    setIsEventModalOpen(true);
  };

  const sortedSelectedDates = useMemo(
    () => Array.from(selectedDates).sort(),
    [selectedDates]
  );

  return (
    <>
      <main className="w-full px-3 pt-6 sm:pt-10 pb-28">
        <div className="mx-auto max-w-md">
          <div className="bg-slate-800 rounded-3xl shadow-xl p-5 sm:p-8">
            <header className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-medium text-slate-100">
                Quick Event Adder
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Select dates to add a "Work" event.
              </p>
            </header>
            <Calendar
              selectedDates={selectedDates}
              onDateSelect={handleDateSelect}
            />
            <div className="mt-8">
              <h3 className="text-base font-medium text-slate-300 mb-2.5">
                Selected Dates:
              </h3>
              <div className="min-h-[48px] bg-slate-700 p-3 rounded-xl text-slate-300 text-sm overflow-y-auto max-h-[100px]">
                {sortedSelectedDates.length > 0
                  ? sortedSelectedDates.map((dateStr) => (
                      <span
                        key={dateStr}
                        className="inline-block bg-sky-700 text-sky-100 px-3 py-1.5 rounded-full text-xs font-medium mr-1.5 mb-1.5"
                      >
                        {parseLocalDate(dateStr).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    ))
                  : "No dates selected."}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="floating-toolbar-container">
        <div className="floating-toolbar">
          <button
            onClick={handleOpenEventModal}
            className="toolbar-button bg-sky-600 hover:bg-sky-700 text-white"
          >
            <CalendarIcon />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setIsPayModalOpen(true)}
            className="toolbar-button bg-teal-600 hover:bg-teal-700 text-white"
          >
            <PayIcon />
            <span>Pay Estimator</span>
          </button>
        </div>
      </div>

      <PaycheckModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        selectedDates={selectedDates}
      />
      <EventSummaryModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        selectedDates={selectedDates}
      />
    </>
  );
}
