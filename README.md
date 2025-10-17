# FazeAR: AI Accounts Receivable Agent

FazeAR is a modern, AI-powered agent designed to automate and streamline accounts receivable workflows. It transforms the tedious process of managing invoices, chasing payments, and communicating with clients into a simple, conversational experience. By leveraging the power of Google's Gemini models, FazeAR acts as a proactive member of your finance team, enabling you to accelerate cash flow and reduce manual effort.

This project is a functional prototype built with React, TypeScript, and Tailwind CSS, running directly in the browser.

## Key Features

-   **Conversational AI Assistant:** Interact with your AR data through a natural language chat interface. Ask for summaries, get status updates, and command the agent to perform actions like assigning workflows or adding notes.
-   **Advanced "What-If" Scenarios:** The agent can run financial simulations via a complete multi-turn conversation, providing a final natural language summary and directing you to a visual forecast chart on the Analytics page.
-   **Tone & Language Adjustment:** Guide the AI agent's communication style by selecting a tone (e.g., Friendly, Formal, Firm) for its responses, perfect for drafting client emails.
-   **Automated Workflow Tracker:** A central dashboard to monitor the status of all outstanding invoices, with intelligent filtering and sorting for Overdue and In-Progress items.
-   **AI Autonomous Mode:** Activate the agent to proactively manage collections. Based on customizable dunning plans, the agent will **autonomously draft and log personalized follow-up emails** for overdue invoices, ready for your review.
-   **AI-Powered Dispute Resolution:** The Disputes Hub is now an intelligent resolution center. Clicking a disputed invoice opens a dedicated modal where the AI provides an **instant case summary** and **actionable resolution suggestions**. Execute complex actions, like drafting a request for more information, with a single click.
-   **AI Live Call Simulation:** Initiate a real-time, voice-based simulated phone call with an AI playing the role of the client's accounts payable department. Features live audio and a streaming transcript, with an AI-generated call summary at the end.
-   **Customizable Dunning Plans:** A full CRUD interface in the settings modal allows you to create, edit, and delete multi-step dunning plans to match your business's collection strategy.
-   **AI-Powered Cash Application:** Paste unstructured remittance text from bank statements or emails, and the AI will instantly parse the data and match payments to open invoices.
-   **Insightful Analytics:** A dedicated analytics view provides a detailed Invoice Aging Report and a Collector Performance dashboard to track key AR metrics.
-   **GitBook-Style Knowledge Base:** A comprehensive, navigable help center explaining every feature in detail with use cases and examples.
-   **Role-Based Access Control:** The UI adapts based on user roles (Admin, Manager, Collector, Client), ensuring users only see the features relevant to them.

## Getting Started

This application requires a Google Gemini API key to function.

### How API Keys are Managed

This project manages API keys securely at runtime, ensuring they are never exposed in the source code or build artifacts.

-   On the first launch, the application will display a modal prompting you to enter your Gemini API key.
-   The key is stored in your browser's `sessionStorage`. This means it persists for your current session but is cleared when you close the browser tab.
-   This method is secure because the key lives only on your machine and is never saved in the project's files, preventing it from being accidentally published or exposed.