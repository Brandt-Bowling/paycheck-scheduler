// Types for the Google Identity Services client
// These are often available via @types/google.accounts but for simplicity in loading logic:
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

interface GoogleCalendarConfig {
  clientId: string;
  calendarId: string;
}

export class GoogleCalendarService {
  private tokenClient: any;
  private gapiInited = false;
  private gisInited = false;
  private config: GoogleCalendarConfig;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
  }

  /**
   * Loads the necessary Google scripts dynamically.
   */
  public loadGoogleScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
      const loadGapi = new Promise<void>((resolveGapi, rejectGapi) => {
        if (window.gapi) {
          resolveGapi();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => resolveGapi();
        script.onerror = () => rejectGapi(new Error('Failed to load GAPI'));
        document.body.appendChild(script);
      });

      const loadGis = new Promise<void>((resolveGis, rejectGis) => {
        if (window.google) {
            resolveGis();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolveGis();
        script.onerror = () => rejectGis(new Error('Failed to load GIS'));
        document.body.appendChild(script);
      });

      Promise.all([loadGapi, loadGis])
        .then(() => resolve())
        .catch(reject);
    });
  }

  /**
   * Initializes the GAPI client and GIS token client.
   */
  public async initialize(): Promise<void> {
    if (this.gapiInited && this.gisInited) return;

    await new Promise<void>((resolve, reject) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
          });
          this.gapiInited = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.config.clientId,
      scope: SCOPES,
      callback: () => {}, // Defined at request time
    });
    this.gisInited = true;
  }

  /**
   * Requests an access token if needed.
   */
  private async requestAccessToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (resp: any) => {
        if (resp.error) {
          reject(resp);
        }
        resolve();
      };

      if (window.gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  }

  /**
   * Adds multiple events to the configured calendar.
   */
  public async addEvents(events: any[]): Promise<void> {
    if (!this.gapiInited || !this.gisInited) {
      throw new Error('Google Client not initialized');
    }

    await this.requestAccessToken();

    const batch = window.gapi.client.newBatch();

    events.forEach((event) => {
       const resource: any = {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {},
        end: {}
      };

      if (event.startTime && event.endTime) {
          // Time-based event
          resource.start.dateTime = this.formatDateTime(event.date, event.startTime);
          resource.end.dateTime = this.formatDateTime(event.date, event.endTime);
      } else {
          // All-day event
          resource.start.date = event.date;
          // End date is exclusive for all-day events
          const d = new Date(event.date);
          d.setDate(d.getDate() + 1);
          const nextDay = d.toISOString().split('T')[0];
          resource.end.date = nextDay;
      }

      batch.add(window.gapi.client.calendar.events.insert({
        'calendarId': this.config.calendarId,
        'resource': resource
      }));
    });

    return new Promise((resolve, reject) => {
      batch.execute((resp: any) => {
        if (!resp) {
            reject(new Error("Batch execution failed"));
            return;
        }

        const responses = Object.values(resp);
        // Check for errors in the batch response
        const errors = responses.filter((r: any) => r && r.error);

        if (errors.length > 0) {
            // Pick the first error to show
            const firstError = errors[0] as any;
            const msg = firstError.error.message || "Unknown error from Google Calendar";
            console.error('Batch error response', resp);
            reject(new Error(msg));
            return;
        }

        console.log('Batch success response', resp);
        resolve(resp);
      });
    });
  }

  /**
   * Helper to format a local date string (YYYY-MM-DD) and time (HH:MM) into an RFC3339 string with local offset.
   */
  private formatDateTime(dateStr: string, timeStr: string): string {
    const date = new Date(`${dateStr}T${timeStr}:00`);
    const offset = -date.getTimezoneOffset();
    const diff = offset >= 0 ? '+' : '-';
    const pad = (n: number) => Math.floor(Math.abs(n)).toString().padStart(2, '0');
    return `${dateStr}T${timeStr}:00${diff}${pad(offset / 60)}:${pad(offset % 60)}`;
  }
}

export const googleCalendarService = new GoogleCalendarService({
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    calendarId: import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary'
});
