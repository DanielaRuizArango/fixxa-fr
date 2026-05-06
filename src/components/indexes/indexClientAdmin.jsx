import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Pencil, 
  Trash2, 
  Search,
  Mail,
  Phone,
  AlertCircle,
  Users,
  MapPin,
  Lock,
  Unlock,
  Eye
} from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";

const IndexClientAdmin = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadClients = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (cityFilter) queryParams.append('city', cityFilter);
      queryParams.append('page', page);

      const response = await fetchData(`/admin/clients?${queryParams.toString()}`);
      const newData = response.data?.data || [];
      
      if (append) {
        setClients(prev => [...prev, ...newData]);
      } else {
        setClients(newData);
      }
      
      setHasMore(!!response.data?.next_page_url);
      setCurrentPage(page);
    } catch (err) {
      setError("Error al cargar la lista de clientes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, cityFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadClients();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [loadClients]);

  const handleBlockToggle = async (id) => {
    try {
      const response = await fetchData(`/admin/clients/${id}/block`, {
        method: 'PATCH'
      });
      
      setClients(clients.map(client => 
        client.id === id ? { ...client, status: response.data.status } : client
      ));
    } catch (err) {
      alert("Error al actualizar el estado del cliente.");
      console.error(err);
    }
  };

  return (
    <MainLayout roleName="Administrator" profileRoute="/adminProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <div>
          <h1 className="text-2xl font-bold font-['Kadwa']">Gestión de Clientes</h1>
          <p className="text-gray-400 text-sm">Administra los usuarios registrados como clientes</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#262f31]/50 border border-white/5 rounded-2xl focus:border-[#8C7E97] focus:outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#262f31]/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8C7E97] cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="blocked">Bloqueados</option>
            </select>

            <input
              type="text"
              placeholder="Ciudad..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-[#262f31]/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8C7E97] w-32"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Obteniendo clientes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
             <AlertCircle className="mx-auto mb-2 text-red-500" />
             <p className="text-red-200">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div key={client.id} className="bg-[#1C2526] border border-white/5 rounded-3xl p-6 flex flex-col justify-between transition-all hover:border-[#8C7E97]/50 shadow-xl group">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#262f31] flex items-center justify-center border border-[#8C7E97]/20 flex-shrink-0 group-hover:border-[#8C7E97]/50 transition-colors">
                        {client.image ? (
                          <img src={`${import.meta.env.VITE_API_STORAGE_URL || ''}/${client.image}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <Users size={32} className="text-[#8C7E97]/50" />
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${client.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {client.status === 'active' ? 'Activo' : 'Bloqueado'}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-white group-hover:text-[#8C7E97] transition-colors truncate">
                        {client.name}
                      </h3>
                      <p className="text-gray-500 text-sm truncate">{client.email}</p>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-3 text-xs text-gray-400 bg-black/20 p-2 rounded-xl">
                        <Phone size={14} className="text-[#8C7E97]" />
                        <span>{client.phone || 'No registrado'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 bg-black/20 p-2 rounded-xl">
                        <MapPin size={14} className="text-[#8C7E97]" />
                        <span className="truncate">{client.city || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 bg-black/20 p-2 rounded-xl">
                        <AlertCircle size={14} className="text-[#8C7E97]" />
                        <span>ID: {client.id_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
                    <button 
                      onClick={() => navigate(`/admin/client-detail/${client.id}`)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white/5 text-[#8C7E97] hover:bg-[#8C7E97]/10 border border-[#8C7E97]/20"
                    >
                      <Eye size={14} />
                      <span>Ver Expediente</span>
                    </button>
                    {localStorage.getItem('role') !== 'moderator' && (
                      <button 
                        onClick={() => handleBlockToggle(client.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          client.status === 'active' 
                          ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20' 
                          : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20'
                        }`}
                      >
                        {client.status === 'active' ? (
                          <>
                            <Lock size={14} />
                            <span>Bloquear Acceso</span>
                          </>
                        ) : (
                          <>
                            <Unlock size={14} />
                            <span>Restaurar Acceso</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button 
                  onClick={() => loadClients(currentPage + 1, true)}
                  className="px-8 py-3 bg-[#8C7E97] hover:bg-[#8C7E97]/80 text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#8C7E97]/20 active:scale-95"
                >
                  Cargar más clientes
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default IndexClientAdmin;
