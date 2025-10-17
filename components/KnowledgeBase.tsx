import React, { useState } from 'react';
import { DocumentIcon } from './icons/DocumentIcon';
import { BotIcon } from './icons/BotIcon';

const TOPICS = [
    { id: 'introduction', title: 'Introduction', icon: <BotIcon className="w-4 h-4" /> },
    { id: 'dashboard', title: 'Dashboard & Workflows', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'ai-assistant', title: 'AI Assistant', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'autonomous-mode', title: 'Autonomous Mode', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'analytics', title: 'Analytics & Scenarios', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'cash-app', title: 'Cash Application', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'disputes', title: 'Dispute Management', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'settings', title: 'Settings & Dunning Plans', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'integrations', title: 'Integrations & Portal', icon: <DocumentIcon className="w-4 h-4" /> },
];

const TopicContent: React.FC<{ topicId: string }> = ({ topicId }) => {
    switch (topicId) {
        case 'introduction':
            return (
                <Section title="Welcome to FazeAR">
                    <p>FazeAR is a modern, AI-powered agent designed to automate and streamline accounts receivable workflows. It transforms the tedious process of managing invoices, chasing payments, and communicating with clients into a simple, conversational experience.</p>
                    <p>This Knowledge Base is your guide to mastering the FazeAR AI Agent and platform. Use the navigation on the left to explore the core features and learn how to leverage them to accelerate your cash flow and reduce manual effort.</p>
                </Section>
            );
        case 'dashboard':
            return (
                <Section title="Dashboard & Workflow Tracker">
                    <p>The Dashboard is your command center. The heart of the dashboard is the **Workflow Tracker**, which lists all active invoices (workflows). You can switch between "My Queue" to see workflows assigned to you and "All Active" to see every open workflow.</p>
                    <p><strong>Use Cases:</strong></p>
                    <ul>
                        <li>Quickly identify overdue invoices.</li>
                        <li>Filter workflows by status (Overdue, In Progress).</li>
                        <li>Search for a specific client to see their outstanding balance.</li>
                    </ul>
                    <p><strong>Example:</strong> Click on an "Overdue" workflow in the tracker to load its details into the Inspector Panel.</p>
                </Section>
            );
        case 'ai-assistant':
            return (
                 <Section title="AI Assistant & Function Calling">
                    <p>The **AI Assistant** is your primary interface for interacting with data. Using natural language, you can ask questions, get summaries, and command the agent to perform actions.</p>
                    <p><strong>Function Calling:</strong> This allows the agent to use "tools" to perform tasks directly. You can tell it to:</p>
                    <ul>
                        <li>`assign_workflow`: "Assign Quantum Dynamics to Sarah Lee."</li>
                        <li>`add_note_to_workflow`: "Add a note to Apex Industries that they will pay next Friday."</li>
                        <li>`dispute_invoice`: "Dispute the Nexus invoice, client claims goods not received."</li>
                    </ul>
                    <p>The agent will show a "Tool Call" in the chat to confirm the action it's taking.</p>
                    <hr />
                    <p><strong>Tone Adjustment:</strong> You can guide the agent's communication style using the **Tone** controls in the chat interface. This is perfect for drafting client-facing messages.</p>
                    <p><strong>Example:</strong> Select the "Friendly" tone and ask: "Draft a gentle reminder for Starlight Enterprises about their overdue invoice."</p>
                </Section>
            );
        case 'autonomous-mode':
            return (
                <Section title="Autonomous Mode">
                    <p>**Autonomous Mode** turns the agent into a proactive collector. When enabled (either globally or for a specific workflow), the agent will automatically execute the steps defined in an invoice's **Dunning Plan**.</p>
                    <p>The agent now drafts and logs full emails to the **Communications Log**, providing a tangible output of its work while maintaining the "human in the loop" principle.</p>
                    <p><strong>Use Cases:</strong></p>
                    <ul>
                        <li>Ensure follow-ups happen consistently without manual intervention.</li>
                        <li>Automatically draft and log reminder emails on the correct day.</li>
                        <li>Reduce the mental overhead for your collections team.</li>
                    </ul>
                    <p><strong>Example:</strong> Toggle on "Autonomous" for the whole system. The agent will now check all overdue invoices and, if one matches a Dunning Plan step, will draft a personalized email and add it to the Comms Log for your review. You'll see real-time notifications as it works.</p>
                </Section>
            );
        case 'analytics':
             return (
                <Section title="Analytics & 'What-If' Scenarios">
                    <p>The **Analytics** page provides high-level insights into your accounts receivable health. It features reports on Invoice Aging and Collector Performance.</p>
                    <hr />
                    <p><strong>'What-If' Scenarios:</strong> This powerful feature lets you simulate financial events. You can ask the AI Assistant a question like:</p>
                    <blockquote>"What is the impact on cash flow if Innovate Corp pays 30 days late?"</blockquote>
                    <p>The agent will run the simulation and direct you to the Analytics page, where the **Cash Flow Forecast** will show a comparison chart visualizing the impact.</p>
                </Section>
            );
        case 'cash-app':
             return (
                <Section title="AI-Powered Cash Application">
                    <p>This powerful AI tool eliminates the manual data entry of matching payments. You can find it in the "Cash App" tab in the right-hand Action Hub.</p>
                    <p>Paste unstructured text from a remittance advice email or bank statement into the text area. The AI will read the text, identify the client, invoice number, and amount paid, and then find the matching workflow in your system.</p>
                    <p>A confirmation modal will appear, allowing you to apply the matched payments with a single click, automatically updating the invoice statuses to "Completed".</p>
                </Section>
            );
        case 'disputes':
             return (
                <Section title="Dispute Management Hub">
                    <p>The **Disputes Hub** provides a structured, visual way to manage disputed invoices, which are a common cause of payment delays.</p>
                    <p>It features a **Kanban-style board** with columns for each stage of the dispute process: "New," "Under Review," "Resolution Proposed," and "Resolved."</p>
                    <p>You can initiate a dispute from the Inspector Panel or by telling the agent. The disputed workflow will appear on the board, where you can drag and drop it between stages as you work towards a resolution.</p>
                </Section>
            );
        case 'settings':
            return (
                <Section title="Settings & Dunning Plans">
                    <p>The **Settings** modal (accessible via the gear icon) is where you configure your collections strategy. The most important section is **Dunning Plans**.</p>
                    <p>A Dunning Plan is a sequence of automated steps the agent follows for overdue invoices. You can create multiple plans (e.g., a standard plan, an aggressive one for high-risk clients) and assign them to different workflows.</p>
                    <p><strong>Example:</strong> Create a "Standard" plan with steps to send a "First Reminder" at 1 day overdue, a "Second Reminder" at 7 days, and a "Final Notice" at 15 days.</p>
                </Section>
            );
        case 'integrations':
            return (
                 <Section title="Integrations & Client Portal">
                    <p>The **Integrations Hub** is where you'll manage connections to external services like QuickBooks, Stripe, and Gmail (in future versions).</p>
                    <hr />
                    <p>The **Client Portal** provides a secure, dedicated space for your clients to view and pay their invoices directly, creating a seamless payment experience. You can simulate this view by selecting the "John Smith (Client)" user from the user dropdown.</p>
                </Section>
            );
        default:
            return <p>Select a topic to get started.</p>;
    }
};

