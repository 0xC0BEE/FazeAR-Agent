# FazeAR: Project Plan & Roadmap

This document outlines the strategic plan, features, and development roadmap for the FazeAR platform.

---

## 1. Vision & Mission

**Vision:** To eliminate the friction in B2B payments by creating an intelligent, autonomous accounts receivable platform that feels less like software and more like a trusted colleague.

**Mission:** To empower small and medium-sized businesses (SMBs) with enterprise-grade AI tools, helping them accelerate cash flow, reduce manual work, and make smarter financial decisions through a conversational, AI-native experience.

---

## 2. Core Pillars

The development of FazeAR is guided by three core principles:

1.  **Conversational First:** The primary user interface should be a natural language conversation. The AI agent is not a feature; it *is* the application.
2.  **Intelligent Automation:** Move beyond simple, rule-based automation. The system should understand context, make recommendations, and learn from user interactions.
3.  **Actionable Insights:** Data should not just be displayed; it should be synthesized into clear, actionable insights that drive strategic decisions.

---

## 3. Key Milestones & Status

| Milestone                      | Status      | Key Features                                                              |
| ------------------------------ | ----------- | ------------------------------------------------------------------------- |
| **M1: Core Application Shell** | ✅ Complete | React project setup, UI/UX framework, state management, basic components. |
| **M2: AR Workflow Simulation** | ✅ Complete | Workflow Tracker, Inspector Panel, Mock Data, Role-Based Views.           |
| **M3: Conversational Agent**   | ✅ Complete | Gemini API integration, Chat UI, basic query handling.                    |
| **M4: Analytics & Reporting**  | ✅ Complete | Aging Report, Collector Performance Dashboard.                            |
| **M5: Advanced AI Tooling**    | ✅ Complete | AI-Powered Cash Application (Remittance Parsing).                         |
| **M6: Strategy Customization** | ✅ Complete | Full CRUD for Dunning Plans in settings.                                  |
| **M7: Proactive Automation**   | ✅ Complete | AI Autonomous Mode (Phase 1: Activity Logging).                           |
| **M8: Agent Actionability**    | 🔄 **Next** | Implement Gemini Function Calling for agent-driven actions.               |
| **M9: External Integrations**  | 📝 Planned  | Live API connections to QuickBooks, Stripe, and Gmail.                    |
| **M10: Client Collaboration**  | 📝 Planned  | Develop a client-facing payment portal.                                   |

---

## 4. Feature Roadmap

### Phase 1: Minimum Viable Product (MVP) - (Complete)
*   [x] Dashboard with Workflow Tracker & Inspector
*   [x] Role-based views for Admin, Manager, Collector
*   [x] Conversational AI Chat Interface
*   [x] Analytics Dashboard (Aging & Performance)
*   [x] AI Cash Application Tool
*   [x] Editable Dunning Plans
*   [x] Autonomous Mode (logging actions)

### Phase 2: Enhanced Agent Capabilities - (In Progress)
*   **Gemini Function Calling:** Enable the agent to perform actions based on user requests (e.g., "Send a reminder to Client X," "Assign workflow Y to Sarah").
*   **Tone & Language Adjustment:** Allow users to guide the AI in drafting communications with specific tones (e.g., firm, friendly) and in multiple languages.
*   **Predictive Insights:** Use historical data to predict late payments and identify at-risk accounts.

### Phase 3: Seamless Integration
*   **Live API Integrations:** Move from simulated webhooks to real, two-way data sync with QuickBooks (invoices), Stripe (payments), and Gmail (communications).
*   **Automated Communication:** Allow the Autonomous Agent to send emails directly through the connected Gmail account, based on the dunning plan templates.

### Phase 4: Full-Cycle AR Management
*   **Client Payment Portal:** A secure, client-facing portal where customers can view their invoices and make payments directly.
*   **Dispute Management Module:** A dedicated workflow for tracking and resolving invoice disputes.

This roadmap provides a clear path from our current functional prototype to a feature-rich, market-ready platform.
