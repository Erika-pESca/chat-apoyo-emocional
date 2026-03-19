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
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col z-20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">Mis Sesiones</h2>
            <button
              onClick={signOut}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
            >
              Salir
            </button>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-slate-600 truncate flex-1">{user?.email}</p>
          </div>
        </div>

        <ConversationList
          key={listKey}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50 relative">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            onConversationCreated={handleConversationCreated}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center border border-slate-100">
                  <svg
                    className="w-16 h-16 text-blue-500/80"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  Hola, <span className="text-blue-500">Líder</span>
                </h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                  Este es tu espacio seguro para reflexionar y crecer. ¿En qué puedo apoyarte hoy?
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleCreateNew}
                  className="px-8 py-3.5 bg-blue-500 text-white rounded-2xl font-bold shadow-[0_10px_25px_rgba(59,130,246,0.3)] hover:bg-blue-600 transition-all active:scale-95"
                >
                  Empezar nueva sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}