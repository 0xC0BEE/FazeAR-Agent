# The FazeAR AI Agent: Capabilities & Persona

This document provides an overview of the FazeAR AI Agent, the core intelligence of the platform.

---

## 1. Agent Persona

**Name:** Faze (Internally)
**Role:** AI Accounts Receivable Specialist

**Personality:** Faze is designed to be a highly competent, efficient, and slightly formal professional. It is proactive, data-driven, and aims to be an indispensable member of the finance team. Its communication is clear, concise, and always focused on the task at hand. While it's an AI, its goal is to interact with the reliability and intelligence of an experienced human collector.

---

## 2. Core Functions

The FazeAR agent operates in two primary modes: **Conversational Analyst** and **Autonomous Collector**.

### A. Conversational Analyst (Reactive Mode)

This is the agent's function within the **AI Assistant chat interface**. In this mode, the agent responds to user queries and commands, acting as a powerful tool for data analysis and retrieval.

**Key Capabilities:**
-   **Data Summarization:** Can provide summaries of complex data, such as "Summarize the aging report" or "What's the total overdue amount?"
-   **Specific Lookups:** Can answer questions about specific entities, like "What is the status of the latest invoice for Quantum Dynamics?" or "Who is the assignee for invoice inv_1015?"
-   **Performance Analysis:** Can answer questions about team performance, such as "Who is the top performing collector this month?"
-   **"What-If" Scenarios:** Can simulate the impact of potential events on cash flow, for example: "Run a scenario where Innovate Corp pays 30 days late."
-   **(Future) Action Execution:** With the implementation of Gemini Function Calling, the agent will be able to perform actions like sending emails, assigning workflows, and adding notes based on direct commands.

### B. Autonomous Collector (Proactive Mode)

When **Autonomous Mode** is enabled, the agent proactively manages workflows without direct user intervention. It monitors all designated autonomous workflows and executes actions based on their assigned Dunning Plan.

**Key Capabilities:**
-   **Dunning Plan Execution:** The agent continuously checks the status of invoices. When an invoice's age matches a step in its dunning plan (e.g., 7 days overdue), it takes action.
-   **Automated Activity Logging:** In its current implementation, the agent logs its intended actions in the workflow's audit trail. For example, it will add an entry like: `Autonomous Action: Sent 'Second Reminder' email.`
-   **(Future) Automated Communication:** Once email integration is live, the agent will move beyond logging actions to actually sending the templated emails to clients.
-   **(Future) Intelligent Escalation:** The agent will be able to recognize when a client is unresponsive and escalate the workflow to a human manager for review.

---

## 3. Underlying Technology

The FazeAR agent is powered by **Google's Gemini family of models**.

-   **`gemini-2.5-flash`** is used for the majority of chat and analysis tasks due to its excellent balance of speed, intelligence, and cost-effectiveness.
-   The model's ability to understand context, process natural language, and generate structured data (like in the Cash Application tool) is fundamental to the FazeAR experience.
-   Future development will leverage advanced capabilities like **Function Calling** to give the agent the ability to interact with the application's tools and external services.
