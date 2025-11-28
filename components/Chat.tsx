
import React, { useState, useRef, useEffect } from 'react';
import { Laptop, ChatMessage } from '../types';
import { chatWithData } from '../api';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatProps {
  data: Laptop[];
}

const Chat: React.FC<ChatProps> = ({ data }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: `Hello! I'm your LapPrice Data Analyst. I have access to ${data.length} laptop records. Ask me anything about prices, brands, or trends!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare context data summary for the AI
    // We summarize to avoid token limits with large datasets
    const contextSummary = `
      Dataset Overview:
      - Total Records: ${data.length}
      - Columns: Company, TypeName, Inches, Ram (GB), OpSys, Weight (kg), Price (INR)
      
      Sample Rows:
      ${JSON.stringify(data.slice(0, 15))}

      Stats:
      - Expensive: ${Math.max(...data.map(d => d.price))}
      - Cheap: ${Math.min(...data.map(d => d.price))}
    `;

    const responseText = await chatWithData(input, messages.map(m => ({ role: m.role, text: m.text })), contextSummary);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center space-x-3">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-medium">Data Analyst Agent</h3>
          <p className="text-xs text-slate-400 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Online • Access to {data.length} records
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                 {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div 
                className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-700 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-slate-700/50 text-slate-400 p-3 rounded-2xl rounded-bl-none">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">Processing data...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900/30 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the laptop data..."
            className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
