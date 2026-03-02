import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Conversation } from '@/types'; // Importar el tipo oficial

type ConversationListProps = {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNew: () => void;
};

export default function ConversationList({
  selectedConversationId,
  onSelectConversation,
  onCreateNew,
}: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        setConversations(data || []);
      } catch (err: any) {
        setError('Error al cargar las conversaciones.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Cargando...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  // Función para formatear fechas de forma amigable
  const formatFriendlyDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Ahora mismo';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 172800) return 'Ayer';
    
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4">
        <button
          onClick={onCreateNew}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-sm font-semibold mb-4 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Sesión
        </button>
      </div>
      <div className="space-y-1">
        {conversations.length > 0 ? (
          conversations.map((c) => (
            <button
              key={c.id}
              className={`w-full text-left p-4 transition-all border-l-4 ${
                selectedConversationId === c.id
                  ? 'bg-blue-50 border-blue-500 shadow-sm'
                  : 'hover:bg-gray-50 border-transparent'
              }`}
              onClick={() => onSelectConversation(c.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-800 truncate flex-1 mr-2">
                  {c.titulo || 'Nueva Conversación'}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">
                  {formatFriendlyDate(c.updated_at)}
                </span>
              </div>
              
              {/* Fragmento del resumen de la IA */}
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {c.summary || 'Inicia tu sesión de coaching para generar un resumen...'}
              </p>
            </button>
          ))
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            No tienes sesiones guardadas.
          </div>
        )}
      </div>
    </div>
  );
}
