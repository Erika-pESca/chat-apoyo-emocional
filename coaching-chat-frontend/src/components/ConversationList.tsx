type Conversation = { id: string; title: string; lastMessage?: string };

type ConversationListProps = {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNew: () => void; // Función para crear una nueva conversación
};

// Datos de ejemplo
const mockConversations: Conversation[] = [
  { id: '1', title: 'Análisis de Sentimientos', lastMessage: 'Claro, puedo ayudarte con eso.' },
  { id: '2', title: 'Plan de Carrera', lastMessage: 'Hablemos de tus metas...' },
];

export default function ConversationList({
  selectedConversationId,
  onSelectConversation,
  onCreateNew,
}: ConversationListProps) {
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
        {mockConversations.map((c) => (
          <li key={c.id}>
            <button
              className={`w-full text-left p-3 transition-colors ${
                selectedConversationId === c.id
                  ? 'bg-gray-200'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onSelectConversation(c.id)}
            >
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-gray-500 truncate">{c.lastMessage}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
