# FazeAR Agent: Project Plan & Roadmap

This document outlines the strategic project plan for the development of the FazeAR AI Agent for Accounts Receivable.

---

## Guiding Principles ("The Three Pillars")

1.  **Conversational First:** The primary user interface should be a natural language conversation with the AI agent. The agent is not a feature; it *is* the application.
2.  **Proactive Automation:** The system should move beyond simple task automation to proactive, autonomous operation. The agent should be a virtual team member that works 24/7.
3.  **Human in the Loop:** While the agent is powerful, the user is always in control. All autonomous actions should be transparent, logged, and easily reviewable. Humans should be able to intervene and take over at any point.

---

## Phase 1: Core Platform & Agent Foundation (Complete)

**Goal:** Build a stable, functional prototype with a world-class UI/UX that demonstrates the core value proposition.

-   **M1: Project Setup & UI Foundation (Complete)**
    -   Setup React + TypeScript + Vite + Tailwind CSS.
    -   Design and build the main application shell, including header, navigation, and a responsive layout.
-   **M2: Workflow Tracker (Complete)**
    -   Create the core `WorkflowTracker` component to display and filter outstanding invoices.
    -   Implement state management for workflows.
-   **M3: Inspector Panel (Complete)**
    -   Build the `InspectorPanel` to show detailed information for a selected workflow.
    -   Implement the ability to add notes and view a basic audit trail.
-   **M4: Basic AI Chat (Complete)**
    -   Integrate the Gemini API.
    -   Build the `ChatInterface` component for user interaction.
    -   Implement a basic conversational loop (user prompt -> AI response).
-   **M5: Analytics Dashboard V1 (Complete)**
    -   Create an `Analytics` view.
    -   Build an Invoice Aging Report and Collector Performance widgets.
-   **M6: Settings & Dunning Plans (Complete)**
    -   Build a `SettingsModal`.
    -   Implement a full CRUD interface for creating and managing multi-step Dunning Plans.
-   **M7: Proactive Automation V1 (Complete)**
    -   Implement "Autonomous Mode" toggle.
    -   Create a simulation where the agent logs basic audit trail entries based on dunning plans.
    -   **Enhancement:** Agent now triggers real-time toast notifications for actions.
-   **M8: Agent Actionability (Complete)**
    -   Implement Gemini Function Calling.
    -   Define and implement tools for the agent: `assign_workflow`, `add_note_to_workflow`, `send_reminder`.
-   **M9: External Integrations V1 (Complete)**
    -   Build a dedicated `IntegrationsHub` page with a marketplace-style UI.
-   **M10: Client Collaboration V1 (Complete)**
    -   Build the UI for a client-facing `PaymentPortal`.
    -   Implement a "Client" user role to demonstrate a personalized, logged-in client view.
-   **M11: UI/UX Refactor (Deprecated)**
    -   Replaced by M12.
-   **M12: Independent Panel UI Refactor (Complete)**
    -   Overhauled the dashboard to a true three-panel layout with independent scrolling and a tabbed "Action Hub", resolving all major layout and usability issues.

---

## Phase 2: Enhanced Agent Capabilities & Full Autonomy (In Progress)

**Goal:** Evolve the agent from a simple assistant to a truly intelligent and autonomous partner.

-   **M13: "What-If" Scenarios (Complete)**
    -   **Description:** Allow users to ask the agent to simulate financial scenarios.
    -   **Implementation:** The agent uses a `run_what_if_scenario` tool. The app calculates the impact and displays a comparison on the Cash Flow Forecast chart, with a clear banner and a "Clear Scenario" button. The agent confirms the action in a multi-turn conversation.
-   **M14: AI-Powered Cash Application (Complete)**
    -   **Description:** Enable the agent to parse unstructured remittance advice.
    -   **Implementation:** A dedicated `CashAppPanel` where users can paste text. The agent uses Gemini to analyze the text, extract payment details, and match them to open invoices. A confirmation modal allows the user to apply payments in one click.
-   **M15: Tone & Language Adjustment (Complete)**
    -   **Description:** Give users control over the agent's communication style.
    -   **Implementation:** Add UI controls for `Tone` (Friendly, Formal, Firm) to the chat interface. The selected tone is passed to the Gemini model via a `systemInstruction` to shape its response.
-   **M16: Automated Communication (Complete)**
    -   **Description:** Upgrade the autonomous agent to handle email communications.
    -   **Implementation:** When in Autonomous Mode, the agent now uses the Gemini API to **draft personalized dunning emails** based on the workflow and dunning plan. These drafts are automatically added to the `CommunicationsLog` for user review, maintaining the "human in the loop" principle.
-   **M17: Dispute Management Module (Complete)**
    -   **Description:** Provide a structured workflow for handling disputed invoices.
    -   **Implementation:** A new `DisputesHub` with a **Kanban-style board** (New, Under Review, Resolved). Users or the AI (via a `dispute_invoice` tool) can mark an invoice as disputed, which then appears on the board for drag-and-drop management.
-   **M18: Advanced Conversational Analytics**
    -   **Description:** Enable the agent to answer more complex, multi-faceted questions about the data that may require generating summaries or calculations on the fly.
    -   **Implementation:** Refine the agent's system prompt and potentially use a multi-step tool process to first query data, then summarize it.

---

## Phase 3: Live Integrations & Scalability (Future Scope)

**Goal:** Move from a simulated environment to a production-ready platform.

-   **M19: Live QuickBooks Integration**
    -   **Description:** Connect to the QuickBooks API to sync invoices, customers, and payments in real-time.
-   **M20: Live Email Integration (Gmail/Outlook)**
    -   **Description:** Allow the agent to send its drafted communications directly from the user's email account.
-   **M21: Live Payment Integration (Stripe)**
    -   **Description:** Fully activate the Client Payment Portal by integrating with the Stripe API for processing real payments.
-   **M22: Performance Optimization & Testing**
    -   **Description:** Code refactoring, performance profiling for large datasets, and comprehensive end-to-end testing.
-   **M23: User Authentication & Backend**
    -   **Description:** Implement a secure user authentication system and a robust backend to manage data persistence.
