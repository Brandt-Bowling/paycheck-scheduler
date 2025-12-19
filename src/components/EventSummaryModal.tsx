import React, { useState, useEffect, useMemo } from "react";
import {
  createIcsContent,
  parseLocalDate,
  CalendarEvent,
} from "../utils/dateHelpers";

interface EventSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDates: Set<string>;
}

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  personOptions?: string[];
}

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: "school-dropoff",
    name: "School Drop Off",
    description: "School drop off duty",
    personOptions: ["Brandt", "Hannah"],
  },
  {
    id: "school-pickup",
    name: "School Pick Up",
    description: "School pick up duty",
    personOptions: ["Brandt", "Hannah"],
  },
  {
    id: "office-day",
    name: "Office Day",
    description: "Brandt's office day",
  },
];

const EventSummaryModal: React.FC<EventSummaryModalProps> = ({
  isOpen,
  onClose,
  selectedDates,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("school-dropoff");
  const [selectedPerson, setSelectedPerson] = useState<string>("Brandt");

  // State for the "Builder" flow
  const [targetedDates, setTargetedDates] = useState<Set<string>>(new Set());
  const [queuedEvents, setQueuedEvents] = useState<CalendarEvent[]>([]);

  // Initialize targetedDates when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetedDates(new Set(selectedDates));
      setQueuedEvents([]); // Reset queue on new open
    }
  }, [isOpen, selectedDates]);

  const handleToggleTargetDate = (date: string) => {
    setTargetedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const handleSelectAllTargetDates = () => {
    setTargetedDates(new Set(selectedDates));
  };

  const handleClearTargetDates = () => {
    setTargetedDates(new Set());
  };

  const handleAddEvents = () => {
    const template = EVENT_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!template) return;

    const person = template.personOptions ? `(${selectedPerson})` : "";
    const commonLocation = "1300 N Prospect Rd, Ypsilanti, MI 48198";

    const newEvents = Array.from(targetedDates)
      .sort()
      .map((dateStr) => {
        const date = parseLocalDate(dateStr);
        let startTime: string | undefined;
        let endTime: string | undefined;
        let location: string | undefined;

        if (template.id === "school-dropoff") {
          startTime = "07:50";
          endTime = "08:00";
          location = commonLocation;
        } else if (template.id === "school-pickup" && date) {
          const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
          // Tue(2), Thu(4) -> 11:55am-12:00pm
          if (day === 2 || day === 4) {
            startTime = "11:55";
            endTime = "12:00";
          } else {
            // Mon, Wed, Fri -> 2:55-3:00pm
            startTime = "14:55";
            endTime = "15:00";
          }
          location = commonLocation;
        } else if (template.id === "office-day") {
          // No specific time
        }

        return {
          summary: `${template.name} ${person}`,
          description: template.description,
          date: dateStr,
          startTime,
          endTime,
          location,
        };
      });

    setQueuedEvents((prev) => [...prev, ...newEvents]);
    // Optionally clear targeted dates or keep them.
    // Keeping them allows for "Add Office Day to these same dates" quickly.
    // But maybe visual feedback is needed.
  };

  const handleRemoveEvent = (index: number) => {
    setQueuedEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadIcs = () => {
    if (queuedEvents.length === 0) return;

    const content = createIcsContent(queuedEvents);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "calendar_events.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  // Sort available dates for display
  const availableDatesList = Array.from(selectedDates).sort();

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div
        className={`fixed inset-0 z-45 flex items-center justify-center p-4 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ display: isOpen ? "flex" : "none" }}
      >
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 p-1 leading-none text-2xl"
            aria-label="Close"
          >
            &times;
          </button>

          <h2 className="text-2xl font-medium text-slate-100 mb-5">
            Create Events
          </h2>

          <div className="flex flex-col md:flex-row gap-6 overflow-hidden">
            {/* Left Column: Configuration */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              {/* Template Selection */}
              <div className="bg-slate-700/50 p-4 rounded-xl space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  1. Configure Event
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
                  >
                    {EVENT_TEMPLATES.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {EVENT_TEMPLATES.find((t) => t.id === selectedTemplate)?.personOptions && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Person
                    </label>
                    <div className="flex gap-2">
                      {EVENT_TEMPLATES.find((t) => t.id === selectedTemplate)?.personOptions?.map((person) => (
                        <button
                          key={person}
                          onClick={() => setSelectedPerson(person)}
                          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                            selectedPerson === person
                              ? "bg-primary-600 text-white"
                              : "bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {person}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div className="bg-slate-700/50 p-4 rounded-xl space-y-3 flex-1">
                 <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      2. Select Dates
                    </h3>
                    <div className="flex gap-2 text-xs">
                        <button onClick={handleSelectAllTargetDates} className="text-primary-400 hover:text-primary-300">All</button>
                        <span className="text-slate-600">|</span>
                        <button onClick={handleClearTargetDates} className="text-primary-400 hover:text-primary-300">None</button>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-2">
                    {availableDatesList.map((dateStr) => {
                         const date = parseLocalDate(dateStr);
                         const isSelected = targetedDates.has(dateStr);
                         return (
                             <button
                                key={dateStr}
                                onClick={() => handleToggleTargetDate(dateStr)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                    isSelected
                                    ? "bg-primary-600/20 border-primary-500 text-primary-200"
                                    : "bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500"
                                }`}
                             >
                                 {date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' }) : dateStr}
                             </button>
                         )
                    })}
                 </div>
              </div>

              <button
                onClick={handleAddEvents}
                disabled={targetedDates.size === 0}
                className="w-full bg-slate-100 hover:bg-white text-slate-900 font-semibold py-3 px-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add to Queue
              </button>
            </div>

            {/* Right Column: Review */}
            <div className="flex-1 bg-slate-900/50 rounded-xl p-4 flex flex-col min-h-[300px]">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Queued Events ({queuedEvents.length})
                </h3>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {queuedEvents.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                            No events added yet.
                        </div>
                    ) : (
                        queuedEvents.map((event, idx) => {
                            const date = parseLocalDate(event.date);
                            return (
                                <div key={idx} className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex justify-between items-start group">
                                    <div>
                                        <div className="font-medium text-slate-200 text-sm">
                                            {event.summary}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {date ? date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : event.date}
                                            {event.startTime && ` • ${event.startTime}-${event.endTime}`}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveEvent(idx)}
                                        className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Remove event"
                                    >
                                        &times;
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700">
                    <button
                        onClick={handleDownloadIcs}
                        disabled={queuedEvents.length === 0}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-900/20"
                    >
                        Download .ics
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventSummaryModal;
