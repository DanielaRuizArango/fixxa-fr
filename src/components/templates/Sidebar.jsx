import { X, Power, Clock, Award, LayoutDashboard, ShieldAlert, Users, Wrench, FileText, Home, MessageSquare, LogOut, Star, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchData } from "../../api";

const Sidebar = ({ navItems = [], isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(null);
  const [workingHours, setWorkingHours] = useState("");
  const isTechnician = localStorage.getItem('role') === 'technician';

  const getNavIcon = (label) => {
    const norm = label.toLowerCase();
    if (norm.includes('inicio') || norm.includes('home')) {
      return <Home size={15} className="text-[#8C7E97]" />;
    }
    if (norm.includes('mensaje') || norm.includes('message') || norm.includes('chat')) {
      return <MessageSquare size={15} className="text-[#8C7E97]" />;
    }
    if (norm.includes('log out') || norm.includes('cerrar') || norm.includes('salir')) {
      return <LogOut size={15} className="text-[#8C7E97]" />;
    }
    if (norm.includes('calificacion') || norm.includes('rating') || norm.includes('estrella')) {
      return <Star size={15} className="text-[#8C7E97]" />;
    }
    return null;
  };

  useEffect(() => {
    if (isTechnician) {
      const loadStatus = async () => {
        try {
          const response = await fetchData('/technician/me');
          setIsAvailable(response.data?.technician?.is_available);
          setWorkingHours(response.data?.technician?.working_hours || "Sin horario");
        } catch (err) {
          console.error("Error loading technician status in sidebar", err);
        }
      };
      loadStatus();
    }
  }, [isTechnician]);

  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      // Para actualizar solo la disponibilidad, necesitamos enviar los campos requeridos por el UpdateProfileRequest
      // o crear un endpoint específico. Por simplicidad ahora usaremos el endpoint de perfil.
      // Primero cargamos el resto de datos para no sobrescribir con nulo
      const profile = await fetchData('/technician/me');
      const data = profile.data;

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('city', data.city);
      formData.append('address', data.address);
      formData.append('experience', data.technician?.experience);
      formData.append('title', data.technician?.title);
      formData.append('is_available', newStatus ? '1' : '0');

      await fetchData('/technician/profile', {
        method: 'POST',
        body: formData,
      });

      setIsAvailable(newStatus);
    } catch (err) {
      console.error("Error toggling availability", err);
    }
  };
  return (
    <>
      {/* Overlay oscuro en móvil cuando el sidebar está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30
          w-64 bg-gradient-to-b from-[#0F2027] to-[#203A43]
          p-6 space-y-4
          transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:h-auto md:min-h-[calc(100vh-72px-56px)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Botón cerrar - solo en móvil */}
        <div className="flex justify-end md:hidden">
          <button onClick={onClose} aria-label="Close menu">
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Sección de Disponibilidad (Solo Técnicos) */}
        {isTechnician && isAvailable !== null && (
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Power size={16} className={isAvailable ? "text-green-400" : "text-gray-500"} />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  {isAvailable ? "En Línea" : "Desconectado"}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAvailable} 
                  onChange={toggleAvailability}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            
            <div className="flex items-start gap-2 pt-2 border-t border-white/5">
              <Clock size={14} className="text-[#8C7E97] shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[9px] uppercase font-bold text-gray-500 leading-tight">Horario</span>
                <span className="text-[10px] text-gray-300 break-words whitespace-normal leading-relaxed">{workingHours}</span>
              </div>
            </div>
          </div>
        )}

        {/* Renderizado de Ítems de Navegación */}
        {(() => {
          const role = localStorage.getItem('role');
          let allItems = [...navItems];

          if (['super_admin', 'admin', 'moderator'].includes(role)) {
            allItems.push({ label: "Dashboard", onClick: () => navigate("/indexAdmin"), icon: <LayoutDashboard size={15} className="text-[#8C7E97]" /> });
            if (role === 'super_admin') {
              allItems.push({ label: "Administradores", onClick: () => navigate("/manageAdmins"), icon: <ShieldAlert size={15} className="text-[#8C7E97]" /> });
            }
            allItems.push({ label: "Clientes", onClick: () => navigate("/indexClientAdmin"), icon: <Users size={15} className="text-[#8C7E97]" /> });
            allItems.push({ label: "Técnicos", onClick: () => navigate("/indexTechnicianAdmin"), icon: <Wrench size={15} className="text-[#8C7E97]" /> });
            allItems.push({ label: "Revisión de Documentos", onClick: () => navigate("/admin/certifications"), icon: <Award size={15} className="text-[#8C7E97]" /> });
            allItems.push({ label: "Casos", onClick: () => navigate("/indexCasesAdmin"), icon: <FileText size={15} className="text-[#8C7E97]" /> });
            allItems.push({ label: "Bitácora (Logs)", onClick: () => navigate("/admin/logs"), icon: <Terminal size={15} className="text-[#8C7E97]" /> });
          }

          if (role === 'technician') {
            allItems.push({ label: "Mis Propuestas y Trabajos", onClick: () => navigate("/my-proposals"), icon: <FileText size={15} className="text-[#8C7E97]" /> });
            allItems.push({ label: "Mis Calificaciones", onClick: () => navigate("/my-ratings"), icon: <Star size={15} className="text-[#8C7E97]" /> });
          }

          if (role === 'client') {
            allItems.push({ label: "Técnicos Calificados", onClick: () => navigate("/client-ratings"), icon: <Star size={15} className="text-[#8C7E97]" /> });
          }

          const inicioItem = allItems.find(item => item.label.toLowerCase() === 'inicio' || item.label.toLowerCase() === 'dashboard');
          const logoutItem = allItems.find(item => item.label.toLowerCase() === 'log out' || item.label.toLowerCase() === 'cerrar sesión');
          
          const restItems = allItems.filter(item => 
            item.label.toLowerCase() !== 'inicio' && 
            item.label.toLowerCase() !== 'dashboard' && 
            item.label.toLowerCase() !== 'log out' && 
            item.label.toLowerCase() !== 'cerrar sesión'
          );

          restItems.sort((a, b) => a.label.localeCompare(b.label));

          const sortedNavItems = [];
          if (inicioItem) sortedNavItems.push(inicioItem);
          sortedNavItems.push(...restItems);
          
          return (
            <div className="flex flex-col gap-2 mt-4">
              {sortedNavItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick?.();
                    onClose?.();
                  }}
                  className="flex items-center gap-2 w-full text-left text-sm py-2.5 px-4 rounded-xl hover:bg-white/10 transition text-white"
                >
                  {item.icon ? item.icon : getNavIcon(item.label)}
                  <span>{item.label}</span>
                </button>
              ))}
              
              {/* Separador para Log out */}
              {logoutItem && (
                <div className="mt-auto pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      logoutItem.onClick?.();
                      onClose?.();
                    }}
                    className="flex items-center gap-2 w-full text-left text-sm py-2.5 px-4 rounded-xl hover:bg-red-500/10 text-red-400 transition"
                  >
                    {logoutItem.icon ? logoutItem.icon : getNavIcon(logoutItem.label)}
                    <span>{logoutItem.label}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </aside>
    </>
  );
};

export default Sidebar;
