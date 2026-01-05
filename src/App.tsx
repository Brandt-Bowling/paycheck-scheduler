import FloatingToolbar from "./components/FloatingToolbar";
import { useState, useMemo, useEffect } from "react";
import Calendar from "./components/Calendar";
import EventSummaryModal from "./components/EventSummaryModal";
import PaycheckModal from "./components/PaycheckModal";
import Toast from "./components/Toast";
import AuthStatus from "./components/AuthStatus";
import { parseLocalDate } from "./utils/dateHelpers";
import { googleCalendarService } from "./utils/googleCalendar";

type NavKey = "calendar" | "paychecks" | "settings";

const App: React.FC = () => {
  const [selectedDates, setSelectedDates] = useState(new Set<string>());
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<NavKey>("calendar");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    // Initialize Google Calendar Service on mount
    googleCalendarService.loadGoogleScripts()
      .then(() => googleCalendarService.initialize())
      .catch((err) => console.error("Failed to init Google Service", err));
  }, []);

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
        <div className="row-start-1 col-start-1 flex flex-col">
          <Calendar
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
          />
        </div>
        <div className="row-start-1 col-start-1 pointer-events-none grid items-start justify-end p-4 sm:p-6 z-10">
           <AuthStatus />
        </div>
        <div className="row-start-1 col-start-1 pointer-events-none grid items-end justify-end p-4 sm:p-6 z-10">
          <FloatingToolbar
            onOpenEventModal={handleOpenEventModal}
            onOpenPayModal={() => setIsPayModalOpen(true)}
            selectedDates={selectedDates}
          />
        </div>
      </main>
    );
  } else if (selectedTab === "paychecks") {
    mainContent = (
      <main className="w-full px-3 pt-6 sm:pt-10 pb-28">
        <div className="mx-auto max-w-md">
          <div className="bg-slate-800 rounded-3xl shadow-xl p-5 sm:p-8">
            <header className="text-center mb-8">
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
            <header className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-medium text-slate-100">
                Settings
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                App settings and preferences (mockup).
              </p>
            </header>
            <div className="text-slate-300">Settings content goes here.</div>
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
