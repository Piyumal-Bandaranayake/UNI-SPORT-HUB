'use client';

import { useState, useRef, useEffect } from 'react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am UniBot, your UniSportHub AI assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const currentInput = input.trim();
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          conversationHistory: messages
        }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { 
          role: 'assistant', 
          content: data.reply 
        }]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again.');
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      { role: 'assistant', content: 'Hello! I am UniBot, your UniSportHub AI assistant. How can I help you today?' },
    ]);
    setInput('');
    setError(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col animate-appear duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">UniBot</h3>
                <span className="text-xs text-white/80">Always active</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                title="Reset chat"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <polyline points="23 20 23 14 17 14" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none text-zinc-400">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            {error && (
              <div className="mb-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask UniBot anything..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 disabled:text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:hover:bg-transparent"
                title="Send"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group ${
          isOpen ? 'bg-zinc-800 text-white' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
        }`}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <div className="relative">
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
              <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></div>
          </div>
        )}
      </button>

    </div>
  );
};

export default AIAssistant;
