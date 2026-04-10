import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  UserPlus, 
  Shield, 
  Lock, 
  Unlock, 
  Search,
  MoreVertical,
  Mail,
  Phone,
  AlertCircle
} from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";

const IndexAdmin = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setLoading(true);
        // Cargar datos del usuario actual para evitar auto-bloqueo
        const meResponse = await fetchData('/admin/me').catch(() => ({ data: { id: null } }));
        setCurrentUser(meResponse.data);

        // Cargar lista de administradores
        const response = await fetchData('/admin/admins');
        setAdmins(response.data || []);
      } catch (err) {
        setError("Error al cargar la lista de administradores.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAdmins();
  }, []);

  const handleBlockToggle = async (id) => {
    if (currentUser && currentUser.id === id) {
      alert("No puedes bloquear tu propia cuenta.");
      return;
    }

    try {
      const response = await fetchData(`/admin/admins/${id}/block`, {
        method: 'PATCH'
      });
      
      setAdmins(admins.map(admin => 
        admin.id === id ? { ...admin, status: response.data.status } : admin
      ));
    } catch (err) {
      alert("Error al actualizar el estado del administrador.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (currentUser && currentUser.id === id) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas eliminar este administrador? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await fetchData(`/admin/admins/${id}`, {
        method: 'DELETE'
      });
      setAdmins(admins.filter(admin => admin.id !== id));
    } catch (err) {
      alert("Error al eliminar el administrador.");
      console.error(err);
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const isActive = status === 'active';
    return (
      <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${
        isActive 
        ? 'bg-green-500/10 text-green-400 border-green-500/30' 
        : 'bg-red-500/10 text-red-400 border-red-500/30'
      }`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <MainLayout 
      roleName="Administrator" 
      profileRoute="/adminProfile"
    >
      <div className="flex flex-col gap-6 pt-4 pb-20">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold font-['Kadwa']">Gestión de Administradores</h1>
            <p className="text-gray-400 text-sm">Administra los usuarios con acceso al panel de control</p>
          </div>
          <button 
            onClick={() => navigate("/adminForm")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#8C7E97] text-white rounded-xl hover:bg-[#77678a] transition shadow-lg"
          >
            <UserPlus size={18} />
            <span>Nuevo Administrador</span>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#262f31]/50 border border-white/5 rounded-2xl focus:border-[#8C7E97] focus:outline-none transition-all placeholder:text-gray-600"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Obteniendo administradores...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
             <AlertCircle className="mx-auto mb-2 text-red-500" />
             <p className="text-red-200">{error}</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="bg-[#2B2F36] border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center">
            <div className="bg-[#1C2526] p-5 rounded-full mb-4">
              <Shield size={40} className="text-[#8C7E97]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No se encontraron administradores</h2>
            <p className="text-gray-400 max-w-sm">
              {searchTerm ? "No hay resultados para tu búsqueda." : "No hay otros administradores registrados."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAdmins.map((admin) => (
              <div 
                key={admin.id}
                className="bg-[#262f31]/80 hover:bg-[#262f31] border border-white/5 rounded-2xl p-5 flex flex-col transition-all shadow-md group border-b-4 border-b-transparent hover:border-b-[#8C7E97]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#8C7E97]/30 bg-[#1C2526]">
                      {admin.image ? (
                        <img 
                          src={admin.image.startsWith('http') ? admin.image : `${import.meta.env.VITE_API_STORAGE_URL || ''}/${admin.image}`} 
                          alt={admin.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8C7E97] font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">{admin.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(admin.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => navigate(`/editAdmin/${admin.id}`)}
                      className="p-1.5 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => handleBlockToggle(admin.id)}
                      className={`p-1.5 transition-colors hover:bg-white/5 rounded-lg ${admin.status === 'active' ? 'text-gray-400 hover:text-yellow-400' : 'text-yellow-400 hover:text-green-400'}`}
                      title={admin.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                    >
                      {admin.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(admin.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors hover:bg-white/5 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Mail size={14} className="text-[#8C7E97]" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  {admin.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Phone size={14} className="text-[#8C7E97]" />
                      <span>{admin.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider">
                  <span>ID: {admin.id_number || 'N/A'}</span>
                  <span className="bg-[#8C7E97]/10 text-[#8C7E97] px-2 py-0.5 rounded-md border border-[#8C7E97]/20">
                    {admin.spatie_role || admin.role || 'Admin'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {!loading && (
        <button
          onClick={() => navigate("/adminForm")}
          className="fixed bottom-10 right-10 bg-[#8C7E97] p-4 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-white hover:bg-[#a493bd] group"
          title="Nuevo Administrador"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

    </MainLayout>
  );
};

export default IndexAdmin;
