import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

/**
 * MainLayout - Layout principal de la aplicación
 *
 * Props:
 *  - roleName     {string}   Nombre del rol (ej: "Customer", "Technical")
 *  - profileRoute {string}   Ruta al perfil (default: "/customerProfile")
 *  - navItems     {Array}    [{label, onClick}] ítems del sidebar
 *  - children     {node}     Contenido del <main>
 */
const MainLayout = ({ roleName, profileRoute, navItems = [], children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const defaultNavItems = [
    {
      label: "Log out",
      onClick: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      },
    },
    ...navItems,
  ];

  return (
    <div className="min-h-screen bg-[#2B2F36] font-['Kadwa'] text-white flex flex-col">
      {/* Header */}
      <Header
        roleName={roleName}
        profileRoute={profileRoute}
        onMenuToggle={() => setSidebarOpen(true)}
      />

      {/* Cuerpo: Sidebar + contenido */}
      <div className="flex flex-1">
        <Sidebar
          navItems={defaultNavItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Contenido principal */}
        <main className="flex-1 p-10 relative">{children}</main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
