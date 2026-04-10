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

  // Intentar "ascender" el rol si es genérico 'admin'
  useState(() => {
    const currentRole = localStorage.getItem('role');
    if (currentRole === 'admin') {
      import('../../api').then(({ fetchData }) => {
        fetchData('/admin/me').then(response => {
           const userData = response.data?.user || response.data || response.user;
           const spatieRoleFromArr = userData?.roles?.[0]?.name;
           const newRole = spatieRoleFromArr || userData?.spatie_role || response.data?.spatie_role || userData?.role || response.data?.role;
           
           if (newRole && newRole !== 'admin') {
             localStorage.setItem('role', newRole);
             window.location.reload();
           }
        }).catch(() => {});
      });
    }
  }, []);

  const defaultNavItems = [
    {
      label: "Inicio",
      onClick: () => {
        const role = localStorage.getItem("role");
        if (role === "client") navigate("/indexCustomer");
        else if (role === "technician") navigate("/indexTechnician");
        else if (role === "super_admin") navigate("/indexAdmin");
        else navigate("/indexClientAdmin");
      },
    },
    // Solo mostrar Mensajes si NO es admin/moderador/super_admin
    ...(['super_admin', 'admin', 'moderator'].includes(localStorage.getItem('role')) ? [] : [
      {
        label: "Mensajes",
        onClick: () => navigate("/messages"),
      }
    ]),
    {
      label: "Log out",
      onClick: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("technicianId");
        localStorage.removeItem("clientId");
        localStorage.removeItem("userId");
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
