import { User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Header = ({ roleName, profileRoute = "/customerProfile", onMenuToggle }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-[#8C7E97] flex justify-between items-center px-8 py-4 gap-2 shadow-md">
      {/* Botón hamburguesa - solo visible en móvil */}
      <button
        className="md:hidden text-white"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu size={28} />
      </button>

      {/* Espaciador para empujar el lado derecho */}
      <div className="hidden md:flex flex-1" />

      {/* Lado derecho: notificaciones, nombre del rol e ícono */}
      <div className="flex items-center gap-6">
        <NotificationBell />
        
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-white">{roleName}</span>
          <button 
            onClick={() => navigate(profileRoute)} 
            aria-label="Profile"
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <User size={28} className="text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
