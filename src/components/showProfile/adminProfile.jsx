import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Shield, 
  Pencil, 
  Settings,
  Calendar,
  LogOut
} from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // Intentamos cargar el perfil del administrador actual
        const response = await fetchData('/admin/me');
        setAdmin(response.data);
      } catch (err) {
        setError("Error al cargar tu perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  if (loading) {
    return (
      <MainLayout roleName="Administrator" profileRoute="/adminProfile">
        <div className="flex flex-col items-center justify-center pt-20">
          <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Cargando perfil...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !admin) {
    return (
      <MainLayout roleName="Administrator" profileRoute="/adminProfile">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
           <p className="text-red-200">{error || "No se pudo cargar la información del perfil."}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      roleName={admin.name} 
      profileRoute="/adminProfile"
    >
      <div className="flex flex-col gap-8 pb-20">
        {/* Cabecera de Perfil */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-[#8C7E97] to-[#5a5163] rounded-3xl w-full"></div>
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="w-32 h-32 rounded-3xl bg-[#1C2526] border-4 border-[#2B2F36] overflow-hidden shadow-xl">
              {admin.image ? (
                <img 
                  src={admin.image.startsWith('http') ? admin.image : `${import.meta.env.VITE_API_STORAGE_URL || ''}/${admin.image}`} 
                  alt={admin.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-[#8C7E97] font-bold">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-white">{admin.name}</h1>
              <div className="flex items-center gap-2 text-white/60">
                <Shield size={16} />
                <span className="text-sm font-medium uppercase tracking-widest">Administrator</span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => navigate(`/editAdmin/${admin.id}`)}
              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl backdrop-blur-md transition-all text-white"
              title="Editar Perfil"
            >
              <Pencil size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/40 p-2.5 rounded-xl backdrop-blur-md transition-all text-red-200"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Información Detallada */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          
          {/* Columna Izquierda: Info básica */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#262f31] border border-white/5 rounded-3xl p-8 space-y-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <User size={20} className="text-[#8C7E97]" />
                Información Personal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="bg-[#1C2526] p-3 rounded-2xl">
                    <Mail size={18} className="text-[#8C7E97]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Correo Electrónico</p>
                    <p className="text-white font-medium">{admin.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#1C2526] p-3 rounded-2xl">
                    <Phone size={18} className="text-[#8C7E97]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Teléfono</p>
                    <p className="text-white font-medium">{admin.phone || "No especificado"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#1C2526] p-3 rounded-2xl">
                    <MapPin size={18} className="text-[#8C7E97]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Ubicación</p>
                    <p className="text-white font-medium">{admin.city ? `${admin.city}, ${admin.address || ''}` : "No especificada"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#1C2526] p-3 rounded-2xl">
                    <CreditCard size={18} className="text-[#8C7E97]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Identificación</p>
                    <p className="text-white font-medium">{admin.id_number ? `${admin.type_id || 'ID'}: ${admin.id_number}` : "No especificada"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Estadísticas / Info adicional */}
          <div className="space-y-6">
            <div className="bg-[#262f31] border border-white/5 rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Settings size={20} className="text-[#8C7E97]" />
                Cuenta
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#1C2526] rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-[#8C7E97]" />
                    <span className="text-sm">Estado</span>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${admin.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {admin.status}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1C2526] rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-[#8C7E97]" />
                    <span className="text-sm">Miembro desde</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <button 
                  onClick={() => navigate(`/editAdmin/${admin.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#8C7E97] hover:bg-[#77678a] transition-all rounded-2xl font-bold text-sm uppercase tracking-widest"
                >
                  <Pencil size={18} />
                  Editar Datos
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default AdminProfile;
