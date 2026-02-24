'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, Plus, Menu } from 'lucide-react';

const STORAGE_KEY = 'chat_conversations';

export default function ChatPage() {
  const [conversations, setConversations] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [{ id: '1', title: 'New Chat', messages: [] }];
    }
    return [{ id: '1', title: 'New Chat', messages: [] }];
  });
  const [currentConvId, setCurrentConvId] = useState('1');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 768px)').matches;
    }
    return false;
  });
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 768px)').matches;
    }
    return false;
  });
  const messagesEndRef = useRef(null);

  const currentConv = conversations.find(conv => conv.id === currentConvId) || { messages: [] };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handler = (e) => {
      setIsDesktop(e.matches);
      setShowSidebar(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConv.messages]);

  const handleSend = async () => {
    if (!input.trim()) {
      setError('Please enter a message');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setError('');
    updateMessages([...currentConv.messages, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 503
            ? 'LM Studio is offline. Please ensure it is running at http://localhost:2301'
            : `API Error: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      updateMessages([...currentConv.messages, { role: 'user', content: userMessage }, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setError(err.message || 'Failed to get response. Please try again.');
      updateMessages(currentConv.messages);
    } finally {
      setLoading(false);
    }
  };

  const updateMessages = (newMessages) => {
    setConversations(prev => prev.map(conv =>
      conv.id === currentConvId ? { ...conv, messages: newMessages } : conv
    ));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newConv = { id: newId, title: `Chat ${conversations.length + 1}`, messages: [] };
    setConversations(prev => [...prev, newConv]);
    setCurrentConvId(newId);
  };

  const selectConversation = (id) => {
    setCurrentConvId(id);
    if (!isDesktop) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground relative">
      {/* Sidebar */}
      <aside
        className={`${showSidebar ? 'block' : 'hidden'} w-64 border-r border-border bg-card flex-shrink-0 overflow-y-auto ${!isDesktop ? 'absolute top-0 left-0 h-full z-10 shadow-lg' : ''}`}
      >
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="flex w-full items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Chat
          </button>
        </div>
        <div className="px-4">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">History</h3>
          <ul className="space-y-1">
            {conversations.map(conv => (
              <li key={conv.id}>
                <button
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${conv.id === currentConvId ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                    }`}
                >
                  {conv.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {showSidebar && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/50 z-0"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-accent rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">AI</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold">Assistant</h1>
                <p className="text-xs text-muted-foreground">Powered by Pham Minh Thao</p>
              </div>
            </div>
            <button
              onClick={createNewChat}
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors md:px-4 md:py-2"
            >
              <Plus className="h-4 w-4" />
              New
            </button>
          </div>
        </header>

        {/* Messages Container */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
            {currentConv.messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 text-6xl">💬</div>
                <h2 className="mb-2 text-3xl font-bold">Welcome to Chat Assistant</h2>
                <p className="max-w-md text-muted-foreground">
                  Start a new conversation by typing a message below or selecting a previous chat from the sidebar.
                </p>
              </div>
            )}

            {currentConv.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
              >
                {msg.role !== 'user' && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">AI</span>
                  </div>
                )}
                <div
                  className={`rounded-xl px-4 py-3 shadow-sm max-w-[90%] sm:max-w-md md:max-w-2xl lg:max-w-3xl ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border'
                    }`}
                >
                  <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">U</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">AI</span>
                </div>
                <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="rounded-xl bg-destructive/10 px-4 py-3 shadow-sm max-w-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="text-destructive">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer className="border-t border-border bg-card shadow-lg">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Enter to send)"
                  disabled={loading}
                  className="flex-1 rounded-full border border-input bg-background px-6 py-3 text-base placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-shadow"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="rounded-full bg-primary p-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Send message"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="text-center text-sm font-normal text-muted-foreground">
                <a
                  href="https://www.linkedin.com/in/mtpe-minhthaopham"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  © 2026 Pham Minh Thao. All rights reserved. Powered by Pham Minh Thao AI.
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}