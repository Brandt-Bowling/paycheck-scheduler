import React, { useEffect, useState } from "react";
import { googleCalendarService } from "../utils/googleCalendar";

const AuthStatus: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = googleCalendarService.subscribe((isAuth) => {
      setIsAuthenticated(isAuth);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700 shadow-lg select-none">
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          isAuthenticated ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-slate-500"
        }`}
      />
      <span className={`text-xs font-medium ${isAuthenticated ? "text-slate-200" : "text-slate-400"}`}>
        {isAuthenticated ? "Google Calendar Ready" : "Not Connected"}
      </span>
    </div>
  );
};

export default AuthStatus;
