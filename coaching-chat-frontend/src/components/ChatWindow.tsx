import { useState, FormEvent, useEffect, useRef } from 'react';

// Define el tipo para un solo mensaje
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

// Props que el componente recibirá
type ChatWindowProps = {
  conversationId: string;
};

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simula la carga de mensajes históricos cuando cambia la conversación
  useEffect(() => {
    // En una aplicación real, aquí harías una llamada a la API para obtener los mensajes
    setMessages([
      { id: '1', text: `Hola, bienvenido a la conversación ${conversationId}.`, sender: 'ai' },
      { id: '2', text: '¿En qué puedo ayudarte hoy?', sender: 'ai' },
    ]);
  }, [conversationId]);

  // Efecto para hacer scroll hacia el último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simula la respuesta de la IA después de un segundo
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Gracias por tu mensaje. Estoy procesando tu solicitud.',
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Conversación {conversationId}</h2>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg px-4 py-2 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
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
