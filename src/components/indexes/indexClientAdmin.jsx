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
  Unlock
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

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (cityFilter) queryParams.append('city', cityFilter);

      const response = await fetchData(`/admin/clients?${queryParams.toString()}`);
      setClients(response.data?.data || response.data || []);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div key={client.id} className="bg-[#262f31]/80 border border-white/5 rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-[#262f31] shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1C2526] flex items-center justify-center border border-[#8C7E97]/30 flex-shrink-0">
                    {client.image ? (
                      <img src={`${import.meta.env.VITE_API_STORAGE_URL || ''}/${client.image}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Users size={24} className="text-[#8C7E97]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{client.name || client.user?.name}</h3>
                    <div className="flex flex-col gap-0.5 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1 truncate"><Mail size={12} className="flex-shrink-0" /> <span className="truncate">{client.email || client.user?.email}</span></span>
                      <span className="flex items-center gap-1 truncate"><MapPin size={12} className="flex-shrink-0" /> <span className="truncate">{client.city || client.user?.city || 'No especificada'}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  {localStorage.getItem('role') !== 'moderator' && (
                    <button 
                      onClick={() => handleBlockToggle(client.id)}
                      className={`p-2 rounded-lg transition-colors ${client.status === 'active' ? 'text-gray-400 hover:text-yellow-400' : 'text-yellow-400 hover:text-green-400'}`}
                      title={client.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                    >
                      {client.status === 'active' ? <Lock size={20} /> : <Unlock size={20} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default IndexClientAdmin;
