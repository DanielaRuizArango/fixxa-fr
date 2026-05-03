import { useNavigate } from "react-router-dom";
import { Plus, Users, Image as ImageIcon, MapPin } from "lucide-react";
import MainLayout from "../templates/MainLayout";
import { fetchData, getStorageUrl } from "../../api";
import { useState, useEffect } from "react";

const IndexTechnical = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Technical");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Cargar nombre del usuario
        const userResponse = await fetchData('/technician/me');
        setUserName(userResponse.data?.name || "Technical");
        
        // Cargar solicitudes activas
        const casesResponse = await fetchData('/technician/cases');
        setCases(casesResponse.data?.data || casesResponse.data || []);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar las solicitudes.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default: return 'bg-[#1C2526] text-[#c8d2d4] border-[#3f4b4d]';
    }
  };

  return (
    <MainLayout roleName={localStorage.getItem('userName') || userName} profileRoute="/technicianProfile">
      <div className="flex flex-col gap-6 pt-4 pb-20">
        
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold font-['Kadwa']">Solicitudes Activas</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-4 border-[#8C7E97] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Obteniendo solicitudes...</p>
          </div>
        ) : error ? (
          <div className="text-center pt-20">
            <p className="text-red-400 mb-4">{error}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center pt-20">
            <p className="text-gray-400">No hay solicitudes activas en este momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-[#262f31]/80 hover:bg-[#262f31] border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all cursor-pointer shadow-lg group"
                onClick={() => navigate(`/case-detail/${caseItem.id}`)}
              >
                {/* Imagen del caso */}
                <div className="w-full md:w-48 h-48 md:h-auto bg-[#1c2526] relative overflow-hidden">
                  {caseItem.images && caseItem.images.length > 0 ? (
                    <img 
                      src={getStorageUrl(caseItem.images[0].image_path)} 
                      alt={caseItem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <ImageIcon size={40} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-[#1c2526]/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-gray-300 font-mono">
                    FTS-{caseItem.id.toString().padStart(6, '0')}
                  </div>
                </div>

                <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#8C7E97] transition-colors line-clamp-1">
                        {caseItem.title || caseItem.name || 'Solicitud de Servicio'}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                      {caseItem.description || 'Sin descripción detallada.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                      <MapPin size={14} className="text-[#8C7E97]" />
                      <span>{caseItem.client?.user?.city || caseItem.location || 'No especificada'}</span>
                    </div>

                    <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${caseItem.service_type === 'remote' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-orange-500/10 text-orange-300 border-orange-500/20'}`}>
                      <span className="font-semibold">
                        {caseItem.service_type === 'remote' ? 'REMOTA' : 'PRESENCIAL'}
                      </span>
                    </div>

                    {caseItem.responses?.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                        <Users size={14} />
                        <span className="font-semibold">
                          {caseItem.responses.length} {caseItem.responses.length === 1 ? 'técnico interesado' : 'técnicos interesados'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </MainLayout>
  );
};

export default IndexTechnical;