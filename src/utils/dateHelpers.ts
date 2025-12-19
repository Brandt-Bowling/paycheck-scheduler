// --- Helper Functions & Constants ---
export const DAY_NAMES: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface CalendarEvent {
  summary: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  location?: string;
}

export const formatDateToYYYYMMDD = (date: Date | null | undefined): string | null => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
};

export const parseLocalDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split("-").map(Number);
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }
  return null;
};

export const formatToIcsDate = (date: Date, timeStr?: string): string => {
  const d = new Date(date);
  if (timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    d.setHours(hours, minutes, 0, 0);
  }

  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

export const createIcsContent = (events: CalendarEvent[]): string => {
  let content = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Calendar App//EN\n";

  events.forEach((event) => {
    content += "BEGIN:VEVENT\n";
    content += `SUMMARY:${event.summary}\n`;
    if (event.description) content += `DESCRIPTION:${event.description}\n`;
    if (event.location) content += `LOCATION:${event.location}\n`;

    const startDate = parseLocalDate(event.date);
    if (startDate) {
      if (event.startTime && event.endTime) {
        content += `DTSTART:${formatToIcsDate(startDate, event.startTime)}\n`;
        content += `DTEND:${formatToIcsDate(startDate, event.endTime)}\n`;
      } else {
        // All day event
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const formatDate = (date: Date) =>
          date.toISOString().replace(/-/g, "").split("T")[0];

        content += `DTSTART;VALUE=DATE:${formatDate(startDate)}\n`;
        content += `DTEND;VALUE=DATE:${formatDate(nextDay)}\n`;
      }
    }
    content += "END:VEVENT\n";
  });

  content += "END:VCALENDAR";
  return content;
};

export const createGoogleCalendarUrl = (event: CalendarEvent): string => {
  const startDate = parseLocalDate(event.date);
  if (!startDate) return "";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.summary,
    details: event.description,
  });

  if (event.location) {
    params.append("location", event.location);
  }

  if (event.startTime && event.endTime) {
    const startStr = formatToIcsDate(startDate, event.startTime);
    const endStr = formatToIcsDate(startDate, event.endTime);
    params.append("dates", `${startStr}/${endStr}`);
  } else {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
    const formatDate = (date: Date) =>
        date.toISOString().replace(/-/g, "").split("T")[0];
    params.append("dates", `${formatDate(startDate)}/${formatDate(endDate)}`);
  }

  return `https://www.google.com/calendar/render?${params.toString()}`;
};
