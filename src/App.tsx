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
      <main className="w-full h-[100dvh] flex flex-col overflow-hidden bg-slate-900 relative">
        {/* Header with gradient overlay */}
        <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-transparent pt-12 pb-16 pointer-events-none">
          <header className="text-center">
            <h1 className="text-2xl font-medium text-slate-100">
              Quick Event Adder
            </h1>
            <p className="text-sm text-slate-400/80 mt-1">
              Select dates to add a "Work" event
            </p>
          </header>
        </div>

        {/* Calendar container */}
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <Calendar
              selectedDates={selectedDates}
              onDateSelect={handleDateSelect}
            />
          </div>
        </div>

        {/* Selected dates with gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent pb-6 pt-16 pointer-events-none">
          <div className="px-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2 opacity-80">
              Selected Dates
            </h3>
            <div className="min-h-[40px] text-slate-300 text-sm overflow-y-auto max-h-[80px] flex flex-wrap gap-1.5">
              {sortedSelectedDates.length > 0 ? (
                sortedSelectedDates.map((dateStr) => {
                  const parsedDate = parseLocalDate(dateStr);
                  return (
                    <span
                      key={dateStr}
                      className="inline-block bg-sky-700 text-sky-100 px-3 py-1.5 rounded-full text-xs font-medium"
                    >
                      {parsedDate
                        ? parsedDate.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : "Invalid Date"}
                    </span>
                  );
                })
              ) : (
                <span>No dates selected.</span>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
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
