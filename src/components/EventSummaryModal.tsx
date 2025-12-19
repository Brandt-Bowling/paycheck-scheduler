import React, { useMemo } from "react";
import { createIcsContent, parseLocalDate, CalendarEvent } from "../utils/dateHelpers";

interface EventSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDates: Set<string>;
}

// Reuse CalendarEvent type but it's identical to what we need
// interface PreparedEvent {
//   summary: string;
//   description: string;
//   date: string;
//   startTime?: string;
//   endTime?: string;
//   location?: string;
// }
// Use CalendarEvent from helpers

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
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<string>("school-dropoff");
  const [selectedPerson, setSelectedPerson] = React.useState<string>("Brandt");

  const preparedEvents = useMemo<CalendarEvent[]>(() => {
    const template = EVENT_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!template) return [];

    const person = template.personOptions ? `(${selectedPerson})` : "";
    const commonLocation = "1300 N Prospect Rd, Ypsilanti, MI 48198";

    return Array.from(selectedDates)
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
            // Mon(1), Wed(3), Fri(5) -> 2:55-3:00pm (14:55-15:00)
            // Tue(2), Thu(4) -> 11:55am-12:00pm (11:55-12:00)
            if (day === 2 || day === 4) {
                startTime = "11:55";
                endTime = "12:00";
            } else {
                // Default to M/W/F time for others or specifically check 1,3,5
                startTime = "14:55";
                endTime = "15:00";
            }
            location = commonLocation;
        } else if (template.id === "office-day") {
            // No specific time requested
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
  }, [selectedDates, selectedTemplate, selectedPerson]);

  const handleDownloadIcs = (): void => {
    if (preparedEvents.length === 0) return;

    const content = createIcsContent(preparedEvents);
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

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>
      {/* Modal Content Wrapper/Dialog */}
      <div
        className={`fixed inset-0 z-45 flex items-center justify-center p-4 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
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
            Create Events
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Event Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {EVENT_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {EVENT_TEMPLATES.find((t) => t.id === selectedTemplate)
              ?.personOptions && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Person
                </label>
                <div className="flex gap-3">
                  {EVENT_TEMPLATES.find(
                    (t) => t.id === selectedTemplate
                  )?.personOptions?.map((person) => (
                    <button
                      key={person}
                      onClick={() => setSelectedPerson(person)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                        selectedPerson === person
                          ? "bg-primary-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {person}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-sm space-y-2.5 max-h-64 overflow-y-auto bg-slate-700 p-3.5 rounded-xl mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              Selected Dates Preview
            </h3>
            {preparedEvents.length > 0 ? (
              preparedEvents.map((event) => {
                const eventDate = parseLocalDate(event.date);
                const timeString = event.startTime && event.endTime
                    ? ` • ${event.startTime}-${event.endTime}`
                    : "";

                return (
                  <div
                    key={event.date}
                    className="border-b border-slate-600 pb-2.5 mb-2.5 last:border-b-0 last:mb-0"
                  >
                    <p className="font-medium text-slate-100">
                      {event.summary} {timeString}
                    </p>
                    <p className="text-slate-400">
                      {eventDate
                        ? eventDate.toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        : "Invalid Date"}
                      {event.location ? ` • ${event.location}` : ""}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400">
                No dates selected to generate events.
              </p>
            )}
          </div>

          <button
            onClick={handleDownloadIcs}
            disabled={preparedEvents.length === 0}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Download Events (.ics)
          </button>
        </div>
      </div>
    </>
  );
};
export default EventSummaryModal;
