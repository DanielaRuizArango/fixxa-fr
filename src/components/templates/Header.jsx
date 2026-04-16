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

      {/* Lado derecho: campanita, nombre del rol e ícono de perfil */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        <span className="text-xl font-semibold">{roleName}</span>
        <button onClick={() => navigate(profileRoute)} aria-label="Profile">
          <User size={28} />
        </button>
      </div>
    </header>
  );
};

export default Header;
