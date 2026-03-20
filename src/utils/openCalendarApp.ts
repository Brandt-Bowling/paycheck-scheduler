export const openCalendarApp = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    // Attempt to open Apple Calendar natively
    window.location.href = 'calshow://';
  } else {
    // For Android or any other OS, open Google Calendar.
    // On Android, this web URL typically gets intercepted by the native Google Calendar app if installed.
    window.open('https://calendar.google.com/calendar/', '_blank');
  }
};
