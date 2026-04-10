import { useState, useEffect } from "react";
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

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const response = await fetchData('/admin/clients');
        setClients(response.data || []);
      } catch (err) {
        setError("Error al cargar la lista de clientes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

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

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout roleName="Administrator" profileRoute="/adminProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <div>
          <h1 className="text-2xl font-bold font-['Kadwa']">Gestión de Clientes</h1>
          <p className="text-gray-400 text-sm">Administra los usuarios registrados como clientes</p>
        </div>

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
            <p className="mt-4 text-gray-400">Obteniendo clientes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
             <AlertCircle className="mx-auto mb-2 text-red-500" />
             <p className="text-red-200">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-[#262f31]/80 border border-white/5 rounded-2xl p-5 flex justify-between items-center transition-all hover:bg-[#262f31] shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1C2526] flex items-center justify-center border border-[#8C7E97]/30">
                    {client.image ? (
                      <img src={`${import.meta.env.VITE_API_STORAGE_URL || ''}/${client.image}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Users size={24} className="text-[#8C7E97]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{client.name}</h3>
                    <div className="flex flex-col gap-0.5 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Mail size={12} /> {client.email}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {client.city || 'No especificada'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBlockToggle(client.id)}
                    className={`p-2 rounded-lg transition-colors ${client.status === 'active' ? 'text-gray-400 hover:text-yellow-400' : 'text-yellow-400 hover:text-green-400'}`}
                    title={client.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                  >
                    {client.status === 'active' ? <Lock size={20} /> : <Unlock size={20} />}
                  </button>
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
