import React, { useState } from 'react';
import { ShieldIcon } from './icons/ShieldIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from './ui/Dialog.tsx';
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
    if (apiKey.trim()) {
      onSave(apiKey);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="text-center items-center">
          <BotIcon className="w-16 h-16 text-primary mx-auto mb-4"/>
          <DialogTitle className="text-2xl">Welcome to FazeAR</DialogTitle>
          <DialogDescription>
            To activate the AI agent, please provide your Gemini API key.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">
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
             <div className="mt-2 text-xs text-muted-foreground flex items-start gap-2">
                <ShieldIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>
                    Your API key is stored securely in your browser's session storage and is never saved.
                </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={!apiKey.trim()}>
              Save & Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};