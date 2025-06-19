import React, { useMemo } from "react";
import { parseLocalDate } from "../utils/dateHelpers";

interface EventSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDates: Set<string>;
}

interface PreparedEvent {
  summary: string;
  description: string;
  date: string;
}

const EventSummaryModal: React.FC<EventSummaryModalProps> = ({ isOpen, onClose, selectedDates }) => {
  const preparedEvents = useMemo<PreparedEvent[]>(() => {
    return Array.from(selectedDates)
      .sort()
      .map((dateStr) => ({
        summary: "Work",
        description: "Quickly added event.",
        date: dateStr,
      }));
  }, [selectedDates]);

  const handleCopy = async (): Promise<void> => {
    const json = JSON.stringify(preparedEvents, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      console.log("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy to clipboard. Check console for details or enable clipboard permissions.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      ></div>
      {/* Modal Content Wrapper/Dialog */}
      <div
        className={`fixed inset-0 z-45 flex items-center justify-center p-4 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        style={{ display: isOpen ? "flex" : "none" }} // Keep display logic for final visibility control
      >
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md relative">
          <button // Changed from span to button for accessibility
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 p-1 leading-none text-2xl" // Adjusted styling
            aria-label="Close event summary"
          >
            &times;
          </button>
          <h2 className="text-2xl font-medium text-slate-100 mb-5">
            Prepared Event Templates
          </h2>
          <div className="text-sm space-y-2.5 max-h-64 overflow-y-auto bg-slate-700 p-3.5 rounded-xl">
            {preparedEvents.length > 0 ? preparedEvents.map((event) => {
              const eventDate = parseLocalDate(event.date);
              return (
                <div
                  key={event.date}
                  className="border-b border-slate-600 pb-2.5 mb-2.5 last:border-b-0 last:mb-0"
                >
                  <p className="font-medium text-slate-100">{event.summary}</p>
                  <p className="text-slate-400">
                    Date:{" "}
                    {eventDate ? eventDate.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }) : 'Invalid Date'}
                  </p>
                </div>
              );
            }) : (
              <p className="text-slate-400">No dates selected to generate templates.</p>
            )}
          </div>
          <button
            onClick={handleCopy}
            disabled={preparedEvents.length === 0}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy Details
          </button>
        </div>
      </div>
    </>
  );
};
export default EventSummaryModal;
