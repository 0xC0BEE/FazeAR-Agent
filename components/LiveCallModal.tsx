import React, { useState, useEffect, useRef } from 'react';
import { LiveServerMessage, Modality, Blob } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import type { Workflow, ChatMessage } from '../types.ts';
import { PhoneIcon } from './icons/PhoneIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { NoteIcon } from './icons/NoteIcon.tsx';
import { startLiveConversation, summarizeConversation } from '../services/geminiService.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from './ui/Dialog.tsx';
import { Button } from './ui/Button.tsx';

type LiveSession = Awaited<ReturnType<typeof startLiveConversation>>;

// Audio decoding helpers from Gemini docs
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Audio encoding helper
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface LiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
  onAddNote: (note: string) => void;
}

export const LiveCallModal: React.FC<LiveCallModalProps> = ({ isOpen, onClose, workflow, onAddNote }) => {
    const [callState, setCallState] = useState<'idle' | 'connecting' | 'active' | 'summarizing' | 'ended'>('idle');
    const [transcript, setTranscript] = useState<ChatMessage[]>([]);
    const [summary, setSummary] = useState('');
    
    const sessionRef = useRef<LiveSession | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    
    let nextStartTime = 0;

    useEffect(() => {
        if (!isOpen) {
            handleEndCall(true); // Force cleanup if modal is closed unexpectedly
            setCallState('idle');
            setTranscript([]);
            setSummary('');
        }
    }, [isOpen]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const handleStartCall = async () => {
        if (!workflow) return;
        setCallState('connecting');
        
        try {
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const sessionPromise = startLiveConversation(workflow, {
                onMessage: handleLiveMessage,
                onError: (e) => console.error("Live session error:", e),
                onClose: () => console.log("Live session closed."),
            });
            
            const session = await sessionPromise;
            sessionRef.current = session;
            
            await setupMicrophone(sessionPromise);

            setCallState('active');
        } catch (error) {
            console.error("Failed to start call:", error);
            setCallState('idle');
        }
    };

    const setupMicrophone = async (sessionPromise: Promise<LiveSession>) => {
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        sourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };

        sourceRef.current.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
    };

    const handleLiveMessage = async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            setTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model') {
                    return [...prev.slice(0, -1), { ...last, content: (last.content || '') + text }];
                }
                return [...prev, { id: uuidv4(), role: 'model', content: text }];
            });
        }
        if (message.serverContent?.inputTranscription) {
             const text = message.serverContent.inputTranscription.text;
            setTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'user') {
                    return [...prev.slice(0, -1), { ...last, content: (last.content || '') + text }];
                }
                return [...prev, { id: uuidv4(), role: 'user', content: text }];
            });
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
        if (base64Audio && outputAudioContextRef.current) {
            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
            const source = outputAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current.destination);
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
        }
    };

    const handleEndCall = async (forceCleanup = false) => {
        if (!forceCleanup && callState !== 'active') return;

        // Stop microphone
        streamRef.current?.getTracks().forEach(track => track.stop());
        sourceRef.current?.disconnect();
        scriptProcessorRef.current?.disconnect();
        inputAudioContextRef.current?.close().catch(e => console.error(e));

        // Close session
        sessionRef.current?.close();
        
        sessionRef.current = null;
        streamRef.current = null;
        
        if (forceCleanup) return;
        
        setCallState('summarizing');

        const fullTranscript = transcript.map(t => `${t.role === 'user' ? 'Collector' : 'Client'}: ${t.content}`).join('\n');
        
        if (fullTranscript.trim()) {
            const summaryText = await summarizeConversation(fullTranscript);
            setSummary(summaryText);
        } else {
            setSummary("No conversation was recorded.");
        }
        
        setCallState('ended');
    };
    
    const handleAddSummaryToNotes = () => {
        if (summary) {
            onAddNote(summary);
            onClose();
        }
    };
  
    if (!isOpen || !workflow) return null;

    const renderContent = () => {
        switch (callState) {
            case 'idle':
            case 'connecting':
                return (
                    <div className="text-center">
                        <PhoneIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold text-foreground">AI Live Call Simulation</h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-6">
                            Initiate a simulated AI-powered call with an agent playing the role of the client to discuss this invoice. Your microphone will be used.
                        </p>
                         <Button onClick={handleStartCall} disabled={callState === 'connecting'} className="w-full bg-green-600 hover:bg-green-700">
                             {callState === 'connecting' ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <PhoneIcon className="w-5 h-5"/>}
                            <span className="ml-2">{callState === 'connecting' ? 'Connecting...' : 'Start Call'}</span>
                        </Button>
                    </div>
                );
            case 'active':
            case 'summarizing':
            case 'ended':
                 return (
                    <div className="flex flex-col h-[60vh]">
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/50 rounded-lg border">
                            {transcript.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                     {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-primary" /></div>}
                                     <div className={`max-w-md w-full ${msg.role === 'user' ? 'text-right' : ''}`}>
                                        <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                     </div>
                                     {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-muted-foreground" /></div>}
                                </div>
                            ))}
                             <div ref={transcriptEndRef} />
                        </div>
                        {callState === 'summarizing' && (
                            <div className="text-center p-4">
                                <SpinnerIcon className="w-6 h-6 animate-spin mx-auto text-muted-foreground"/>
                                <p className="text-sm text-muted-foreground mt-2">Generating call summary...</p>
                            </div>
                        )}
                        {callState === 'ended' && (
                             <div className="mt-4">
                                <h4 className="text-sm font-semibold text-foreground mb-2">Call Summary</h4>
                                <div className="text-sm text-foreground bg-muted p-3 rounded-md whitespace-pre-wrap max-h-32 overflow-y-auto border">
                                    {summary}
                                </div>
                             </div>
                        )}
                    </div>
                );
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Live Call: {workflow.clientName}</DialogTitle>
                    <DialogDescription>
                        Invoice <span className="font-mono">{workflow.externalId}</span> - <span className="font-mono">${workflow.amount.toLocaleString()}</span>
                         {callState === 'active' && <div className="inline-flex items-center gap-2 text-sm text-red-500 font-semibold ml-4"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>LIVE</div>}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {renderContent()}
                </div>

                <DialogFooter>
                   {callState === 'active' && (
                        <Button onClick={() => handleEndCall()} variant="destructive">
                            End Call
                        </Button>
                   )}
                   {callState === 'ended' && (
                       <>
                        <DialogClose asChild><Button variant="ghost">Close</Button></DialogClose>
                        <Button onClick={handleAddSummaryToNotes}>
                            <NoteIcon className="w-4 h-4 mr-2" /> Add Summary to Notes
                        </Button>
                       </>
                   )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
