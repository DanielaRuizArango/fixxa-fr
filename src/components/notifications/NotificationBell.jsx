import { useState, useEffect, useRef } from "react";
import { Bell, MessageSquare, Briefcase, Trash2, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const response = await fetchData("/notifications");
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Polling cada 30 segundos (en un entorno real usaríamos WebSockets con Laravel Echo)
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, event) => {
    event?.stopPropagation();
    try {
      await fetchData(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchData("/notifications/mark-as-read", { method: "POST" });
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date() })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read_at) {
      handleMarkAsRead(notif.id);
    }
    
    setIsOpen(false);
    
    // Navegación basada en el tipo
    const data = notif.data;
    if (data.type === 'new_message') {
      navigate(`/chat/${data.conversation_id}`);
    } else if (data.type === 'case_responded') {
      navigate(`/case-detail/${data.service_case_id}`);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#8C7E97]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#262f31] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1C2526]">
            <h3 className="font-bold text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] text-[#8C7E97] hover:text-white transition-colors flex items-center gap-1"
              >
                <CheckCircle size={12} />
                Marcar todo como leído
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Bell size={32} className="text-gray-600 mb-2 opacity-20" />
                <p className="text-sm text-gray-500 font-medium">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 cursor-pointer transition-colors relative ${!notif.read_at ? 'bg-[#8C7E97]/5' : ''}`}
                >
                  {!notif.read_at && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#8C7E97] rounded-full" />
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notif.data.type === 'new_message' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {notif.data.type === 'new_message' ? <MessageSquare size={18} /> : <Briefcase size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white mb-0.5 leading-tight">
                      {notif.data.title}
                    </p>
                    <p className="text-[10px] text-gray-400 line-clamp-2">
                      {notif.data.type === 'new_message' ? notif.data.text : `Tu caso "${notif.data.case_title}" recibió una propuesta.`}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-500">
                      <Clock size={10} />
                      {formatTime(notif.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 text-center bg-[#1C2526]">
              <button className="text-[10px] text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-widest">
                Ver historial completo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
