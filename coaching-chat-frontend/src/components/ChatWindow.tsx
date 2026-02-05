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
  const isNewConversation = conversationId.startsWith('new_');

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    setMessages([]);
    setIsLoading(!isNewConversation);
    
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          {isNewConversation ? 'Nueva Conversación' : `Conversación`}
        </h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500">Cargando mensajes...</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isAiTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-2xl">
                Escribiendo...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:opacity-50"
            disabled={!input.trim()}
          >
             <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
