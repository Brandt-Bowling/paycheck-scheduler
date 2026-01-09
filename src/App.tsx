import FloatingToolbar from "./components/FloatingToolbar";
import { useState, useMemo, useEffect } from "react";
import Calendar from "./components/Calendar";
import EventSummaryModal from "./components/EventSummaryModal";
import PaycheckModal from "./components/PaycheckModal";
import Toast from "./components/Toast";
import { parseLocalDate } from "./utils/dateHelpers";
import { googleCalendarService } from "./utils/googleCalendar";

type NavKey = "calendar" | "paychecks" | "settings";
export type AppMode = "standard" | "work_only";

const App: React.FC = () => {
  const [selectedDates, setSelectedDates] = useState(new Set<string>());
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<NavKey>("calendar");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem("appMode");
    return (saved as AppMode) || "work_only";
  });

  useEffect(() => {
    // Initialize Google Calendar Service on mount
    googleCalendarService.loadGoogleScripts()
      .then(() => googleCalendarService.initialize())
      .catch((err) => console.error("Failed to init Google Service", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("appMode", appMode);
  }, [appMode]);

  const handleShowToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const handleEventSuccess = (message: string) => {
    setIsEventModalOpen(false);
    setSelectedDates(new Set());
    handleShowToast(message);
  };

  const handleDateSelect = (dateString: string): void => {
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

  const handleOpenEventModal = async (): Promise<void> => {
    if (selectedDates.size === 0) {
      alert("Please select at least one date.");
      return;
    }

    if (!googleCalendarService.isAuthenticated()) {
      try {
        await googleCalendarService.authenticate();
        handleShowToast("Successfully authenticated with Google!");
      } catch (error) {
        console.error("Authentication failed", error);
        return; // Stop if auth failed
      }
    }

    setIsEventModalOpen(true);
  };

  const sortedSelectedDates = useMemo(
    () => Array.from(selectedDates).sort(),
    [selectedDates]
  );

  let mainContent;
  if (selectedTab === "calendar") {
    mainContent = (
      <main className="w-full h-[100dvh] grid grid-rows-1 grid-cols-1 bg-slate-900">
        <div className="row-start-1 col-start-1 flex flex-col h-full overflow-hidden">
          <Calendar
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
            onOpenSettings={() => setSelectedTab('settings')}
          />
        </div>
        <div className="row-start-1 col-start-1 pointer-events-none grid items-end justify-end p-4 sm:p-6 z-10">
          <FloatingToolbar
            onOpenEventModal={handleOpenEventModal}
            onOpenPayModal={() => setIsPayModalOpen(true)}
            selectedDates={selectedDates}
            appMode={appMode}
          />
        </div>
      </main>
    );
  } else if (selectedTab === "paychecks") {
    mainContent = (
      <main className="w-full px-3 pt-6 sm:pt-10 pb-28">
        <div className="mx-auto max-w-md">
          <div className="bg-slate-800 rounded-3xl shadow-xl p-5 sm:p-8">
            <header className="text-center mb-8 relative">
              <button
                  onClick={() => setSelectedTab('calendar')}
                  className="absolute left-0 top-1 text-slate-400 hover:text-slate-200"
              >
                  &larr; Back
              </button>
              <h1 className="text-3xl sm:text-4xl font-medium text-slate-100">
                Paychecks
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                View and manage your paychecks.
              </p>
            </header>
            <PaycheckModal
              isOpen={true}
              onClose={() => {}}
              selectedDates={selectedDates}
            />
          </div>
        </div>
      </main>
    );
  } else if (selectedTab === "settings") {
    mainContent = (
      <main className="w-full px-3 pt-6 sm:pt-10">
        <div className="mx-auto max-w-md">
          <div className="bg-slate-800 rounded-3xl shadow-xl p-5 sm:p-8">
            <header className="text-center mb-8 relative">
              <button
                onClick={() => setSelectedTab('calendar')}
                className="absolute left-0 top-1 text-slate-400 hover:text-slate-200"
              >
                &larr; Back
              </button>
              <h1 className="text-3xl sm:text-4xl font-medium text-slate-100">
                Settings
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Manage application preferences.
              </p>
            </header>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Application Mode
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setAppMode('standard')}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      appMode === 'standard'
                        ? 'bg-primary-600/20 border-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-slate-700/30 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium text-slate-200 mb-1">Standard</div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      Full access to all event templates and features.
                    </div>
                  </button>

                  <button
                    onClick={() => setAppMode('work_only')}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      appMode === 'work_only'
                        ? 'bg-primary-600/20 border-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-slate-700/30 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium text-slate-200 mb-1">Work Only</div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      Streamlined for Hannah Work. Direct access via the main button.
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      {mainContent}
      <PaycheckModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        selectedDates={selectedDates}
      />
      <EventSummaryModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSuccess={handleEventSuccess}
        onError={handleShowToast}
        selectedDates={selectedDates}
        appMode={appMode}
      />
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
};

export default App;
