import { X, Power, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchData } from "../../api";

const Sidebar = ({ navItems = [], isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(null);
  const [workingHours, setWorkingHours] = useState("");
  const isTechnician = localStorage.getItem('role') === 'technician';

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
            
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <Clock size={14} className="text-[#8C7E97]" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-gray-500 leading-tight">Horario</span>
                <span className="text-[10px] text-gray-300 truncate w-32">{workingHours}</span>
              </div>
            </div>
          </div>
        )}

        {/* Ítems Administrativos (Accesibles para super_admin, admin y moderator) */}
        {['super_admin', 'admin', 'moderator'].includes(localStorage.getItem('role')) && (
          <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-white/10">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-4 mb-2">Administración</p>
            
            <button
              onClick={() => { navigate("/indexAdmin"); onClose?.(); }}
              className="block w-full text-left text-sm py-2.5 px-4 rounded-xl hover:bg-white/10 transition text-white"
            >
              Dashboard
            </button>

            {/* Solo el Super Admin ve la gestión de administradores */}
            {localStorage.getItem('role') === 'super_admin' && (
              <button
                onClick={() => { navigate("/manageAdmins"); onClose?.(); }}
                className="block w-full text-left text-sm py-2.5 px-4 rounded-xl hover:bg-white/10 transition text-white"
              >
                Administradores
              </button>
            )}

            <button
              onClick={() => { navigate("/indexClientAdmin"); onClose?.(); }}
              className="block w-full text-left text-sm py-2.5 px-4 rounded-xl hover:bg-white/10 transition text-white"
            >
              Clientes
            </button>
            <button
              onClick={() => { navigate("/indexTechnicianAdmin"); onClose?.(); }}
              className="block w-full text-left text-sm py-2.5 px-4 rounded-xl hover:bg-white/10 transition text-white"
            >
              Técnicos
            </button>
            <button
              onClick={() => { navigate("/indexCasesAdmin"); onClose?.(); }}
              className="block w-full text-left text-sm py-2.5 px-4 rounded-xl hover:bg-white/10 transition text-white"
            >
              Casos
            </button>
          </div>
        )}

        {/* Ítems de navegación generales */}
        {localStorage.getItem('role') === 'technician' && (
          <button
            onClick={() => { navigate("/my-ratings"); onClose?.(); }}
            className="block w-full text-left text-lg py-2 px-4 rounded hover:bg-[#8C7E97] transition box-border text-white mb-1"
          >
            Mis Calificaciones
          </button>
        )}
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick?.();
              onClose?.();
            }}
            className="block w-full text-left text-lg py-2 px-4 rounded hover:bg-[#8C7E97] transition box-border text-white"
          >
            {item.label}
          </button>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
