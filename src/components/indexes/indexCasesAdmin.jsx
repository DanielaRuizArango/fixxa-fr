import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search,
  Eye,
  Calendar,
  User,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  DollarSign
} from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData } from "../../api";

const IndexCasesAdmin = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        const response = await fetchData('/admin/cases');
        setCases(response.data?.data || response.data || []);
      } catch (err) {
        setError("Error al cargar la lista de casos de servicio.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  const filteredCases = cases.filter(caseItem => 
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.client?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      responded: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      resolved: 'bg-green-500/10 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
    };

    return (
      <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${statusStyles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <MainLayout 
      roleName="Administrator" 
      profileRoute="/adminProfile"
    >
      <div className="flex flex-col gap-6 pt-4 pb-20">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold font-['Kadwa']">Gestión de Casos</h1>
            <p className="text-gray-400 text-sm">Supervisa todos los requerimientos de servicio en la plataforma</p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título, cliente o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#262f31]/50 border border-white/5 rounded-2xl focus:border-[#8C7E97] focus:outline-none transition-all placeholder:text-gray-600"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Cargando casos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
             <AlertCircle className="mx-auto mb-2 text-red-500" />
             <p className="text-red-200">{error}</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-[#2B2F36] border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center">
            <div className="bg-[#1C2526] p-5 rounded-full mb-4">
              <FileText size={40} className="text-[#8C7E97]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No se encontraron casos</h2>
            <p className="text-gray-400 max-w-sm">
              {searchTerm ? "No hay resultados para tu búsqueda." : "Aún no se han creado casos en el sistema."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((caseItem) => (
              <div 
                key={caseItem.id}
                onClick={() => navigate(`/case-detail/${caseItem.id}`)}
                className="bg-[#262f31]/80 hover:bg-[#262f31] border border-white/5 rounded-2xl p-5 flex flex-col transition-all shadow-md group cursor-pointer border-b-4 border-b-transparent hover:border-b-[#8C7E97] relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  {getStatusBadge(caseItem.status)}
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    <Calendar size={10} />
                    {formatDate(caseItem.created_at)}
                  </div>
                </div>

                <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-[#8C7E97] transition-colors">
                  {caseItem.title}
                </h3>
                
                <p className="text-gray-400 text-xs line-clamp-2 mb-4 flex-grow">
                  {caseItem.description}
                </p>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-6 h-6 rounded-full bg-[#1C2526] flex items-center justify-center text-[10px] text-[#8C7E97] border border-white/5">
                        {caseItem.client?.user?.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="truncate max-w-[120px]">{caseItem.client?.user?.name}</span>
                        {caseItem.city && (
                          <span className="text-[9px] text-gray-500 font-medium">{caseItem.city}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-500" title="Respuestas">
                        <MessageSquare size={12} />
                        <span className="text-[10px] font-bold">{caseItem.responses?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {caseItem.status === 'responded' && caseItem.responses?.length > 0 && (
                  <div className="mt-3 bg-indigo-500/5 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] text-indigo-300 uppercase font-bold tracking-wider">
                      <DollarSign size={10} />
                      Última Cotización
                    </div>
                    <span className="text-white font-bold text-xs">
                      ${parseInt(caseItem.responses[caseItem.responses.length - 1].estimated_cost).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default IndexCasesAdmin;
