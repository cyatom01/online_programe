import React, { useState, useRef, useEffect } from 'react';
import { Send, Code, Eye, MonitorPlay, PanelLeftClose, PanelLeftOpen, Terminal } from 'lucide-react';
import { Message, MessageRole, INITIAL_CODE } from './types';
import { sendMessageStream, extractHtmlCode } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { CodeViewer } from './components/CodeViewer';
import { WebPreview } from './components/WebPreview';

const App: React.FC = () => {
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: MessageRole.Model,
      text: "Hello! I'm your AI Coding Assistant. Describe what you want to build, and I'll generate the code and preview for you.",
    },
  ]);
  const [input, setInput] = useState('');
  const [code, setCode] = useState(INITIAL_CODE);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'split'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // --- Refs ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Effects ---
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // --- Handlers ---

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: Message = {
      id: botMsgId,
      role: MessageRole.Model,
      text: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, initialBotMsg]);

    let fullText = '';

    try {
      const stream = sendMessageStream(userMsg.text);
      
      for await (const chunk of stream) {
        fullText += chunk;
        
        // Update the chat UI
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMsgId ? { ...msg, text: fullText } : msg
          )
        );

        // Try to extract code in real-time for live preview feeling
        const extracted = extractHtmlCode(fullText);
        if (extracted) {
          setCode(extracted);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* --- Sidebar (Chat) --- */}
      <div 
        className={`${
          isSidebarOpen ? 'w-full md:w-[400px] lg:w-[450px]' : 'w-0'
        } flex-shrink-0 flex flex-col border-r border-gray-800 transition-all duration-300 ease-in-out relative bg-gray-900 z-10`}
      >
        {/* Header */}
        <div className="h-14 flex items-center px-4 border-b border-gray-800 bg-gray-900 justify-between">
           <div className="flex items-center gap-2 text-indigo-400 font-bold">
             <Terminal size={20} />
             <span>AI Code Studio</span>
           </div>
           {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-800 rounded">
                <PanelLeftOpen size={18} />
              </button>
           )}
           <button 
             onClick={() => setIsSidebarOpen(false)} 
             className="md:hidden p-2 hover:bg-gray-800 rounded"
             aria-label="Close sidebar on mobile"
           >
              <PanelLeftClose size={18} />
           </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI to change the code..."
              className="w-full bg-gray-950 text-gray-200 rounded-xl pl-4 pr-12 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-gray-800 placeholder-gray-600 text-sm scrollbar-hide"
              rows={3}
              disabled={isStreaming}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isStreaming}
              className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-colors ${
                input.trim() && !isStreaming
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-gray-600">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </div>

      {/* --- Main Content (Editor + Preview) --- */}
      <div className="flex-1 flex flex-col h-full bg-gray-950 relative min-w-0">
        
        {/* Toolbar / Toggle Sidebar Button */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-2">
             {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                >
                  <PanelLeftOpen size={20} />
                </button>
             )}
             
             {/* Tabs */}
             <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800 ml-2">
                <button
                  onClick={() => setActiveTab('split')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all hidden lg:flex ${
                    activeTab === 'split' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <MonitorPlay size={14} /> Split
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
                    activeTab === 'preview' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
                    activeTab === 'code' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Code size={14} /> Code
                </button>
             </div>
          </div>
          
          <div className="text-xs text-gray-500 hidden sm:block">
            ReadOnly Preview (Sandboxed)
          </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* Split View (Desktop default) */}
          <div className={`h-full w-full flex flex-col lg:flex-row ${activeTab !== 'split' ? 'hidden' : ''}`}>
             <div className="flex-1 border-r border-gray-800 relative min-w-[300px]">
                <WebPreview code={code} />
             </div>
             <div className="flex-1 h-full min-w-[300px]">
                <CodeViewer code={code} onChange={setCode} />
             </div>
          </div>

          {/* Full Preview Mode */}
          <div className={`h-full w-full ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
             <WebPreview code={code} />
          </div>

          {/* Full Code Mode */}
          <div className={`h-full w-full ${activeTab === 'code' ? 'block' : 'hidden'}`}>
             <CodeViewer code={code} onChange={setCode} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;