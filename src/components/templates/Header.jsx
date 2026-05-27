import { User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useState, useEffect } from "react";
import { fetchData, getStorageUrl } from "../../api";

const Header = ({ roleName, profileRoute = "/customerProfile", onMenuToggle }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const fetchProfile = async () => {
      try {
        let endpoint = "";
        if (role === "client") endpoint = "/client/me";
        else if (role === "technician") endpoint = "/technician/me";
        else endpoint = "/admin/me";

        const res = await fetchData(endpoint);
        const userData = res.data?.user || res.data || res.user || res;
        if (userData?.image) {
          setProfileImage(getStorageUrl(userData.image));
        }
      } catch (err) {
        console.error("Error fetching profile image", err);
      }
    };
    if (role) {
      fetchProfile();
    }
  }, []);

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
        <button 
          onClick={() => navigate(profileRoute)} 
          aria-label="Profile"
          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 border-2 border-white/20 hover:border-white/50 transition-colors"
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-gray-600" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
