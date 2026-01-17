import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Inline ConversationList when ../components/ConversationList is missing
type Conversation = { id: string; title: string; lastMessage?: string };

type ConversationListProps = {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
};

function ConversationList({ selectedConversationId, onSelectConversation }: ConversationListProps) {
  const mockConversations: Conversation[] = [
    { id: '1', title: 'Conversación 1', lastMessage: 'Hola' },
    { id: '2', title: 'Conversación 2', lastMessage: 'Necesito ayuda' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <ul>
        {mockConversations.map((c) => (
          <li key={c.id}>
            <button
              className={`w-full text-left p-3 ${selectedConversationId === c.id ? 'bg-gray-100' : ''}`}
              onClick={() => onSelectConversation(c.id)}
            >
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-gray-500">{c.lastMessage}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Fallback inline ChatWindow component when ../components/ChatWindow is missing
type ChatWindowProps = { conversationId: string };

function ChatWindow({ conversationId }: ChatWindowProps) {
  return (
    <div className="flex-1 p-4">
      <h2 className="text-lg font-semibold">Conversation {conversationId}</h2>
      <div className="mt-4 text-sm text-gray-600">Contenido del chat...</div>
    </div>
  );
}


export default function ChatApp() {
  const { user, signOut } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Mis Conversaciones</h2>
            <button
              onClick={signOut}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Salir
            </button>
          </div>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>

        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <ChatWindow conversationId={selectedConversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Bienvenido a Coaching Emocional</h3>
              <p>Selecciona una conversación o crea una nueva para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}