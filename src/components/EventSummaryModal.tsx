import React, { useState, useEffect, useMemo } from "react";
import {
  createIcsContent,
  parseLocalDate,
  CalendarEvent,
} from "../utils/dateHelpers";
import { googleCalendarService } from "../utils/googleCalendar";
import { AppMode } from "../App";
import { EventTemplate, EVENT_COLORS, EVENT_COLORS_MAP } from "../utils/templates";

interface EventSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  selectedDates: Set<string>;
  appMode: AppMode;
  templates: EventTemplate[];
}

const EventSummaryModal: React.FC<EventSummaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  selectedDates,
  appMode,
  templates,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("school-dropoff");
  const [selectedPerson, setSelectedPerson] = useState<string>("Brandt");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedCalendar, setSelectedCalendar] = useState<string>((import.meta as any).env.VITE_GOOGLE_CALENDAR_ID || 'primary');

  // Work template specific state
  const [workStartTime, setWorkStartTime] = useState<string>("15:00");
  const [workEndTime, setWorkEndTime] = useState<string>("23:30");
  const [isWorkIncentive, setIsWorkIncentive] = useState<boolean>(false);

  // State for the "Builder" flow
  const [targetedDates, setTargetedDates] = useState<Set<string>>(new Set());
  const [queuedEvents, setQueuedEvents] = useState<CalendarEvent[]>([]);

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'configure' | 'review'>('configure');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const currentTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplate);
  }, [templates, selectedTemplate]);

  // Initialize targetedDates when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetedDates(new Set(selectedDates));
      setQueuedEvents([]); // Reset queue on new open
      setActiveTab('configure'); // Reset tab
      setSyncStatus('idle');
      setErrorMessage(null);

      if (appMode === "work_only") {
        setSelectedTemplate("hannah-work");
        setSelectedCalendar((import.meta as any).env.VITE_GOOGLE_CALENDAR_ID || 'primary');
      }

      // Reset work specific state
      const workTemplate = templates.find(t => t.id === "hannah-work");
      setWorkStartTime(workTemplate?.defaultStartTime || "15:00");
      setWorkEndTime(workTemplate?.defaultEndTime || "23:30");
      setIsWorkIncentive(false);

      setIsInitializing(true);
      // Pre-load Google scripts
      googleCalendarService.loadGoogleScripts()
        .then(() => googleCalendarService.initialize())
        .catch(err => console.error("Failed to init Google Service", err))
        .finally(() => setIsInitializing(false));
    }
  }, [isOpen, selectedDates, appMode]);

  // Update default color when template changes
  useEffect(() => {
    if (currentTemplate?.defaultColorId) {
      setSelectedColor(currentTemplate.defaultColorId);
    } else {
      setSelectedColor("");
    }
  }, [currentTemplate]);

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

  // Helper to generate event objects based on current state
  const generateEvents = (): CalendarEvent[] => {
    if (!currentTemplate) return [];

    const person = currentTemplate.personOptions?.length ? `(${selectedPerson})` : "";
    const commonLocation = "1300 N Prospect Rd, Ypsilanti, MI 48198";

    return Array.from(targetedDates)
      .sort()
      .map((dateStr) => {
        const date = parseLocalDate(dateStr);
        let startTime: string | undefined = currentTemplate.defaultStartTime;
        let endTime: string | undefined = currentTemplate.defaultEndTime;
        let location: string | undefined = currentTemplate.defaultLocation;

        if (currentTemplate.id === "school-dropoff") {
          // Defaults handle this, but leaving explicit override capability
        } else if (currentTemplate.id === "school-pickup" && date) {
          const day = date.dayOfWeek; // 1=Mon, ..., 7=Sun
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
        } else if (currentTemplate.id === "office-day") {
          // No specific time
        } else if (currentTemplate.id === "hannah-work") {
          startTime = workStartTime;
          endTime = workEndTime;
        }

        let summary = `${currentTemplate.name} ${person}`;
        if (currentTemplate.id === "hannah-work" && isWorkIncentive && startTime && endTime) {
           const formatTime = (t: string) => {
             const [h, m] = t.split(':').map(Number);
             const disp = h > 12 ? h - 12 : (h === 0 || h === 12 ? 12 : h);
             return m > 0 ? `${disp}:${m.toString().padStart(2, '0')}` : `${disp}`;
           };
           summary = `Work (Incentive ${formatTime(startTime)}-${formatTime(endTime)})`;
        }

        return {
          summary: summary.trim(),
          description: currentTemplate.description,
          date: dateStr,
          startTime,
          endTime,
          location,
          colorId: selectedColor || undefined,
          calendarId: selectedCalendar,
        };
      });
  };

  const handleAddEvents = () => {
    const newEvents = generateEvents();
    if (newEvents.length === 0) return;
    setQueuedEvents((prev) => [...prev, ...newEvents]);
  };

  // Direct submit for Work Only mode
  const handleWorkOnlySubmit = async () => {
    const events = generateEvents();
    if (events.length === 0) return;

    setIsSyncing(true);
    setSyncStatus('idle');
    setErrorMessage(null);

    try {
      await googleCalendarService.addEvents(events);
      setSyncStatus('success');
      onSuccess("Successfully added to calendar!");
    } catch (error: any) {
      console.error("Sync failed", error);
      setSyncStatus('error');
      const msg = error.message || "Failed to add events.";
      setErrorMessage(msg);
      onError(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveEvent = (index: number) => {
    setQueuedEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddToGoogleCalendar = async () => {
    if (queuedEvents.length === 0) return;

    setIsSyncing(true);
    setSyncStatus('idle');
    setErrorMessage(null);

    try {
      await googleCalendarService.addEvents(queuedEvents);
      setSyncStatus('success');
      onSuccess("Successfully added to calendar!");
    } catch (error: any) {
      console.error("Sync failed", error);
      setSyncStatus('error');
      const msg = error.message || "Failed to add events.";
      setErrorMessage(msg);
      onError(msg);
    } finally {
      setIsSyncing(false);
    }
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
        className={`fixed inset-0 z-45 flex items-center justify-center p-4 pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ display: isOpen ? "flex" : "none" }}
      >
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-4xl relative flex flex-col max-h-[90dvh] overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 p-1 leading-none text-2xl z-10"
            aria-label="Close"
          >
            &times;
          </button>

          <h2 className="text-2xl font-medium text-slate-100 mb-5 shrink-0">
            Create Events
          </h2>

          {/* Mobile Tab Switcher - Hidden in Work Only Mode */}
          {appMode !== "work_only" && (
            <div className="flex md:hidden bg-slate-700/50 p-1 rounded-xl mb-4 shrink-0">
              <button
                  onClick={() => setActiveTab('configure')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeTab === 'configure'
                      ? "bg-slate-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                  Configure
              </button>
              <button
                  onClick={() => setActiveTab('review')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeTab === 'review'
                      ? "bg-slate-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                  Review <span className="ml-1 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{queuedEvents.length}</span>
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 overflow-hidden flex-1 min-h-0">
            {/* Left Column: Configuration */}
            {/* Logic: Always show if work_only, otherwise follow activeTab */}
            <div className={`flex-1 flex-col gap-4 overflow-y-auto custom-scrollbar ${appMode === 'work_only' || activeTab === 'configure' ? 'flex' : 'hidden md:flex'}`}>

              {/* Template Selection */}
              <div className="bg-slate-700/50 p-4 rounded-xl space-y-3 shrink-0">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  1. Configure Event
                </h3>

                {appMode !== "work_only" && (
                  <>
                    <div>
                      <label htmlFor="eventCalendar" className="block text-sm font-medium text-slate-300 mb-1">
                        Calendar
                      </label>
                      <select id="eventCalendar"
                        value={selectedCalendar}
                        onChange={(e) => setSelectedCalendar(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={(import.meta as any).env.VITE_GOOGLE_CALENDAR_ID || 'primary'}>Shared</option>
                        <option value={(import.meta as any).env.VITE_GOOGLE_PERSONAL_CALENDAR_ID || 'brandt.bowling@gmail.com'}>Personal</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="eventType" className="block text-sm font-medium text-slate-300 mb-1">
                        Type
                      </label>
                      <select id="eventType"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
                      >
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {appMode === "work_only" && (
                  <div className="text-slate-400 text-sm italic">
                    Template locked to "Work"
                  </div>
                )}

                {currentTemplate?.personOptions && currentTemplate.personOptions.length > 0 && (
                  <div>
                    <label id="personGroupLabel" className="block text-sm font-medium text-slate-300 mb-1">
                      Person
                    </label>
                    <div className="flex gap-2" role="group" aria-labelledby="personGroupLabel">
                      {currentTemplate.personOptions.map((person) => (
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

                {/* Work Template Specifics */}
                {selectedTemplate === "hannah-work" && (
                  <div className="space-y-3 pt-2 border-t border-slate-600">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label htmlFor="workStartTime" className="block text-sm font-medium text-slate-300 mb-1">Start</label>
                        <input id="workStartTime"
                          type="time"
                          value={workStartTime}
                          onChange={(e) => setWorkStartTime(e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="workEndTime" className="block text-sm font-medium text-slate-300 mb-1">End</label>
                        <input id="workEndTime"
                          type="time"
                          value={workEndTime}
                          onChange={(e) => setWorkEndTime(e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                       <input
                          id="incentive-check"
                          type="checkbox"
                          checked={isWorkIncentive}
                          onChange={(e) => setIsWorkIncentive(e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-slate-700 border-slate-500 rounded focus:ring-primary-500 focus:ring-2"
                       />
                       <label htmlFor="incentive-check" className="ml-2 text-sm font-medium text-slate-300">
                          Incentive Shift
                       </label>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="eventColor" className="block text-sm font-medium text-slate-300 mb-1">
                    Color
                  </label>
                  <select id="eventColor"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Default</option>
                    {EVENT_COLORS.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Selection */}
              <div className="bg-slate-700/50 p-4 rounded-xl space-y-3 flex-1 overflow-y-auto">
                 <div className="flex justify-between items-center sticky top-0 bg-slate-700/0 backdrop-blur-sm pb-2 z-10">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      2. Select Dates
                    </h3>
                    <div className="flex gap-2 text-xs">
                        <button onClick={handleSelectAllTargetDates} className="text-primary-400 hover:text-primary-300">All</button>
                        <span className="text-slate-600">|</span>
                        <button onClick={handleClearTargetDates} className="text-primary-400 hover:text-primary-300">None</button>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-2 content-start">
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
                                 {date ? date.toLocaleString(undefined, { month: 'short', day: 'numeric', weekday: 'short' }) : dateStr}
                             </button>
                         )
                    })}
                 </div>
              </div>

              {appMode === 'work_only' ? (
                // Work Only Button: Add to Calendar
                <button
                    onClick={handleWorkOnlySubmit}
                    disabled={targetedDates.size === 0 || isSyncing || isInitializing}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
                >
                    {isSyncing || isInitializing ? (
                        <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isInitializing ? "Initializing..." : "Syncing..."}
                        </>
                    ) : (
                        <span>Add to Google Calendar</span>
                    )}
                </button>
              ) : (
                // Standard Button: Add to Queue
                <button
                    onClick={handleAddEvents}
                    disabled={targetedDates.size === 0}
                    className="w-full bg-slate-100 hover:bg-white text-slate-900 font-semibold py-3 px-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                    Add to Queue
                </button>
              )}
            </div>

            {/* Right Column: Review - Hidden in Work Only Mode */}
            {appMode !== 'work_only' && (
              <div className={`flex-1 bg-slate-900/50 rounded-xl p-4 flex-col min-h-0 ${activeTab === 'review' ? 'flex' : 'hidden md:flex'}`}>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 shrink-0">
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
                              const eventColor = event.colorId ? EVENT_COLORS_MAP[event.colorId] : undefined;

                              return (
                                  <div key={idx} className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex justify-between items-start group relative overflow-hidden">
                                      {eventColor && (
                                        <div
                                          className="absolute left-0 top-0 bottom-0 w-1.5"
                                          style={{ backgroundColor: eventColor.hex }}
                                        ></div>
                                      )}
                                      <div className={eventColor ? "pl-2" : ""}>
                                          <div className="font-medium text-slate-200 text-sm">
                                              {event.summary}
                                          </div>
                                          <div className="text-xs text-slate-400 mt-1">
                                              {date ? date.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : event.date}
                                              {event.startTime && ` • ${event.startTime}-${event.endTime}`}
                                          </div>
                                          {eventColor && (
                                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: eventColor.hex }}></div>
                                              {eventColor.name}
                                            </div>
                                          )}
                                      </div>
                                      <button
                                          onClick={() => handleRemoveEvent(idx)}
                                          className="text-slate-500 hover:text-red-400 p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                          aria-label="Remove event"
                                      >
                                          &times;
                                      </button>
                                  </div>
                              );
                          })
                      )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 shrink-0 space-y-2">
                      <button
                          onClick={handleAddToGoogleCalendar}
                          disabled={queuedEvents.length === 0 || isSyncing || isInitializing}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
                      >
                          {isSyncing || isInitializing ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {isInitializing ? "Initializing..." : "Syncing..."}
                            </>
                          ) : (
                            <>
                              <span>Add to Google Calendar</span>
                            </>
                          )}
                      </button>
                      {syncStatus === 'success' && (
                        <div className="text-green-400 text-sm text-center">
                          Successfully added to calendar!
                        </div>
                      )}
                      {syncStatus === 'error' && (
                        <div className="text-red-400 text-sm text-center px-2">
                          {errorMessage || "Failed to add events. Check console."}
                        </div>
                      )}

                      <button
                          onClick={handleDownloadIcs}
                          disabled={queuedEvents.length === 0}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                          Download .ics instead
                      </button>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventSummaryModal;
