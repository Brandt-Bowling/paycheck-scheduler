import { OAuth2Client } from 'google-auth-library';

export default async (req, context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { code, refresh_token } = body;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    // For popup flow, redirect_uri is usually 'postmessage'
    const redirectUri = 'postmessage';

    if (!clientId) {
      console.error('Configuration Error: GOOGLE_CLIENT_ID is missing on the server');
      return new Response(JSON.stringify({ error: 'Configuration Error: GOOGLE_CLIENT_ID is missing on the server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!clientSecret) {
      console.error('Configuration Error: GOOGLE_CLIENT_SECRET is missing on the server');
      return new Response(JSON.stringify({ error: 'Configuration Error: GOOGLE_CLIENT_SECRET is missing on the server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

    let tokens;

    if (code) {
      // Exchange authorization code for tokens
      const { tokens: newTokens } = await oauth2Client.getToken(code);
      tokens = newTokens;
    } else if (refresh_token) {
      // Refresh access token
      oauth2Client.setCredentials({ refresh_token });
      const { credentials: newTokens } = await oauth2Client.refreshAccessToken();
      tokens = newTokens;
    } else {
      return new Response(JSON.stringify({ error: 'Missing code or refresh_token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(tokens), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Auth Error:', error);
    const message = error.message || 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
