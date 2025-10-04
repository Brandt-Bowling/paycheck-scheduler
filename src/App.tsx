import FloatingToolbar from "./components/FloatingToolbar";
import { useState, useMemo } from "react";
import Calendar from "./components/Calendar";
import EventSummaryModal from "./components/EventSummaryModal";
import PaycheckModal from "./components/PaycheckModal";
import { parseLocalDate } from "./utils/dateHelpers";

type NavKey = "calendar" | "paychecks" | "settings";

const App: React.FC = () => {
  const [selectedDates, setSelectedDates] = useState(new Set<string>());
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<NavKey>("calendar");

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

  const handleOpenEventModal = (): void => {
    if (selectedDates.size === 0) {
      alert("Please select at least one date.");
      return;
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
      <main className="w-full h-[100dvh] flex flex-col bg-slate-900">
        <Calendar
          selectedDates={selectedDates}
          onDateSelect={handleDateSelect}
        />

        <FloatingToolbar
          onOpenEventModal={handleOpenEventModal}
          onOpenPayModal={() => setIsPayModalOpen(true)}
          selectedDates={selectedDates}
        />
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
        selectedDates={selectedDates}
      />
    </div>
  );
};

export default App;
