// Types for the Google Identity Services client
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
  private pendingAuthRequest: { resolve: () => void, reject: (err: any) => void } | null = null;
  private listeners: ((isAuth: boolean) => void)[] = [];

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
  }

  /**
   * Subscribe to authentication state changes.
   * Returns a cleanup function.
   */
  public subscribe(callback: (isAuth: boolean) => void): () => void {
    this.listeners.push(callback);
    // Immediately fire with current state
    callback(this.isAuthenticated());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    const isAuth = this.isAuthenticated();
    this.listeners.forEach(cb => cb(isAuth));
  }

  /**
   * Checks if the user is currently authenticated (has a refresh token).
   */
  public isAuthenticated(): boolean {
    return !!localStorage.getItem('google_refresh_token');
  }

  /**
   * Triggers the interactive authentication flow.
   */
  public authenticate(): Promise<void> {
    if (!this.tokenClient) {
       return Promise.reject(new Error("Google Client not initialized"));
    }
    // Reuse ensureAccessToken to handle logic and pending requests safely
    // Since isAuthenticated() is false when this is called, ensureAccessToken will trigger the interactive flow
    return this.ensureAccessToken();
  }

  /**
   * Fetches the Client ID from the backend.
   */
  private async fetchClientId(): Promise<string> {
    const res = await fetch('/api/auth');
    if (!res.ok) {
        throw new Error('Failed to fetch Client ID');
    }
    const data = await res.json();
    return data.clientId;
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
   * Attempts to restore session from localStorage refresh token.
   */
  public async initialize(): Promise<void> {
    if (this.gapiInited && this.gisInited) return;

    // Fetch Client ID if not present
    if (!this.config.clientId) {
        try {
            this.config.clientId = await this.fetchClientId();
        } catch (err) {
            console.error('Failed to initialize Google Service: Missing Client ID', err);
            throw err;
        }
    }

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

    // Initialize Code Client (Authorization Code Flow)
    this.tokenClient = window.google.accounts.oauth2.initCodeClient({
      client_id: this.config.clientId,
      scope: SCOPES,
      ux_mode: 'popup',
      callback: (response: any) => this.handleAuthResponseWrapper(response),
    });
    this.gisInited = true;

    // Try to restore session silently
    await this.tryRestoreSession();
  }

  /**
   * Handles the response from the popup (Auth Code Flow).
   */
  private async handleAuthResponse(response: any) {
      if (response.error) {
          console.error("Auth Error", response);
          return;
      }
      if (response.code) {
          try {
              const tokens = await this.exchangeCodeForTokens(response.code);
              this.setSession(tokens);
          } catch (err) {
              console.error("Failed to exchange code", err);
              throw err;
          }
      }
  }

  /**
   * Calls the backend to exchange auth code for tokens.
   */
  private async exchangeCodeForTokens(code: string): Promise<any> {
      const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to exchange code');
      }
      return await res.json();
  }

  /**
   * Calls the backend to refresh access token using refresh token.
   */
  private async refreshAccessToken(refreshToken: string): Promise<any> {
      const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
      });
      if (!res.ok) {
           if (res.status === 400 || res.status === 401) {
               this.clearSession();
           }
           const err = await res.json();
           throw new Error(err.error || 'Failed to refresh token');
      }
      return await res.json();
  }

  /**
   * Sets the session in localStorage and gapi client.
   */
  private setSession(tokens: any) {
      if (tokens.refresh_token) {
          localStorage.setItem('google_refresh_token', tokens.refresh_token);
      }
      if (tokens.access_token) {
          window.gapi.client.setToken({
              access_token: tokens.access_token,
              expires_in: tokens.expires_in || 3599
          });
      }
      this.notifyListeners();
  }

  private clearSession() {
      localStorage.removeItem('google_refresh_token');
      this.notifyListeners();
  }

  /**
   * Tries to restore the session using a stored refresh token.
   */
  private async tryRestoreSession(): Promise<void> {
      const refreshToken = localStorage.getItem('google_refresh_token');
      if (!refreshToken) return;

      try {
          console.log("Attempting to restore session...");
          const tokens = await this.refreshAccessToken(refreshToken);
          this.setSession(tokens);
          console.log("Session restored.");
      } catch (err) {
          console.warn("Failed to restore session:", err);
          this.clearSession();
      }
  }

  /**
   * Ensure we have a valid access token.
   * If not, prompt the user.
   */
  private async ensureAccessToken(): Promise<void> {
      const token = window.gapi.client.getToken();
      const refreshToken = localStorage.getItem('google_refresh_token');

      // If we have an existing token, assume validity for now.
      if (token && token.access_token) {
           return;
      }

      // If we have a refresh token, try to refresh silently first.
      if (refreshToken) {
          try {
              const tokens = await this.refreshAccessToken(refreshToken);
              this.setSession(tokens);
              return;
          } catch (e) {
              console.warn("Silent refresh failed, proceeding to interactive login", e);
          }
      }

      // If no valid session, trigger interactive login.
      return new Promise((resolve, reject) => {
          this.pendingAuthRequest = { resolve, reject };
          this.tokenClient.requestCode();
      });
  }

  /**
   * Internal wrapper to route the callback response to the pending promise.
   */
  private async handleAuthResponseWrapper(response: any) {
      try {
          await this.handleAuthResponse(response);
          if (this.pendingAuthRequest) {
              this.pendingAuthRequest.resolve();
              this.pendingAuthRequest = null;
          }
      } catch (e) {
          if (this.pendingAuthRequest) {
              this.pendingAuthRequest.reject(e);
              this.pendingAuthRequest = null;
          }
      }
  }

  /**
   * Adds multiple events to the configured calendar.
   */
  public async addEvents(events: any[]): Promise<void> {
    if (!this.gapiInited || !this.gisInited) {
      throw new Error('Google Client not initialized');
    }

    await this.ensureAccessToken();

    // Check again if we have a token (in case ensureAccessToken failed silently or user closed popup)
    if (!window.gapi.client.getToken()) {
        throw new Error("User denied access or failed to authenticate");
    }

    const batch = window.gapi.client.newBatch();

    events.forEach((event) => {
       const resource: any = {
        summary: event.summary,
        description: event.description,
        location: event.location,
        colorId: event.colorId,
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

            if (firstError.error.code === 401) {
                this.clearSession();
            }

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
    clientId: '', // Will be fetched from backend
    calendarId: import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary'
});
