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
    <div className="flex-1 min-h-0 flex flex-col pt-2 overflow-hidden">
      <div className="px-6 mb-6 flex-shrink-0">
        <button
          onClick={onCreateNew}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-all font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(59,130,246,0.2)] active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Conversación
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-10">
        {conversations.length > 0 ? (
          conversations.map((c) => (
            <button
              key={c.id}
              className={`w-full text-left p-4 rounded-2xl transition-all group relative ${selectedConversationId === c.id
                  ? 'bg-slate-100 shadow-sm'
                  : 'bg-transparent hover:bg-slate-50'
                }`}
              onClick={() => onSelectConversation(c.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold transition-colors truncate flex-1 mr-2 ${selectedConversationId === c.id ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                  }`}>
                  {c.titulo || 'Nueva Conversación'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                  {formatFriendlyDate(c.updated_at)}
                </span>
              </div>

              <p className={`text-xs line-clamp-2 leading-relaxed transition-colors ${selectedConversationId === c.id ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-500'
                }`}>
                {c.summary || 'Comienza tu sesión para ver un resumen ejecutivo...'}
              </p>

              {selectedConversationId === c.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              )}
            </button>
          ))
        ) : (
          <div className="p-12 text-center text-slate-300 text-xs font-semibold">
            Sin sesiones archivadas
          </div>
        )}
      </div>
    </div>
  );
}
