import { User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../notifications/NotificationBell";

const Header = ({ roleName, profileRoute = "/customerProfile", onMenuToggle }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-[#8C7E97] flex justify-between items-center px-8 py-4 gap-2">
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

      {/* Lado derecho: nombre del rol e ícono e icon de notificaciones */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-2 border-l border-white/20 pl-4">
          <span className="text-xl font-semibold">{roleName}</span>
          <button onClick={() => navigate(profileRoute)} aria-label="Profile" className="hover:scale-110 transition-transform">
            <User size={28} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
