# Calendar App

## Running Locally

To run the application locally, follow these steps:

1.  **Prerequisites**: Ensure you have Node.js installed on your machine.
2.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Environment Variables

The application uses environment variables for configuration. You can set these variables in a local `.env` file in the root of the project, or via the Netlify dashboard for production deployments.

### Local Development (.env)

1.  Create a file named `.env` in the root directory.
2.  Add the following variables:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CALENDAR_ID=your_calendar_id
```

*Note: These variables are required for the Google Calendar integration features.*

### Netlify Deployment

To add environment variables in Netlify:

1.  Go to your site's dashboard in Netlify.
2.  Navigate to **Site configuration** > **Environment variables**.
3.  Click **Add a variable**.
4.  Add the keys (`VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CALENDAR_ID`) and their corresponding values.
