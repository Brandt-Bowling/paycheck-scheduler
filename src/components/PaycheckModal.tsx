import React, { useState, useEffect, ChangeEvent } from "react";
import { formatDateToYYYYMMDD, parseLocalDate } from "../utils/dateHelpers";

interface PaycheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDates: Set<string>;
}

interface PaycheckState {
  eventsInPeriod: number;
  totalHours: number;
  grossPay: number;
  takeHomePay: number;
}

const PaycheckModal: React.FC<PaycheckModalProps> = ({ isOpen, onClose, selectedDates }) => {
  const [payRate, setPayRate] = useState("20");
  const [hoursPerEvent, setHoursPerEvent] = useState("8");
  const [takeHomePercent, setTakeHomePercent] = useState("70");
  const [payPeriodLength, setPayPeriodLength] = useState("14");
  const [payPeriodStart, setPayPeriodStart] = useState("");

  const [paycheck, setPaycheck] = useState<PaycheckState>({
    eventsInPeriod: 0,
    totalHours: 0,
    grossPay: 0,
    takeHomePay: 0,
  });

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const defaultStartDate = new Date();
    defaultStartDate.setDate(today.getDate() + diffToMonday);
    const formattedDefaultDate = formatDateToYYYYMMDD(defaultStartDate);
    if (formattedDefaultDate) {
        setPayPeriodStart(formattedDefaultDate);
    }
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
      if (eventDate && eventDate >= periodStartDate && eventDate <= periodEndDate) {
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

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      ></div>
      {/* Bottom Sheet Modal */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-slate-800 rounded-t-3xl p-5 sm:p-8 z-50 transform transition-transform ease-out duration-300 max-h-[90vh] overflow-y-auto ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Bottom Sheet Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-slate-200">Paycheck Estimator</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors flex items-center justify-center"
            aria-label="Close paycheck settings"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {/* Bottom Sheet Content */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label htmlFor="payRate" className="block mb-2 text-sm font-medium text-slate-300">
                Hourly Pay Rate ($)
              </label>
              <input
                type="number"
                id="payRate"
                className="block w-full bg-slate-700 border border-slate-600 text-slate-200 py-2.5 px-3.5 rounded-lg text-sm focus:border-sky-500 focus:ring-sky-500"
                value={payRate}
                onChange={handleInputChange(setPayRate)}
              />
            </div>
            <div>
              <label htmlFor="hoursPerEvent" className="block mb-2 text-sm font-medium text-slate-300">
                Hours per Event
              </label>
              <input
                type="number"
                id="hoursPerEvent"
                className="block w-full bg-slate-700 border border-slate-600 text-slate-200 py-2.5 px-3.5 rounded-lg text-sm focus:border-sky-500 focus:ring-sky-500"
                value={hoursPerEvent}
                onChange={handleInputChange(setHoursPerEvent)}
              />
            </div>
            <div>
              <label htmlFor="takeHomePercent" className="block mb-2 text-sm font-medium text-slate-300">
                Take-Home (%)
              </label>
              <input
                type="number"
                id="takeHomePercent"
                className="block w-full bg-slate-700 border border-slate-600 text-slate-200 py-2.5 px-3.5 rounded-lg text-sm focus:border-sky-500 focus:ring-sky-500"
                value={takeHomePercent}
                onChange={handleInputChange(setTakeHomePercent)}
                min="0"
                max="100"
              />
            </div>
            <div>
              <label htmlFor="payPeriodLength" className="block mb-2 text-sm font-medium text-slate-300">
                Pay Period Length
              </label>
              <select
                id="payPeriodLength"
                className="block w-full bg-slate-700 border border-slate-600 text-slate-200 py-2.5 px-3.5 rounded-lg text-sm focus:border-sky-500 focus:ring-sky-500"
                value={payPeriodLength}
                onChange={handleInputChange(setPayPeriodLength)}
              >
                <option value="7">Weekly (7 days)</option>
                <option value="14">Bi-weekly (14 days)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="payPeriodStart" className="block mb-2 text-sm font-medium text-slate-300">
                Pay Period Start Date
              </label>
              <input
                type="date"
                id="payPeriodStart"
                className="block w-full bg-slate-700 border border-slate-600 text-slate-200 py-2.5 px-3.5 rounded-lg text-sm focus:border-sky-500 focus:ring-sky-500"
                value={payPeriodStart}
                onChange={handleInputChange(setPayPeriodStart)}
              />
            </div>
          </div>
          <div className="mt-6 bg-slate-700/50 p-4 rounded-xl">
            <h3 className="text-lg font-medium text-slate-200 mb-3">
              Estimated Pay for Period:
            </h3>
            <div id="paySummary" className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Work Events:</span>
                <span className="text-slate-200 font-medium">
                  {paycheck.eventsInPeriod}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Hours:</span>
                <span className="text-slate-200 font-medium">
                  {paycheck.totalHours.toFixed(1)} hrs
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Gross Pay:</span>
                <span className="text-slate-200 font-medium">
                  ${paycheck.grossPay.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Est. Take-Home:</span>
                <span className="text-slate-200 font-medium">
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
export default PaycheckModal;
