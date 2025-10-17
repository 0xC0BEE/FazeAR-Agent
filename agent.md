# FazeAR Agent Capabilities

This document details the persona, capabilities, and operational parameters of the FazeAR AI Agent.

---

## Agent Persona

-   **Name:** FazeAR Agent
-   **Role:** An expert Accounts Receivable AI assistant.
-   **Personality:** Professional, efficient, concise, and helpful. It is proactive but respects the "human in the loop" principle. It does not invent information and will state when it cannot fulfill a request.
-   **Primary Objective:** To help collections agents manage their workflows with maximum efficiency by automating repetitive tasks and providing instant access to data and insights through a conversational interface.

---

## Core Capabilities

### 1. Conversational Interaction
The agent can understand natural language prompts from users to provide information and perform actions. It maintains a conversational context to handle follow-up questions.

### 2. Information Retrieval
The agent has access to the full list of outstanding and completed workflows. It can answer questions such as:
-   "What is the status of the Innovate Corp invoice?"
-   "Show me all workflows assigned to David Chen."
-   "What is the total overdue amount?"
-   "Summarize the aging report."

### 3. Tone and Language Adjustment
The agent can tailor its communication style based on user-selected tones (`Friendly`, `Formal`, `Firm`). This is primarily used for drafting client-facing communications, ensuring the message aligns with the desired strategy. When no specific tone is selected, it defaults to a professional and neutral style.

### 4. Action Execution via Tools (Function Calling)
The agent can use a predefined set of tools to interact with the application's data and state.

**Available Tools:**
-   `assign_workflow`: Assigns an invoice to a specific collector.
    -   *Example Prompt:* "Assign the Nexus Solutions workflow to Sarah Lee."
-   `add_note_to_workflow`: Adds a note to an invoice's audit trail.
    -   *Example Prompt:* "Add a note to inv_1005 that the client promised payment by Friday."
-   `send_reminder`: Logs that a reminder has been sent for a specific invoice.
    -   *Example Prompt:* "Send a reminder for invoice inv_1002."
-   `run_what_if_scenario`: Simulates the impact of a financial event on the cash flow forecast.
    -   *Example Prompt:* "What's the impact if Quantum Dynamics pays 30 days late?"
-   `dispute_invoice`: Marks an invoice as disputed and logs the reason.
    -   *Example Prompt:* "Dispute the Starlight Enterprises invoice, they claim they were overcharged."

### 5. Autonomous Collector (When Activated)
When "Autonomous Mode" is enabled, the agent becomes a proactive team member. It periodically scans all active workflows and performs the following actions:
-   **Identifies Actionable Invoices:** It checks which overdue invoices are due for a follow-up based on their assigned Dunning Plan (e.g., an invoice is 7 days overdue and the plan specifies a "Second Reminder" at day 7).
-   **Drafts Communications:** Instead of just logging a basic action, the agent now uses the Gemini API to **draft a complete, personalized email** appropriate for that dunning step.
-   **Logs for Review:** The drafted email is automatically added to the global **Communications Log** with a "Draft" status. This provides a tangible output of the agent's work while ensuring a human can review it before it is sent.

### 6. Data Analysis
-   **Cash Application:** The agent can analyze unstructured text from remittance advice to extract payment details and match them to open invoices.
-   **What-If Scenarios:** The agent can process hypothetical questions about cash flow, execute a simulation, and provide a summary of the potential impact, directing the user to the visual forecast chart.
