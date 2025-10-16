# FazeAR AI Agent: Capabilities & Guide

This document provides a comprehensive overview of the FazeAR AI Agent, its purpose, and how to interact with it effectively.

---

## 1. Agent's Purpose

The FazeAR AI Agent is designed to be an intelligent assistant for Accounts Receivable (AR) specialists. Its primary goal is to augment the user's workflow by providing instant access to data, automating report generation, and offering insights through a natural language, conversational interface.

The agent has access to real-time context about the application's state, including:
-   All outstanding invoice workflows.
-   Details about the current user (name and role).
-   The company's defined dunning plans.

It uses this context to provide accurate, relevant answers to user queries and to take action on behalf of the user.

---

## 2. Core Capabilities

The agent's capabilities are centered around data analysis, reporting, and taking action, accessed via the **AI Assistant** chat panel.

### 2.1. Conversational Commands & Actions
The agent uses a "tool-based" architecture (Function Calling) to understand and execute commands.

**Example Commands:**
-   `"Add a note to the Innovate Corp workflow: Client promised payment by Friday."`
-   `"Run a what-if scenario where Apex Industries pays 60 days late."`
-   `"Clear the cash flow scenario."`

### 2.2. Automated Dispute Management
The agent acts as a **Dispute Resolution Analyst**. When the system detects a short payment on an invoice, it automatically triggers the agent to:
1.  Log a formal "Dispute Case" against the workflow.
2.  Infer a likely reason for the short payment.
3.  Record the event in the audit trail.
The user can then view and manage this dispute in the Inspector Panel.

### 2.3. General Summaries & Reporting
The agent can understand requests for high-level summaries of the entire AR portfolio.

**Example Commands:**
-   `"Summarize the aging report."`
-   `"What is the total amount overdue?"`

### 2.4. Client-Specific Information
The agent can retrieve and list all information related to a specific client.

**Example Commands:**
-   `"Show all invoices for Starlight Enterprises."`
-   `"What's the status of the Innovate Corp workflow?"`

### 2.5. Performance Analysis
For users with Manager or Admin roles, the agent can provide insights into team performance.

**Example Commands:**
-   `"Who is the top performing collector?"`

---

## 3. How to Interact

1.  **Use the AI Assistant Panel:** All interactions with the agent happen in the dedicated chat panel on the dashboard.
2.  **Ask Questions & Give Commands:** Speak to the agent as you would a human assistant. You can ask for reports, specific numbers, summaries, or tell it to perform actions like adding a note.
3.  **Use Quick Prompts:** The application provides dynamic quick prompts to suggest relevant commands.