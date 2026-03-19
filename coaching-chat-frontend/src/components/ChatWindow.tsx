import { useState, FormEvent, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import type { Message, Conversation } from '@/types';

type ChatWindowProps = {
  conversationId: string;
  onConversationCreated: (conversation: Conversation) => void;
};

export default function ChatWindow({ conversationId, onConversationCreated }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevIdRef = useRef<string>(conversationId);
  const isNewConversation = conversationId.startsWith('new_');

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Si el ID cambia de "new_..." a un ID real, NO borramos los mensajes.
    // Solo borramos si cambiamos a una conversación totalmente distinta.
    const isTransitioning = prevIdRef.current.startsWith('new_') && !conversationId.startsWith('new_');

    if (!isTransitioning) {
      setMessages([]);
      setIsLoading(!isNewConversation);
    } else {
      // Estamos transicionando: actualizamos el ID de los mensajes que ya tenemos en pantalla
      setMessages(prev => prev.map(m => ({ ...m, conversation_id: conversationId })));
    }

    prevIdRef.current = conversationId;

    const handleMessagesLoaded = (data: { conversationId: string; messages: Message[] }) => {
      if (data.conversationId === conversationId) {
        setMessages(data.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        setIsLoading(false);
      }
    };

    const handleAiResponse = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleAiTyping = (data: { conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId) {
        setIsAiTyping(data.isTyping);
      }
    };

    const handleConversationCreated = (newConversation: Conversation) => {
      onConversationCreated(newConversation);
    };

    socket.on('messages_loaded', handleMessagesLoaded);
    socket.on('ai_response', handleAiResponse);
    socket.on('ai_typing', handleAiTyping);
    socket.on('conversation_created', handleConversationCreated);

    if (!isNewConversation) {
      socket.emit('join_conversation', { conversationId });
      socket.emit('get_messages', { conversationId });
    } else {
      setMessages([{
        id: 'initial-ai-message',
        conversation_id: conversationId,
        role: 'assistant',
        content: 'Hola, soy tu asistente emocional. ¿En qué estás pensando?',
        created_at: new Date().toISOString(),
      }]);
    }

    return () => {
      socket.off('messages_loaded', handleMessagesLoaded);
      socket.off('ai_response', handleAiResponse);
      socket.off('ai_typing', handleAiTyping);
      socket.off('conversation_created', handleConversationCreated);
      if (!isNewConversation) {
        socket.emit('leave_conversation', { conversationId });
      }
    };
  }, [conversationId, isNewConversation, onConversationCreated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Solo hacemos scroll si hay mensajes nuevos o si la IA está escribiendo
    scrollToBottom();
  }, [messages, isAiTyping]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const messageContent = input.trim();
    if (!messageContent) return;

    const socket = getSocket();
    if (!socket) {
      console.error('Socket no conectado');
      return;
    }

    const tempId = `local_${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      role: 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (isNewConversation) {
      socket.emit('create_conversation_with_first_message', {
        message: messageContent,
      });
    } else {
      socket.emit('send_message', {
        conversationId: conversationId,
        message: messageContent,
      });
    }

    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-2">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shadow-inner">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 leading-tight tracking-tight">
                Coach de Liderazgo Estratégico
              </h2>
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs text-indigo-600/60 font-black uppercase tracking-[0.1em]">Sesión Activa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-8 pb-4 px-6 custom-scrollbar bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="max-w-7xl mx-auto space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sincronizando...</div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isFirstInGroup = idx === 0 || messages[idx - 1].role !== msg.role;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-500`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] px-6 py-4 rounded-2xl shadow-md text-[16px] leading-relaxed relative border ${msg.role === 'user'
                        ? 'bg-indigo-700 text-white border-indigo-800 rounded-tr-none'
                        : 'bg-white text-slate-800 border-slate-100 border-l-[6px] border-l-indigo-400 rounded-tl-none'
                        } ${isFirstInGroup ? 'mt-2' : 'mt-1'}`}
                    >
                      <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                      <div className={`text-[10px] mt-2 font-bold uppercase tracking-tighter opacity-50 ${msg.role === 'user' ? 'text-indigo-100 text-right' : 'text-slate-400 text-left'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 border-l-[6px] border-l-indigo-300 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2 animate-pulse">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-indigo-300 rounded-full"></span>
                      <span className="w-2 h-2 bg-indigo-300 rounded-full opacity-60"></span>
                      <span className="w-2 h-2 bg-indigo-300 rounded-full opacity-30"></span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analizando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-8" />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto relative">
          <div className="relative flex items-end bg-slate-50/50 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-sm">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as FormEvent);
                }
              }}
              placeholder="Cuéntame, ¿qué tienes en mente hoy?"
              className="flex-1 w-full pl-6 pr-16 py-4 bg-transparent rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none overflow-hidden min-h-[56px] max-h-[200px]"
              style={{ height: 'auto' }}
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto';
                  el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
                }
              }}
            />
            <button
              type="submit"
              className="absolute right-2 bottom-2 bg-indigo-600 text-white rounded-xl p-3 hover:bg-indigo-700 disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-indigo-200"
              disabled={!input.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
