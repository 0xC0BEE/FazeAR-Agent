import React, { useState } from 'react';
import { ShieldIcon } from './icons/ShieldIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Label } from './ui/Label.tsx';

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
    <div className="bg-background min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-2xl p-6 border text-card-foreground">
        <div className="text-center mb-6">
            <BotIcon className="w-16 h-16 text-primary mx-auto mb-4"/>
            <h1 className="text-2xl font-bold text-foreground">Welcome to FazeAR</h1>
            <p className="text-muted-foreground">To activate the AI agent, please provide your Gemini API key.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="apiKey" className="block text-sm font-semibold mb-2">
              Gemini API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!apiKey.trim()}
          >
            Save & Continue
          </Button>
        </form>
        <div className="mt-4 text-xs text-muted-foreground flex items-start gap-2">
            <ShieldIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
                Your API key is stored securely in your browser's session storage and is never saved in our database or exposed publicly. It is only used to communicate with the Gemini API.
            </p>
        </div>
      </div>
    </div>
  );
};