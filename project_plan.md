# FazeAR: AI Accounts Receivable Agent - Project Plan

This document outlines the phased development plan for the FazeAR project.

---

## Phase 1: Core AR & AI Foundation (Completed)

- [x] **Goal:** Establish the basic functionalities of an AR management tool and integrate a conversational AI assistant.
- [x] **Features:**
  - [x] **Workflow Tracker:** A central dashboard to view and manage all outstanding invoices (workflows).
  - [x] **Inspector Panel:** A detailed view for a selected workflow, showing key information, audit trails, and communication logs.
  - [x] **Conversational AI Assistant:** A chat interface powered by Gemini for answering questions and performing basic actions using function calling (e.g., assigning workflows, adding notes).
  - [x] **Role-Based Access:** UI adapts for different user roles (Admin, Manager, Collector).
  - [x] **Client Payment Portal:** A secure, separate view for clients to see their invoices and (simulate) payments.

---

## Phase 2: Autonomous Operations & Automation (Completed)

- [x] **Goal:** Empower the AI agent to move from a reactive assistant to a proactive, autonomous team member.
- [x] **Features:**
  - [x] **Customizable Dunning Plans:** A full CRUD interface in a settings modal for creating multi-step, time-based follow-up strategies.
  - [x] **AI Autonomous Mode:** A toggle (global and per-workflow) that allows the agent to proactively execute Dunning Plan steps. The agent will autonomously draft personalized follow-up emails and log them in the `CommunicationsLog` for review.
  - [x] **AI-Powered Cash Application:** An interface where users can paste unstructured remittance advice. The AI will parse the text, match payments to invoices, and present a confirmation screen to apply payments.
  - [x] **AI Live Call Simulation:** A feature to initiate a real-time, voice-based simulated phone call with an AI playing the role of the client's AP department, complete with live transcription and an AI-generated call summary.

---

## Phase 3: Advanced Intelligence & Analytics (Completed)

- [x] **Goal:** Provide deep, actionable insights into AR performance and transform complex data analysis into a simple conversation.
- [x] **Features:**
  - [x] **Analytics Dashboard:** A dedicated view with key metrics.
    - [x] Invoice Aging Report.
    - [x] Collector Performance Report.
  - [x] **Conversational Analytics:** Enable the AI assistant to answer complex, data-driven questions about reports and performance (e.g., "Who is the top performing collector?").
  - [x] **"What-If" Scenarios:** Allow users to ask the AI to simulate financial events (e.g., "What's the impact if Client X pays 30 days late?") and see the results visualized in a cash flow forecast chart.
  - [x] **AI-Powered Dispute Resolution:**
    - [x] Transform the Disputes Hub from a simple tracker into an intelligent resolution center.
    - [x] When a user opens a disputed invoice, the AI will provide an instant summary of the case.
    - [x] The AI will analyze the dispute reason and invoice history to suggest actionable next steps (e.g., "Offer partial credit," "Draft email requesting more information").
    - [x] Each suggestion will be a one-click action that the agent can execute (e.g., drafting the email).
    - [x] Create a dedicated modal for dispute resolution to provide a focused user experience.

---

## Phase 4: Integrations & Collaboration (In Progress)

- [ ] **Goal:** Connect FazeAR to the wider financial ecosystem and enhance client collaboration.
- [ ] **Features:**
  - [ ] **Real API Integrations:**
    - [x] Connect to QuickBooks Online API to sync invoices and customers in real-time. *(Implemented via Webhook Simulator)*
    - [x] Connect to Stripe API for real payment processing within the Client Portal. *(Implemented via Webhook Simulator)*
  - [ ] **Enhanced Client Portal:**
    - [ ] Allow clients to log in and not only pay but also view their entire invoice history.
    - [x] Enable clients to initiate a dispute directly from the portal, providing a reason and documentation.
  - [ ] **Email Integration (Gmail API):**
    - [ ] Allow the agent to send drafted communications directly from the user's connected email account.
    - [ ] Automatically scan the connected inbox for incoming emails that look like remittance advice and flag them for the Cash Application tool.