import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api";
import Swal from "sweetalert2";
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

  // Corrección: usar useEffect (no useState) para ejecutar el fetch al montar.
  // useState no acepta un array de dependencias como segundo argumento.
  useEffect(() => {
    const currentRole = localStorage.getItem('role');
    if (currentRole === 'admin') {
      fetchData('/admin/me').then(response => {
         const userData = response.data?.user || response.data || response.user;
         const spatieRoleFromArr = userData?.roles?.[0]?.name;
         const newRole = spatieRoleFromArr || userData?.spatie_role || response.data?.spatie_role || userData?.role || response.data?.role;

         if (newRole && newRole !== 'admin') {
           localStorage.setItem('role', newRole);
           window.location.reload();
         }
      }).catch(() => {});
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
      onClick: async () => {
        const result = await Swal.fire({
          title: '¿Cerrar sesión?',
          text: "Tendrás que ingresar tus credenciales nuevamente.",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#8C7E97',
          cancelButtonColor: '#4C5462',
          confirmButtonText: 'Sí, salir',
          cancelButtonText: 'Cancelar',
          background: '#1C2526',
          color: '#ffffff',
        });

        if (result.isConfirmed) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userName");
          localStorage.removeItem("technicianId");
          localStorage.removeItem("clientId");
          localStorage.removeItem("userId");
          
          Swal.fire({
            icon: 'success',
            title: 'Sesión cerrada',
            text: '¡Hasta pronto!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: '#1C2526',
            color: '#ffffff',
          });
          
          navigate("/login");
        }
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
