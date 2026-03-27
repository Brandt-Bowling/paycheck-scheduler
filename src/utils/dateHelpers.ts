import { Temporal } from "@js-temporal/polyfill";

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

export interface CalendarDayItem {
  day: number;
  dateString: string;
  isCurrentMonth: boolean;
}

export const getCalendarGridData = (date: Temporal.PlainDate): CalendarDayItem[] => {
  const year = date.year;
  const month = date.month; // 1-12

  // Find the first day of the month
  const firstDayOfMonth = date.with({ day: 1 });

  // Temporal.PlainDate.dayOfWeek: 1 = Monday, 7 = Sunday
  // We want Sunday = 0, Monday = 1, ..., Saturday = 6
  const firstDayOfWeek = firstDayOfMonth.dayOfWeek === 7 ? 0 : firstDayOfMonth.dayOfWeek;

  // Grid always starts on Sunday (0).
  const startOffset = -firstDayOfWeek;
  const totalSlots = 42; // 6 rows * 7 columns

  const days: CalendarDayItem[] = [];

  // Calculate the actual starting date for the grid
  const startDate = firstDayOfMonth.add({ days: startOffset });

  for (let i = 0; i < totalSlots; i++) {
      const currentDate = startDate.add({ days: i });

      const dateString = currentDate.toString(); // YYYY-MM-DD

      days.push({
          day: currentDate.day,
          dateString,
          isCurrentMonth: currentDate.month === month
      });
  }

  return days;
};

export interface CalendarEvent {
  summary: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  location?: string;
  colorId?: string;
  calendarId?: string;
}

export const formatDateToYYYYMMDD = (date: Temporal.PlainDate | null | undefined): string | null => {
  if (!date) return null;
  return date.toString();
};

export const parseLocalDate = (dateString: string | null | undefined): Temporal.PlainDate | null => {
  if (!dateString) return null;
  try {
    return Temporal.PlainDate.from(dateString);
  } catch (e) {
    return null;
  }
};

export const formatToIcsDate = (date: Temporal.PlainDate, timeStr?: string): string => {
  let dateTime: Temporal.PlainDateTime;
  if (timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    dateTime = date.toPlainDateTime({ hour: hours, minute: minutes });
  } else {
    dateTime = date.toPlainDateTime({ hour: 0, minute: 0 });
  }

  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${dateTime.year}${pad(dateTime.month)}${pad(dateTime.day)}T${pad(dateTime.hour)}${pad(dateTime.minute)}${pad(dateTime.second)}`;
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
        const nextDay = startDate.add({ days: 1 });
        const formatDate = (date: Temporal.PlainDate) => date.toString().replace(/-/g, "");

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
    const endDate = startDate.add({ days: 1 });
    const formatDate = (date: Temporal.PlainDate) => date.toString().replace(/-/g, "");
    params.append("dates", `${formatDate(startDate)}/${formatDate(endDate)}`);
  }

  return `https://www.google.com/calendar/render?${params.toString()}`;
};