export const KnowledgeBase: React.FC = () => {
    const [activeTopic, setActiveTopic] = useState(TOPICS[0].id);

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
            {/* Sidebar */}
            <nav className="md:w-1/4 flex-shrink-0">
                <div className="sticky top-24">
                    <h2 className="text-lg font-semibold text-white mb-4">Topics</h2>
                    <ul className="space-y-1">
                        {TOPICS.map(topic => (
                            <li key={topic.id}>
                                <button
                                    onClick={() => setActiveTopic(topic.id)}
                                    className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                                        activeTopic === topic.id
                                            ? 'bg-blue-600/20 text-blue-300 font-semibold'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                                >
                                    {topic.icon}
                                    {topic.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Content */}
            <main className="md:w-3/4 bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
                <TopicContent topicId={activeTopic} />
            </main>
             <style>{`
                .prose h3 {
                    color: #cbd5e1; /* slate-300 */
                    font-size: 1.1em;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    border-bottom: 1px solid #475569; /* slate-600 */
                    padding-bottom: 0.25em;
                }
                .prose p, .prose ul {
                    margin-bottom: 1em;
                    color: #94a3b8; /* slate-400 */
                }
                .prose ul {
                    list-style-type: disc;
                    padding-left: 20px;
                }
                .prose ul li {
                    margin-bottom: 0.5em;
                }
                .prose strong {
                    color: #e2e8f0; /* slate-200 */
                }
                .prose blockquote {
                    border-left: 3px solid #6366f1; /* indigo-500 */
                    padding-left: 1em;
                    margin-left: 0;
                    font-style: italic;
                    color: #94a3b8; /* slate-400 */
                }
                .prose hr {
                    border-color: #475569; /* slate-600 */
                    margin: 2em 0;
                }
            `}</style>
        </div>
    );
};

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
    <section className="p-6 md:p-8">
        <h1 className="text-3xl font-bold text-white mb-6 border-b border-slate-600 pb-3">{title}</h1>
        <div className="space-y-4 text-sm prose">
            {children}
        </div>
    </section>
);
