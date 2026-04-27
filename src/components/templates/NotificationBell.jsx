import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageSquare, FileText, X } from "lucide-react";
import { fetchData } from "../../api";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    
    const role = localStorage.getItem("role");
    const userId = parseInt(localStorage.getItem("userId"));

    const checkNotifications = async () => {
        if (!role || isNaN(userId)) return;
        
        try {
            let newNotifications = [];
            
            // 1. Verificar Chats (para Clientes y Técnicos)
            if (role === 'client' || role === 'technician') {
                const chatRes = await fetchData("/chat");
                const conversations = chatRes.data?.data || chatRes.data || [];
                
                conversations.forEach(conv => {
                    const lastMsg = conv.messages?.[0];
                    if (lastMsg && lastMsg.sender_id !== userId) {
                        // Verificar si ya lo marcamos como leído localmente
                        const lastReadId = localStorage.getItem(`last_read_msg_${conv.id}`);
                        if (lastReadId !== lastMsg.id.toString()) {
                            newNotifications.push({
                                id: `chat_${conv.id}_${lastMsg.id}`,
                                type: 'chat',
                                title: 'Nuevo mensaje',
                                description: lastMsg.message,
                                date: lastMsg.created_at,
                                link: `/chat/${conv.id}`,
                                originalId: lastMsg.id,
                                convId: conv.id
                            });
                        }
                    }
                });
            }

            // 2. Verificar Casos (para Clientes)
            if (role === 'client') {
                const casesRes = await fetchData("/client/cases");
                const cases = casesRes.data?.data || casesRes.data || [];
                
                cases.forEach(c => {
                    if (c.responses && c.responses.length > 0) {
                        const lastResponse = c.responses[c.responses.length - 1];
                        const lastSeenCount = parseInt(localStorage.getItem(`last_seen_responses_${c.id}`) || "0");
                        
                        if (c.responses.length > lastSeenCount) {
                            newNotifications.push({
                                id: `case_${c.id}_${c.responses.length}`,
                                type: 'case',
                                title: 'Nueva respuesta en caso',
                                description: `Tu caso "${c.title}" tiene ${c.responses.length - lastSeenCount} nueva(s) propuesta(s).`,
                                date: lastResponse.created_at,
                                link: `/case-detail/${c.id}`,
                                originalId: c.id,
                                newCount: c.responses.length
                            });
                        }
                    }
                });
            }

            // Ordenar por fecha descendente
            newNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            setNotifications(newNotifications);
            setUnreadCount(newNotifications.length);
        } catch (err) {
            console.error("Error al obtener notificaciones:", err);
        }
    };

    useEffect(() => {
        checkNotifications();

        /**
         * Polling de notificaciones como fallback temporal.
         * Se pausa automáticamente cuando la pestaña no está activa
         * para reducir peticiones innecesarias al servidor.
         */
        const interval = setInterval(() => {
            if (document.visibilityState !== 'hidden') {
                checkNotifications();
            }
        }, 30000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkNotifications();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (notif) => {
        // Marcar como leída localmente
        if (notif.type === 'chat') {
            localStorage.setItem(`last_read_msg_${notif.convId}`, notif.originalId.toString());
        } else if (notif.type === 'case') {
            localStorage.setItem(`last_seen_responses_${notif.originalId}`, notif.newCount.toString());
        }
        
        setIsOpen(false);
        navigate(notif.link);
        // Actualizar conteo inmediatamente
        checkNotifications();
    };

    const markAllAsRead = () => {
        notifications.forEach(notif => {
            if (notif.type === 'chat') {
                localStorage.setItem(`last_read_msg_${notif.convId}`, notif.originalId.toString());
            } else if (notif.type === 'case') {
                localStorage.setItem(`last_seen_responses_${notif.originalId}`, notif.newCount.toString());
            }
        });
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                aria-label="Notificaciones"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#8C7E97] animate-pulse">
                        {unreadCount > 9 ? '+9' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#1c2526] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 bg-[#262f31] border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-[#8C7E97]">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-[10px] text-gray-400 hover:text-white transition uppercase font-bold"
                            >
                                Marcar todo
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center flex flex-col items-center gap-2">
                                <div className="bg-[#1c2526] p-3 rounded-full">
                                    <Bell size={24} className="text-gray-600" />
                                </div>
                                <p className="text-sm text-gray-500 italic">No tienes novedades pendientes</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className="p-4 hover:bg-white/5 cursor-pointer transition flex gap-3 group"
                                    >
                                        <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${
                                            notif.type === 'chat' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                                        }`}>
                                            {notif.type === 'chat' ? <MessageSquare size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-white group-hover:text-[#8C7E97] transition">{notif.title}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{notif.description}</p>
                                            <p className="text-[10px] text-gray-500 mt-2 uppercase font-medium">
                                                {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-[#8C7E97] mt-2 self-start ring-4 ring-[#8C7E97]/10" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="p-3 bg-[#262f31] border-t border-white/10 text-center">
                             <p className="text-[10px] text-gray-500">Haz clic en una notificación para ver el detalle</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
