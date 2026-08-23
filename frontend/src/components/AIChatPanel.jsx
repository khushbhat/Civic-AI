import { useState, useRef, useEffect } from 'react';
import { chatWithScheme } from '../api';

function AIChatPanel({ schemeId, schemeName }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! I'm CivicAI. Ask me anything about ${schemeName}.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithScheme(schemeId, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', text: response.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-panel editorial-panel-inverse sticky top-8 flex h-[600px] flex-col overflow-hidden">
      <div className="border-b border-white/20 p-4 md:p-5">
        <p className="editorial-kicker text-white/70">Assistant</p>
        <h3 className="mt-3 font-display text-3xl tracking-tighter">Ask CivicAI</h3>
        <p className="mt-3 text-xs leading-relaxed text-white/70">
          Responses are generated only from verified scheme documents for {schemeName}.
        </p>
      </div>
      
      <div className="flex-grow space-y-4 overflow-y-auto p-4 md:p-5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] border px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'border-black bg-black text-white'
                : 'border-white/25 bg-white text-black'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="border border-white/25 bg-white px-4 py-3 text-sm text-black">
              Writing response...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-white/20 p-4 md:p-5">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            aria-label="Ask a question about the scheme"
            className="editorial-input flex-grow bg-white text-sm"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="inline-flex shrink-0 items-center justify-center border border-white bg-white px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors duration-100 hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:border-white/30 disabled:bg-transparent disabled:text-white/40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIChatPanel;
