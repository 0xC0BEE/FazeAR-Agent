# FazeAR: AI Accounts Receivable Agent

FazeAR is a modern, AI-powered agent designed to automate and streamline accounts receivable workflows. It transforms the tedious process of managing invoices, chasing payments, and communicating with clients into a simple, conversational experience. By leveraging the power of Google's Gemini models, FazeAR acts as a proactive member of your finance team, enabling you to accelerate cash flow and reduce manual effort.

This project is a functional prototype built with React, TypeScript, and Tailwind CSS, running directly in the browser.

## Key Features

-   **Conversational AI Assistant:** Interact with your AR data through a natural language chat interface. Ask for summaries, get status updates, and run "what-if" scenarios.
-   **Automated Workflow Tracker:** A central dashboard to monitor the status of all outstanding invoices, with intelligent filtering and sorting for Overdue and In-Progress items.
-   **AI Autonomous Mode:** Activate the agent to proactively manage collections. Based on customizable dunning plans, the agent will automatically log follow-up activities for overdue invoices.
-   **Customizable Dunning Plans:** A full CRUD interface in the settings modal allows you to create, edit, and delete multi-step dunning plans to match your business's collection strategy.
-   **AI-Powered Cash Application:** Paste unstructured remittance text from bank statements or emails, and the AI will instantly parse the data and match payments to open invoices.
-   **Insightful Analytics:** A dedicated analytics view provides a detailed Invoice Aging Report and a Collector Performance dashboard to track key AR metrics.
-   **Simulated Webhook Listener:** Demo a modern AR workflow by simulating events like new invoices from QuickBooks or payments received from Stripe.
-   **Role-Based Access Control:** The UI adapts based on user roles (Admin, Manager, Collector), ensuring users only see the features relevant to them.

## Getting Started (Local Development)

While this app is designed to run in a cloud environment like Bolt, you can set it up for local development.

1.  **Prerequisites:**
    *   Node.js and npm/yarn installed.
    *   A valid Google Gemini API Key.

2.  **Installation:**
    ```bash
    npm install
    ```

3.  **Configure API Key:**
    *   Open the `apiKey.ts` file.
    *   Replace the placeholder `"YOUR_API_KEY_HERE"` with your actual Gemini API key.
    *   **IMPORTANT:** This file is for local development only. Do not commit it with your key to a public repository. For production, the app is designed to use environment variables (`process.env.API_KEY`).

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, and you can access the application in your browser.
