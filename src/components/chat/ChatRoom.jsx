import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";
import { Send, ArrowLeft, XCircle } from "lucide-react";
import Swal from "sweetalert2";

const ChatRoom = () => {
  const { id } = useParams(); // conversation_id
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "Usuario";
  const userId = parseInt(localStorage.getItem("userId"));
  const [caseStatus, setCaseStatus] = useState(null);
  const [resolvingCase, setResolvingCase] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChat = useCallback(async (retryCount = 0) => {
    try {
      if (retryCount === 0) setLoading(true);
      const response = await fetchData(`/chat/${id}`);
      
      // Intentar obtener la conversación de diferentes estructuras posibles
      const convData = response.data?.conversation || response.conversation;
      const msgsData = response.data?.messages || response.messages || [];
      
      if (convData) {
        setConversation(convData);
        setMessages(msgsData);
        setCaseStatus(convData.service_case?.status || null);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      } else if (retryCount < 5) {
        // Si no hay conversación, reintentar en 2 segundos (posible race condition)
        console.log(`Conversación no encontrada, reintentando... (${retryCount + 1}/5)`);
        setTimeout(() => loadChat(retryCount + 1), 2000);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error al cargar el chat:", err);
      if (retryCount < 5) {
        setTimeout(() => loadChat(retryCount + 1), 2000);
      } else {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    loadChat();

    /**
     * Polling como fallback temporal (WebSockets requieren configuración de
     * Laravel Echo + Pusher en el backend).
     *
     * Mejoras aplicadas:
     *  - Intervalo aumentado a 8s (era 5s) para reducir carga de red.
     *  - Se pausa automáticamente cuando la pestaña está oculta.
     *  - Solo actualiza el estado si hay mensajes nuevos (compara último ID).
     */
    let intervalId = null;

    const pollMessages = async () => {
      // No hacer peticiones si la pestaña no está activa
      if (document.visibilityState === 'hidden') return;
      try {
        const response = await fetchData(`/chat/${id}`);
        const newMessages = response.data?.messages || response.messages || [];
        setMessages(prev => {
          // Solo actualizar si realmente hay mensajes nuevos
          if (
            newMessages.length !== prev.length ||
            (newMessages.length > 0 && newMessages[newMessages.length - 1].id !== prev[prev.length - 1]?.id)
          ) {
            return newMessages;
          }
          return prev;
        });
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    };

    intervalId = setInterval(pollMessages, 8000);

    // Pausar/reanudar polling según visibilidad de la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pollMessages(); // Actualizar inmediatamente al volver
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id, loadChat]);

  useEffect(scrollToBottom, [messages]);

  const handleResolveFromChat = async () => {
    const serviceCaseId = conversation?.service_case?.id;
    if (!serviceCaseId) return;

    const result = await Swal.fire({
      icon: "question",
      title: "Terminar caso",
      text: "¿Confirmas que el trabajo ha sido completado? Podrás calificar al técnico a continuación.",
      showCancelButton: true,
      confirmButtonText: "Sí, terminar",
      cancelButtonText: "Cancelar",
      background: "#1C2526",
      color: "#ffffff",
      confirmButtonColor: "#8C7E97",
      cancelButtonColor: "#4C5462",
    });
    if (!result.isConfirmed) return;

    setResolvingCase(true);
    try {
      await fetchData(`/client/cases/${serviceCaseId}/resolve`, { method: "PATCH" });
      await Swal.fire({
        icon: "success",
        title: "¡Caso terminado!",
        text: "Ahora puedes calificar al técnico.",
        background: "#1C2526",
        color: "#ffffff",
        confirmButtonColor: "#8C7E97",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      navigate(`/case-detail/${serviceCaseId}`);
    } catch (err) {
      console.error("Error al terminar el caso desde el chat:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo terminar el caso.",
        background: "#1C2526",
        color: "#fff",
        confirmButtonColor: "#8C7E97",
      });
    } finally {
      setResolvingCase(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetchData(`/chat/${id}/send`, {
        method: "POST",
        body: JSON.stringify({ message: newMessage }),
      });
      
      const sentMsg = response.data || response;
      if (sentMsg && sentMsg.id) {
        setMessages(prev => [...prev, sentMsg]);
        setNewMessage("");
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      const errorMessage = err.data?.message || err.message || "No se pudo enviar el mensaje.";
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar',
        text: errorMessage,
        background: "#1C2526",
        color: "#fff",
        confirmButtonColor: "#8C7E97",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading && !conversation) {
    return (
      <MainLayout roleName={userName}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  const otherUser = role === "client" ? conversation?.technician?.user : conversation?.client?.user;
  const otherUserName = otherUser?.name || conversation?.technician?.user?.name || conversation?.client?.user?.name || "Chat";

  return (
    <MainLayout roleName={userName}>
      <div className="flex flex-col h-[calc(100vh-180px)] bg-[#2f343b] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        {/* Header del Chat */}
        <div className="p-4 bg-[#8C7E97] flex items-center gap-4 text-white">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col flex-1">
            <span className="font-bold text-lg">{otherUserName}</span>
            <span className="text-xs text-white/70">{conversation?.service_case?.title}</span>
          </div>
          {/* Botón Terminar Caso visible desde el chat */}
          {role === "client" && (caseStatus === "active" || caseStatus === "pending") && (
            <button
              onClick={handleResolveFromChat}
              disabled={resolvingCase}
              title="Terminar caso y calificar técnico"
              className="flex items-center gap-2 bg-red-700 hover:bg-red-600 active:scale-95 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-lg shadow-black/40 border border-red-500/40 disabled:opacity-50"
            >
              <XCircle size={15} />
              Terminar Caso
            </button>
          )}
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              No hay mensajes aún. ¡Comienza la conversación!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id == userId;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                      isMe
                        ? "bg-[#8C7E97] text-white rounded-tr-none"
                        : "bg-[#1c2526] text-gray-200 rounded-tl-none border border-white/5"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <span className={`text-[10px] mt-1 block ${isMe ? "text-white/60 text-right" : "text-gray-500"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-[#1c2526] border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-[#2f343b] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#8C7E97] transition"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-[#8C7E97] p-2 rounded-xl text-white hover:bg-[#a493bd] disabled:opacity-50 transition"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ChatRoom;
