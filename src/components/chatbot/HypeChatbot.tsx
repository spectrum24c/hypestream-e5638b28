import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from './ChatMessage';
import { Movie } from '@/types/movie';
import robotIcon from '@/assets/robot.png';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HypeChatbotProps {
  onMovieClick?: (movie: Movie) => void;
}

const HypeChatbot: React.FC<HypeChatbotProps> = ({ onMovieClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Listen for open event from BottomNav
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-hype-chat', handleOpen);
    return () => window.removeEventListener('open-hype-chat', handleOpen);
  }, []);
  const [personalityLevel, setPersonalityLevel] = useState(3);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! I'm HYPE, your personal movie guru! 🎬 What are you in the mood for today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const SUPABASE_URL = "https://csbytipwverpjxojulla.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYnl0aXB3dmVycGp4b2p1bGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Njk0NDIsImV4cCI6MjA1OTU0NTQ0Mn0.s3Nv-guhUB4ZYjzhgx_rNwbJLbtjCurZmo67nUi9UTA";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('chatbot_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (data && typeof data.personality_level === 'number') {
          setPersonalityLevel(data.personality_level);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const streamChat = async (userMessage: string) => {
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${SUPABASE_URL}/functions/v1/hype-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          personalityLevel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 429) {
          throw new Error('HYPE is catching their breath! Please try again in a moment. 🎬');
        }
        if (response.status === 402) {
          throw new Error('HYPE needs a power-up! Please contact support.');
        }
        
        throw new Error(errorData?.error || 'Failed to get response from HYPE');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      
      // Create assistant message placeholder
      const assistantMessageId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          } catch (e) {
            // Incomplete JSON, put it back
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw || raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          } catch { /* ignore */ }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: "destructive",
      });
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Oops! Something went wrong. Try again? 🎬",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    await streamChat(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "What's trending?",
    "Surprise me",
    "Action movies",
    "Feel-good comedies"
  ];

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 w-16 h-16 shadow-[0_20px_60px_rgba(0,0,0,0.7)] hover:scale-110 transition-all duration-300 hidden md:flex bg-gradient-to-br from-hype-purple via-primary to-hype-purple/80 text-primary-foreground border border-primary/50 rounded-2xl"
          aria-label="Open HYPE chat"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-white/10 rounded-2xl blur-md" />
            <img src={robotIcon} alt="HYPE" className="h-7 w-7 relative" />
          </div>
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-background via-background to-hype-dark/95">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/70 bg-background/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-hype-purple via-primary to-hype-purple/80 flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-sm" />
                <img src={robotIcon} alt="HYPE" className="h-5 w-5 relative" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground text-lg tracking-tight">HYPE</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Smarter picks, faster nights in.
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="hover:bg-secondary h-9 w-9 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6 max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onMovieClick={onMovieClick}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">HYPE is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && !isLoading && (
            <div className="px-4 md:px-6 pb-3 flex flex-wrap gap-2 max-w-4xl mx-auto w-full">
              {quickPrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(handleSend, 100);
                  }}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          )}

          <div className="px-4 md:px-6 pb-5 pt-3 border-t border-border/70 bg-background/80 backdrop-blur">
            <div className="flex items-end gap-3 max-w-4xl mx-auto w-full">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask HYPE for something to watch tonight..."
                className="flex-1 resize-none rounded-2xl border border-border bg-background/80 px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hype-purple focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] max-h-[120px] shadow-sm"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-11 w-11 rounded-2xl bg-gradient-to-br from-hype-purple via-primary to-hype-purple/80 text-primary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.6)] disabled:opacity-60 disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HypeChatbot;
