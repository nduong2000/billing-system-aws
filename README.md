# Medical Billing App Frontend (React)

This directory contains the React frontend application for the Medical Billing system, built using Vite.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** (v18 or later recommended) - [https://nodejs.org/](https://nodejs.org/)
*   **npm:** (usually comes with Node.js)
*   **Backend Server:** The backend API server (from the `../backend` directory) should be running.

## Setup Instructions

1.  **Clone the Repository (if applicable):**
    If you haven't already, clone the main project repository.

2.  **Navigate to Frontend Directory:**
    Open your terminal and change into this `frontend` directory:
    ```bash
    cd path/to/your/project/frontend
    ```

3.  **Install Dependencies:**
    Run npm to install the required packages listed in `package.json`:
    ```bash
    npm install
    ```

## Running the Frontend Development Server

1.  **Ensure Backend is Running:** Before starting the frontend, make sure the backend API server (located in the `../backend` directory) is running. You can typically start it by navigating to the `backend` directory in a separate terminal and running:
    ```bash
    # In the backend directory
    npm run dev
    ```
    The backend usually runs on `http://localhost:5002` by default (check the backend `README.md` or `.env` file).

2.  **Start Frontend Server:**
    In your terminal (already in the `frontend` directory), run:
    ```bash
    npm run dev
    ```
    This command starts the Vite development server.

3.  **Access the Application:**
    Vite will typically output the local URL where the frontend is running (usually `http://localhost:5173` or the next available port). Open this URL in your web browser.

## Connecting to the Backend

The frontend is configured to connect to the backend API by default at `http://localhost:5002/api` (defined in `src/services/api.js`).

If your backend is running on a different port or URL, you can configure the frontend:

1.  **(Recommended) Use Environment Variables:** Create a `.env` file in the `frontend` directory and add the following line, replacing the URL with your backend API base URL:
    ```dotenv
    VITE_API_URL=http://your-backend-host:your-backend-port/api
    ```
    *Note: Vite requires environment variables exposed to the client-side code to be prefixed with `VITE_`.* Restart the frontend development server after creating/modifying the `.env` file.

2.  **(Alternative) Modify `api.js`:** Directly change the `API_BASE_URL` constant in `frontend/src/services/api.js`. This is less flexible than using environment variables.

## Available Pages

Navigate using the links in the header:

*   Home
*   Patients (List, Add, Edit, View Details, Delete)
*   Providers (List, Add, Edit, View Details, Delete)
*   Services (List, Add, Edit, Delete)
*   Appointments (List, Add, Edit, Delete)
*   Claims (List - Add, View, Delete implemented so far)
