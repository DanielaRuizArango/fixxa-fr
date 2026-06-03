import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../templates/MainLayout";
import { fetchData, getProfileImageUrl, getChatOtherParticipant, getChatParticipantUser, getAcceptedProposal, getChatServiceCaseId } from "../../api";
import { Send, ArrowLeft, XCircle, Eye, User, Lock } from "lucide-react";
import Swal from "sweetalert2";
import echo from "../../echo";

const extractChatMessage = (payload) => {
  const raw = payload?.message ?? payload?.data?.message ?? payload?.data ?? payload;
  if (!raw || typeof raw !== "object") return null;
  return raw.id != null ? raw : null;
};

const upsertMessage = (list, msg) => {
  if (!msg) return list;
  const idx = list.findIndex((m) => m.id == msg.id);
  if (idx >= 0) {
    const next = [...list];
    next[idx] = msg;
    return next;
  }
  return [...list, msg];
};

const ChatRoom = () => {
  const { id } = useParams(); // conversation_id
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingWhisperRef = useRef(null);
  const channelRef = useRef(null);

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

    // 1. Suscribirse a Laravel Echo (WebSocket en tiempo real con Reverb)
    const channel = echo.private(`chat.${id}`);
    channelRef.current = channel;

    const onMessageSent = (e) => {
      const newMsg = extractChatMessage(e);
      if (!newMsg) return;
      setIsOtherTyping(false);
      clearTimeout(typingTimeoutRef.current);
      setMessages((prev) => upsertMessage(prev, newMsg));
    };

    const onTypingWhisper = (data) => {
      if (data?.userId != userId) {
        setIsOtherTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 2500);
      }
    };

    channel.listen(".message.sent", onMessageSent);
    channel.listenForWhisper("typing", onTypingWhisper);

    // 2. Polling híbrido de respaldo (Fallback)
    // Se ejecuta cada 15 segundos para sincronizar el estado del caso
    // Y actúa como respaldo de mensajes únicamente si el WebSocket se desconecta
    let intervalId = null;

    const syncChat = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const response = await fetchData(`/chat/${id}`);
        const convData = response.data?.conversation || response.conversation;
        if (convData) {
          setConversation(convData);
          if (convData.service_case?.status) {
            setCaseStatus(convData.service_case.status);
          }
        }

        // Si la conexión de Echo NO está activa, actualizamos mensajes por polling
        const isEchoConnected = echo.connector?.pusher?.connection?.state === 'connected';
        if (!isEchoConnected) {
          const newMessages = response.data?.messages || response.messages || [];
          setMessages(newMessages);
        }
      } catch (err) {
        console.error("Error sincronizando chat:", err);
      }
    };

    intervalId = setInterval(syncChat, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncChat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      channel.stopListening(".message.sent");
      channelRef.current = null;
      echo.leave(`chat.${id}`);
      clearInterval(intervalId);
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(typingWhisperRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, loadChat, userId]);

  useEffect(scrollToBottom, [messages]);

  const handleResolveFromChat = async () => {
    const serviceCaseId = getChatServiceCaseId(conversation);
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
    const text = newMessage.trim();
    if (!text || sending || isChatClosed) return;

    try {
      setSending(true);
      setNewMessage("");
      const response = await fetchData(`/chat/${id}/send`, {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });

      const sentMsg = extractChatMessage(response);
      if (sentMsg) {
        setMessages((prev) => upsertMessage(prev, sentMsg));
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      setNewMessage(text);
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

  const participant = getChatOtherParticipant(conversation, role);
  const otherUser = getChatParticipantUser(participant);
  const otherUserName = otherUser?.name
    || participant?.name
    || conversation?.technician?.user?.name
    || conversation?.client?.user?.name
    || "Chat";
  const otherUserImage = getProfileImageUrl(participant) || getProfileImageUrl(otherUser);
  const acceptedProposal = getAcceptedProposal(conversation);
  const isChatClosed = caseStatus === "resolved" || caseStatus === "cancelled";
  const serviceCaseId = getChatServiceCaseId(conversation);

  return (
    <MainLayout roleName={userName}>
      <div className="flex flex-col h-[calc(100vh-180px)] bg-[#2f343b] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        {/* Header del Chat */}
        <div className="p-4 bg-[#8C7E97] flex items-center gap-4 text-white">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30">
            {otherUserImage ? (
              <img src={otherUserImage} alt={otherUserName} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-white/80" />
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-lg truncate">{otherUserName}</span>
            <span className="text-xs text-white/70 truncate">{conversation?.service_case?.title}</span>
          </div>
          {/* Botón Ver Caso visible para ambos */}
          {serviceCaseId && (
            <button
              onClick={() => navigate(`/case-detail/${serviceCaseId}`)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition border border-white/20 mr-2"
              title="Ver detalles del caso"
            >
              <Eye size={15} />
              <span>Ver Caso</span>
            </button>
          )}
          {/* Botón Terminar Caso visible desde el chat */}
          {role === "client" && (caseStatus === "active" || caseStatus === "responded" || caseStatus === "pending") && (
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

        {/* Propuesta aceptada */}
        {acceptedProposal && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2">
              Propuesta aceptada
            </p>
            {acceptedProposal.estimated_cost != null && (
              <p className="text-sm font-bold text-white">
                Costo: ${parseInt(acceptedProposal.estimated_cost).toLocaleString()}
              </p>
            )}
            {acceptedProposal.questions && (
              <p className="text-xs text-gray-300 mt-2 italic">"{acceptedProposal.questions}"</p>
            )}
          </div>
        )}

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
          {isOtherTyping && (
            <div className="flex justify-start">
              <div className="bg-[#1c2526] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex items-center gap-1.5" aria-label={`${otherUserName} está escribiendo`}>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {isChatClosed ? (
          <div className="p-4 bg-[#1c2526] border-t border-white/10 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Lock size={16} />
            <span>
              {caseStatus === "resolved"
                ? "Este caso ha sido finalizado. No puedes enviar más mensajes."
                : "Este caso fue cancelado. El chat está cerrado."}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="p-4 bg-[#1c2526] border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                const value = e.target.value;
                setNewMessage(value);
                if (!value.trim() || isChatClosed) return;
                if (typingWhisperRef.current) clearTimeout(typingWhisperRef.current);
                typingWhisperRef.current = setTimeout(() => {
                  channelRef.current?.whisper("typing", { userId });
                }, 400);
              }}
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
        )}
      </div>
    </MainLayout>
  );
};

export default ChatRoom;
