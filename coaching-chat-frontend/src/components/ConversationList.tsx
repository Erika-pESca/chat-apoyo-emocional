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

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-2">
        <button
          onClick={onCreateNew}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium mb-4"
        >
          + Nueva Conversación
        </button>
      </div>
      <ul>
        {conversations.length > 0 ? (
          conversations.map((c) => (
            <li key={c.id}>
              <button
                className={`w-full text-left p-3 transition-colors ${
                  selectedConversationId === c.id
                    ? 'bg-gray-200'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => onSelectConversation(c.id)}
              >
                <div className="font-semibold truncate">{c.titulo}</div>
              </button>
            </li>
          ))
        ) : (
          <li className="p-4 text-center text-gray-500">
            No hay conversaciones.
          </li>
        )}
      </ul>
    </div>
  );
}
