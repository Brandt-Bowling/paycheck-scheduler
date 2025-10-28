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

export const createGoogleCalendarUrl = (event: {
  summary: string;
  description: string;
  date: string;
}): string => {
  const startDate = parseLocalDate(event.date);
  if (!startDate) return "";

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  const formatDate = (date: Date) =>
    date.toISOString().replace(/-/g, "").split("T")[0];

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.summary,
    details: event.description,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
};
