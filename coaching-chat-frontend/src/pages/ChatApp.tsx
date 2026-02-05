import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ConversationList from '@/components/ConversationList';
import ChatWindow from '@/components/ChatWindow';
import type { Conversation } from '@/types';

export default function ChatApp() {
  const { user, signOut } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  // Estado para forzar la recarga de la lista de conversaciones
  const [listKey, setListKey] = useState(Date.now());

  const handleCreateNew = () => {
    const newConversationId = `new_${Date.now()}`;
    setSelectedConversationId(newConversationId);
  };

  const handleConversationCreated = (newConversation: Conversation) => {
    // Cuando el backend confirma la creación, actualizamos la UI
    setListKey(Date.now()); // Forza el refresh de la lista
    setSelectedConversationId(newConversation.id); // Cambia al ID real
  };

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
          key={listKey} // La key fuerza el remonte del componente
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            onConversationCreated={handleConversationCreated}
          />
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