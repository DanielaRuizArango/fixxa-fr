import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";
import { MessageSquare } from "lucide-react";

const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "Usuario";

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await fetchData("/chat");
        setConversations(response.data || []);
      } catch (err) {
        console.error("Error cargando conversaciones:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  return (
    <MainLayout roleName={userName} profileRoute={role === "technician" ? "/technicianProfile" : "/customerProfile"}>
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <h1 className="text-3xl font-bold font-['Kadwa']">Mis Mensajes</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Cargando tus mensajes...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="bg-[#2f343b] p-6 rounded-full mb-4">
              <MessageSquare size={48} className="text-[#8C7E97]" />
            </div>
            <p className="text-gray-400">No tienes conversaciones activas.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conv) => {
              const lastMessage = conv.messages?.[0];
              const otherUser = role === "client" ? conv.technician?.user : conv.client?.user;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className="bg-[#2f343b] p-5 rounded-2xl border border-white/10 hover:border-[#8C7E97]/50 transition cursor-pointer flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#8C7E97]/20 flex items-center justify-center text-[#8C7E97] font-bold text-xl uppercase">
                    {otherUser?.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white group-hover:text-[#8C7E97] transition">{otherUser?.name || 'Usuario'}</h3>
                      <span className="text-[10px] text-gray-500">
                        {lastMessage ? new Date(lastMessage.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {lastMessage ? lastMessage.message : 'No hay mensajes aún'}
                    </p>
                    <div className="mt-2 inline-block px-2 py-0.5 rounded-lg bg-[#1c2526] text-[10px] text-gray-500 border border-white/5">
                      FTS-{conv.service_case_id} · {conv.service_case?.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ChatList;
