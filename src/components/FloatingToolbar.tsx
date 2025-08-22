import React from "react";
import CalendarIcon from "./icons/CalendarIcon";
import PayIcon from "./icons/PayIcon";

interface FloatingToolbarProps {
  onOpenEventModal: () => void;
  onOpenPayModal: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  onOpenEventModal,
  onOpenPayModal,
}) => {
  return (
    <div className="bottom-4 p-2 bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg">
      <div className="flex space-x-2">
        <button
          onClick={onOpenEventModal}
          className="flex items-center space-x-2 py-2.5 px-4 rounded-full font-medium text-sm bg-sky-600 hover:bg-sky-700 text-white transition-colors"
        >
          <CalendarIcon />
          <span>Templates</span>
        </button>
        <button
          onClick={onOpenPayModal}
          className="flex items-center space-x-2 py-2.5 px-4 rounded-full font-medium text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors"
        >
          <PayIcon />
          <span>Pay Estimator</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingToolbar;
