import React, { useState } from 'react';
import { ShieldIcon } from './icons/ShieldIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(apiKey);
  };

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-2xl p-6 border border-slate-700 text-slate-300">
        <div className="text-center mb-6">
            <BotIcon className="w-16 h-16 text-purple-400 mx-auto mb-4"/>
            <h1 className="text-2xl font-bold text-white">Welcome to FazeAR</h1>
            <p className="text-slate-400">To activate the AI agent, please provide your Gemini API key.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-semibold text-slate-300 mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-blue-700 disabled:bg-slate-600"
            disabled={!apiKey.trim()}
          >
            Save & Continue
          </button>
        </form>
        <div className="mt-4 text-xs text-slate-500 flex items-start gap-2">
            <ShieldIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
                Your API key is stored securely in your browser's session storage and is never saved in our database or exposed publicly. It is only used to communicate with the Gemini API.
            </p>
        </div>
      </div>
    </div>
  );
};